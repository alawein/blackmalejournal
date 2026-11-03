CREATE TABLE public.stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  stripe_created timestamptz NOT NULL,
  subscription_id text,
  applied_member_id uuid,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX stripe_events_deletion_idx ON public.stripe_events (subscription_id)
  WHERE type = 'customer.subscription.deleted';
-- Accepted membership events, including unchanged tiers, advance the member's last accepted event time.
CREATE INDEX stripe_events_member_time_idx ON public.stripe_events (applied_member_id, stripe_created DESC)
  WHERE applied_member_id IS NOT NULL;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_events FROM PUBLIC, anon, authenticated;
GRANT INSERT, SELECT, UPDATE (applied_member_id) ON public.stripe_events TO service_role;

-- One RPC transaction owns both receipt and membership write. A failed write rolls back the receipt.
CREATE FUNCTION public.apply_stripe_membership_event(
  p_event_id text, p_event_type text, p_stripe_created timestamptz,
  p_subscription_id text, p_customer_id text, p_member_id uuid, p_tier text
) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  member_id uuid;
  current_tier text;
  current_sub text;
  last_change timestamptz;
BEGIN
  IF p_event_type NOT IN ('checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted') THEN
    RAISE EXCEPTION 'Unsupported membership event';
  END IF;

  -- Separate event IDs for the same subscription can arrive simultaneously.
  IF p_subscription_id IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_subscription_id, 0));
  END IF;

  INSERT INTO public.stripe_events (id, type, stripe_created, subscription_id)
    VALUES (p_event_id, p_event_type, p_stripe_created, p_subscription_id)
    ON CONFLICT (id) DO NOTHING;
  IF NOT FOUND THEN RETURN 'duplicate'; END IF;

  -- Canceled subscriptions cannot be reactivated. A new purchase has a new subscription ID.
  IF p_event_type <> 'customer.subscription.deleted' AND EXISTS (
    SELECT FROM public.stripe_events
    WHERE subscription_id = p_subscription_id AND type = 'customer.subscription.deleted'
  ) THEN RETURN 'superseded'; END IF;

  -- Cross-subscription checkouts and subscription events must serialize on the same member.
  BEGIN
    IF p_event_type = 'checkout.session.completed' THEN
      SELECT m.id, m.tier, m.stripe_subscription_id INTO STRICT member_id, current_tier, current_sub
        FROM public.members m WHERE m.id = p_member_id FOR UPDATE;
    ELSE
      SELECT m.id, m.tier, m.stripe_subscription_id INTO STRICT member_id, current_tier, current_sub
        FROM public.members m WHERE m.stripe_customer_id = p_customer_id FOR UPDATE;
    END IF;
  EXCEPTION WHEN no_data_found THEN
    -- A deletion before checkout must be remembered. Other deliveries must be retryable.
    IF p_event_type = 'customer.subscription.deleted' THEN RETURN 'superseded'; END IF;
    RAISE EXCEPTION 'Membership row is not available';
  END;

  SELECT max(stripe_created) INTO last_change FROM public.stripe_events WHERE applied_member_id = member_id;
  IF p_event_type = 'customer.subscription.deleted' THEN
    IF current_sub IS NOT NULL AND current_sub IS DISTINCT FROM p_subscription_id THEN RETURN 'superseded'; END IF;
    -- A deletion for an already free, unlinked member is a tombstone only.
    IF current_sub IS NULL AND (current_tier = 'free' OR last_change > p_stripe_created) THEN RETURN 'superseded'; END IF;
    UPDATE public.members SET tier = 'free', stripe_subscription_id = NULL WHERE id = member_id;
  ELSE
    IF last_change > p_stripe_created THEN
      IF p_event_type = 'checkout.session.completed' AND current_sub IS NOT NULL
        AND current_sub IS DISTINCT FROM p_subscription_id THEN
        RAISE EXCEPTION 'Older checkout for a different linked subscription; reconciliation required';
      END IF;
      RETURN 'superseded';
    END IF;
    IF p_event_type = 'customer.subscription.updated' AND current_sub IS DISTINCT FROM p_subscription_id AND (
      current_sub IS NOT NULL OR EXISTS (SELECT FROM public.stripe_events WHERE applied_member_id = member_id
        AND type = 'customer.subscription.deleted')
    ) THEN
      RAISE EXCEPTION 'Subscription customer is not linked to this subscription yet';
    END IF;

    -- Stripe does not order distinct snapshots within one second. Leave a conflict
    -- retryable for reconciliation instead of arbitrarily selecting a tier or a subscription.
    IF last_change = p_stripe_created AND (
      current_tier IS DISTINCT FROM p_tier OR
      (p_event_type = 'checkout.session.completed' AND current_sub IS DISTINCT FROM p_subscription_id)
    ) AND NOT (
      -- A terminal cancellation and a purchase on a different subscription are compatible.
      current_sub IS NULL AND p_event_type = 'checkout.session.completed' AND p_subscription_id IS NOT NULL
      AND EXISTS (SELECT FROM public.stripe_events WHERE applied_member_id = member_id
        AND stripe_created = last_change AND type = 'customer.subscription.deleted'
        AND subscription_id IS DISTINCT FROM p_subscription_id)
    ) THEN
      RAISE EXCEPTION 'Conflicting membership events at the same Stripe timestamp; reconciliation required';
    END IF;

    IF p_event_type = 'checkout.session.completed' THEN
      UPDATE public.members SET tier = p_tier, stripe_customer_id = p_customer_id,
        stripe_subscription_id = p_subscription_id WHERE id = member_id;
    ELSE
      UPDATE public.members SET tier = p_tier WHERE id = member_id;
    END IF;
  END IF;
  UPDATE public.stripe_events SET applied_member_id = member_id WHERE id = p_event_id;
  RETURN 'applied';
END;
$$;

REVOKE ALL ON FUNCTION public.apply_stripe_membership_event(text, text, timestamptz, text, text, uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_membership_event(text, text, timestamptz, text, text, uuid, text)
  TO service_role;
