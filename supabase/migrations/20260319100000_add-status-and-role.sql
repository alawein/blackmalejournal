-- =============================================================================
-- Add status column to content tables + role column to members table
-- =============================================================================

-- ── Status column on articles ───────────────────────────────────────────────

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
  CONSTRAINT articles_status_check CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'));

UPDATE public.articles SET status = 'published' WHERE published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS articles_status_idx ON public.articles (status);

-- ── Status column on briefings ──────────────────────────────────────────────

ALTER TABLE public.briefings
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
  CONSTRAINT briefings_status_check CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'));

UPDATE public.briefings SET status = 'published' WHERE published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS briefings_status_idx ON public.briefings (status);

-- ── Status column on dispatches ─────────────────────────────────────────────

ALTER TABLE public.dispatches
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
  CONSTRAINT dispatches_status_check CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'));

UPDATE public.dispatches SET status = 'published' WHERE published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS dispatches_status_idx ON public.dispatches (status);

-- ── Status column on handbooks ──────────────────────────────────────────────

ALTER TABLE public.handbooks
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
  CONSTRAINT handbooks_status_check CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'));

UPDATE public.handbooks SET status = 'published' WHERE published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS handbooks_status_idx ON public.handbooks (status);

-- ── Role column on members ──────────────────────────────────────────────────

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member'
  CONSTRAINT members_role_check CHECK (role IN ('member', 'editor', 'admin'));

CREATE INDEX IF NOT EXISTS members_role_idx ON public.members (role);
