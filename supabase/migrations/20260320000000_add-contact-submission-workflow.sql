-- =============================================================================
-- Add operational workflow fields to contact submissions
-- =============================================================================

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new'
  CONSTRAINT contact_submissions_status_check
  CHECK (status IN ('new', 'in_progress', 'resolved', 'spam'));

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS internal_notes text;

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS handled_at timestamptz;

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS handled_by uuid REFERENCES public.members (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS contact_submissions_status_idx
  ON public.contact_submissions (status, submitted_at DESC);
