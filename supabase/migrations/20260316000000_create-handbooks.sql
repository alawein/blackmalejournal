-- ── handbooks ───────────────────────────────────────────────────────────────
-- Long-form educational guides (e-books, field manuals) gated by access_tier.

CREATE TABLE IF NOT EXISTS public.handbooks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  slug         text        NOT NULL UNIQUE,
  lens         text        NOT NULL CHECK (lens IN ('health', 'philosophy', 'politics')),
  description  text        NOT NULL DEFAULT '',
  body         text        NOT NULL DEFAULT '',
  access_tier  text        NOT NULL DEFAULT 'basic' CHECK (access_tier IN ('free', 'basic', 'premium')),
  author       text        NOT NULL DEFAULT 'The Chairman',
  cover_image  text,
  file_url     text,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.handbooks ENABLE ROW LEVEL SECURITY;

-- Public can read all handbooks (access_tier enforcement in app layer)
CREATE POLICY "handbooks_select_public"
  ON public.handbooks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS handbooks_lens_idx         ON public.handbooks (lens);
CREATE INDEX IF NOT EXISTS handbooks_published_at_idx ON public.handbooks (published_at DESC);
CREATE INDEX IF NOT EXISTS handbooks_access_tier_idx  ON public.handbooks (access_tier);
