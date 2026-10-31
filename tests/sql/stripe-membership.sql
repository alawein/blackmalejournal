-- Run only in a disposable test database with the application schema installed.
BEGIN;
DO $$
DECLARE
  member_id uuid := '10000000-0000-4000-8000-000000000001';
  event_time timestamptz := '2026-01-01 00:00:00+00';
  result text;
BEGIN
  IF has_function_privilege('authenticated', 'public.apply_stripe_membership_event(text,text,timestamptz,text,text,uuid,text)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.apply_stripe_membership_event(text,text,timestamptz,text,text,uuid,text)', 'EXECUTE')
    OR NOT has_function_privilege('service_role', 'public.apply_stripe_membership_event(text,text,timestamptz,text,text,uuid,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'unexpected webhook RPC privileges';
  END IF;

  BEGIN
    PERFORM public.apply_stripe_membership_event('evt_checkout', 'checkout.session.completed',
      event_time - interval '1 second', 'sub_demo', 'cus_demo', member_id, 'premium');
    RAISE EXCEPTION 'checkout unexpectedly succeeded without a member' USING ERRCODE = '22000';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Membership row is not available' THEN RAISE; END IF;
  END;
  IF EXISTS (SELECT FROM public.stripe_events WHERE id = 'evt_checkout') THEN
    RAISE EXCEPTION 'failed checkout permanently claimed its event';
  END IF;

  INSERT INTO auth.users (id, email) VALUES (member_id, 'billing-fixture@example.test');
  -- The signup trigger in the app schema creates the member row.
  result := public.apply_stripe_membership_event('evt_checkout', 'checkout.session.completed',
    event_time - interval '1 second', 'sub_demo', 'cus_demo', member_id, 'premium');
  IF result <> 'applied' OR (SELECT tier FROM public.members WHERE id = member_id) IS DISTINCT FROM 'premium' THEN
    RAISE EXCEPTION 'retry failed to apply paid access';
  END IF;
  result := public.apply_stripe_membership_event('evt_checkout', 'checkout.session.completed',
    event_time, 'sub_demo', 'cus_demo', member_id, 'basic');
  IF result <> 'duplicate' OR (SELECT tier FROM public.members WHERE id = member_id) IS DISTINCT FROM 'premium' THEN
    RAISE EXCEPTION 'duplicate checkout was applied';
  END IF;

  BEGIN
    PERFORM public.apply_stripe_membership_event('evt_invalid', 'customer.subscription.updated',
      event_time, 'sub_demo', 'cus_demo', NULL, 'invalid_test_tier');
    RAISE EXCEPTION 'tier constraint did not reject invalid member change';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  IF EXISTS (SELECT FROM public.stripe_events WHERE id = 'evt_invalid') THEN
    RAISE EXCEPTION 'membership constraint failure did not roll back the receipt';
  END IF;

  BEGIN
    PERFORM public.apply_stripe_membership_event('evt_aborted', 'customer.subscription.updated',
      event_time, 'sub_demo', 'cus_demo', NULL, 'basic');
    RAISE EXCEPTION 'simulated transaction abort' USING ERRCODE = '40001';
  EXCEPTION WHEN serialization_failure THEN NULL;
  END;
  IF EXISTS (SELECT FROM public.stripe_events WHERE id = 'evt_aborted')
    OR (SELECT tier FROM public.members WHERE id = member_id) IS DISTINCT FROM 'premium' THEN
    RAISE EXCEPTION 'transaction rollback did not undo receipt and membership together';
  END IF;
  PERFORM public.apply_stripe_membership_event('evt_aborted', 'customer.subscription.updated',
    event_time, 'sub_demo', 'cus_demo', NULL, 'basic');
  IF (SELECT tier FROM public.members WHERE id = member_id) IS DISTINCT FROM 'basic' THEN
    RAISE EXCEPTION 'aborted delivery could not be retried';
  END IF;

  PERFORM public.apply_stripe_membership_event('evt_delete', 'customer.subscription.deleted',
    event_time, 'sub_demo', 'cus_demo', NULL, 'free');
  PERFORM public.apply_stripe_membership_event('evt_late', 'customer.subscription.updated',
    event_time - interval '1 second', 'sub_demo', 'cus_demo', NULL, 'premium');
  PERFORM public.apply_stripe_membership_event('evt_tie', 'customer.subscription.updated',
    event_time, 'sub_demo', 'cus_demo', NULL, 'premium');
  PERFORM public.apply_stripe_membership_event('evt_late_checkout', 'checkout.session.completed',
    event_time, 'sub_demo', 'cus_demo', member_id, 'premium');
  IF NOT EXISTS (SELECT FROM public.members WHERE id = member_id AND tier = 'free' AND stripe_subscription_id IS NULL) THEN
    RAISE EXCEPTION 'a late delivery restored a canceled subscription';
  END IF;

  PERFORM public.apply_stripe_membership_event('evt_new', 'checkout.session.completed',
    event_time, 'sub_new', 'cus_demo', member_id, 'premium');
  PERFORM public.apply_stripe_membership_event('evt_old_delete', 'customer.subscription.deleted',
    event_time, 'sub_demo', 'cus_demo', NULL, 'free');
  IF NOT EXISTS (SELECT FROM public.members WHERE id = member_id AND tier = 'premium' AND stripe_subscription_id = 'sub_new') THEN
    RAISE EXCEPTION 'old cancellation revoked the replacement subscription';
  END IF;
  -- A conflicting nonterminal snapshot in the same Stripe second has no reliable order.
  BEGIN
    PERFORM public.apply_stripe_membership_event('evt_conflict', 'customer.subscription.updated',
      event_time, 'sub_new', 'cus_demo', NULL, 'basic');
    RAISE EXCEPTION 'ambiguous event unexpectedly succeeded' USING ERRCODE = '22000';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE 'Conflicting membership events%' THEN RAISE; END IF;
  END;
  IF EXISTS (SELECT FROM public.stripe_events WHERE id = 'evt_conflict')
    OR (SELECT tier FROM public.members WHERE id = member_id) IS DISTINCT FROM 'premium' THEN
    RAISE EXCEPTION 'ambiguous event was acknowledged or changed membership';
  END IF;
  -- Older member rows may hold a customer ID with no recorded subscription ID.
  UPDATE public.members SET stripe_subscription_id = NULL WHERE id = member_id;
  PERFORM public.apply_stripe_membership_event('evt_legacy_cancel', 'customer.subscription.deleted',
    event_time, 'sub_legacy', 'cus_demo', NULL, 'free');
  IF (SELECT tier FROM public.members WHERE id = member_id) IS DISTINCT FROM 'free' THEN
    RAISE EXCEPTION 'legacy customer-linked member kept access after cancellation';
  END IF;
  -- An irrelevant cancellation after unlinking must not block a later-arriving valid purchase.
  PERFORM public.apply_stripe_membership_event('evt extra deletion', 'customer.subscription.deleted',
    event_time + interval '10 days', 'sub_unrelated', 'cus_demo', NULL, 'free');
  PERFORM public.apply_stripe_membership_event('evt Jan2 checkout', 'checkout.session.completed',
    event_time + interval '2 days', 'sub_current', 'cus_demo', member_id, 'premium');
  BEGIN
    PERFORM public.apply_stripe_membership_event('evt Jan1 checkout', 'checkout.session.completed',
      event_time + interval '1 day', 'sub_older', 'cus_demo', member_id, 'basic');
    RAISE EXCEPTION 'ambiguous older purchase was acknowledged' USING ERRCODE = '22000';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Older checkout for a different linked subscription; reconciliation required' THEN RAISE; END IF;
  END;
  IF EXISTS (SELECT FROM public.stripe_events WHERE id = 'evt Jan1 checkout') THEN
    RAISE EXCEPTION 'ambiguous older purchase was permanently claimed';
  END IF;
  PERFORM public.apply_stripe_membership_event('evt old cancel', 'customer.subscription.deleted',
    event_time + interval '3 days', 'sub_older', 'cus_demo', NULL, 'free');
  IF NOT EXISTS (SELECT FROM public.members WHERE id = member_id AND tier = 'premium' AND stripe_subscription_id = 'sub_current') THEN
    RAISE EXCEPTION 'older checkout or cancellation overwrote the newer subscription';
  END IF;

  -- A later no-op update for the current subscription cannot establish when another purchase began.
  PERFORM public.apply_stripe_membership_event('evt unchanged', 'customer.subscription.updated',
    event_time + interval '3 days', 'sub_current', 'cus_demo', NULL, 'premium');
  BEGIN
    PERFORM public.apply_stripe_membership_event('evt other purchase', 'checkout.session.completed',
      event_time + interval '2 days 12 hours', 'sub_purchase', 'cus_demo', member_id, 'basic');
    RAISE EXCEPTION 'ambiguous older purchase was acknowledged' USING ERRCODE = '22000';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Older checkout for a different linked subscription; reconciliation required' THEN RAISE; END IF;
  END;
  IF EXISTS (SELECT FROM public.stripe_events WHERE id = 'evt other purchase') THEN
    RAISE EXCEPTION 'ambiguous older purchase was permanently claimed';
  END IF;
  IF NOT EXISTS (SELECT FROM public.members WHERE id = member_id AND tier = 'premium' AND stripe_subscription_id = 'sub_current') THEN
    RAISE EXCEPTION 'ambiguous purchase changed the current entitlement';
  END IF;

  PERFORM public.apply_stripe_membership_event('evt Jan4 downgrade', 'customer.subscription.updated',
    event_time + interval '4 days', 'sub_current', 'cus_demo', NULL, 'basic');
  PERFORM public.apply_stripe_membership_event('evt Jan3 upgrade', 'customer.subscription.updated',
    event_time + interval '3 days', 'sub_current', 'cus_demo', NULL, 'premium');
  IF (SELECT tier FROM public.members WHERE id = member_id) IS DISTINCT FROM 'basic' THEN
    RAISE EXCEPTION 'older upgrade overwrote the newer downgrade';
  END IF;
END;
$$;
ROLLBACK;
