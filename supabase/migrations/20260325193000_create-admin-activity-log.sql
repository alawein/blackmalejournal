-- =============================================================================
-- Create durable admin activity logging for content owner workflows
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES public.members (id) ON DELETE SET NULL,
  actor_email text NOT NULL,
  actor_role text NOT NULL CHECK (actor_role IN ('admin', 'editor')),
  entity_type text NOT NULL CHECK (entity_type IN ('article', 'briefing', 'dispatch', 'handbook', 'download')),
  entity_id uuid NOT NULL,
  entity_title text NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  summary text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS admin_activity_log_entity_idx
  ON public.admin_activity_log (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS admin_activity_log_created_at_idx
  ON public.admin_activity_log (created_at DESC);
