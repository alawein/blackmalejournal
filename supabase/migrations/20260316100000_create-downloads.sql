-- ── downloads ───────────────────────────────────────────────────────────────
-- Downloadable files (PDFs, templates, worksheets) gated by access_tier.

CREATE TABLE IF NOT EXISTS public.downloads (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  slug         text        NOT NULL UNIQUE,
  description  text        NOT NULL DEFAULT '',
  category     text        NOT NULL DEFAULT 'general',
  file_url     text        NOT NULL,
  file_type    text        NOT NULL DEFAULT 'pdf',
  file_size    integer     NOT NULL DEFAULT 0,
  access_tier  text        NOT NULL DEFAULT 'premium' CHECK (access_tier IN ('free', 'basic', 'premium')),
  cover_image  text,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Public can read download metadata (access_tier enforcement in app layer)
CREATE POLICY "downloads_select_public"
  ON public.downloads FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS downloads_category_idx     ON public.downloads (category);
CREATE INDEX IF NOT EXISTS downloads_published_at_idx ON public.downloads (published_at DESC);
CREATE INDEX IF NOT EXISTS downloads_access_tier_idx  ON public.downloads (access_tier);
