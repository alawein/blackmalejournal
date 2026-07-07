-- =============================================================================
-- THE BLACK MALE JOURNAL — Full-Text Search
-- Adds search_vector (tsvector GENERATED ALWAYS AS STORED) columns + GIN indexes
-- on articles, briefings, dispatches, and handbooks.
-- Exposes a single search_content() RPC for the application layer.
-- =============================================================================

-- ── search_vector columns ─────────────────────────────────────────────────────

-- articles: title (A) + excerpt (B)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
  ) STORED;

-- briefings: title only (A) — no excerpt column
ALTER TABLE public.briefings
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
  ) STORED;

-- dispatches: title (A) + excerpt (B)
ALTER TABLE public.dispatches
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
  ) STORED;

-- handbooks: title (A) + description (B)
ALTER TABLE public.handbooks
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

-- ── GIN indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS articles_search_vector_idx
  ON public.articles USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS briefings_search_vector_idx
  ON public.briefings USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS dispatches_search_vector_idx
  ON public.dispatches USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS handbooks_search_vector_idx
  ON public.handbooks USING GIN (search_vector);

-- ── search_content RPC ────────────────────────────────────────────────────────
-- Parameters:
--   query        text        — free-text query string
--   filter_lens  text[]      — lens filter; NULL means all lenses
--   filter_types text[]      — content type filter; NULL means all types
--   sort_by      text        — 'date' | anything else = relevance
--   result_limit int         — max rows returned (default 30)
--
-- Returns one row per matching content item across articles, briefings,
-- dispatches, and handbooks. Only published/scheduled content visible to now()
-- is included.
--
-- Briefing note: briefings have no lens column. When filter_lens IS NOT NULL,
-- briefings are excluded entirely because they cannot match a lens filter.
--
-- Dispatch note: dispatches have no access_tier column; 'free' is returned as
-- a fixed sentinel so the caller always has a non-null access_tier value.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.search_content(
  query        text,
  filter_lens  text[]  DEFAULT NULL,
  filter_types text[]  DEFAULT NULL,
  sort_by      text    DEFAULT 'relevance',
  result_limit int     DEFAULT 30
)
RETURNS TABLE (
  id           uuid,
  title        text,
  slug         text,
  excerpt      text,
  lens         text,
  access_tier  text,
  published_at timestamptz,
  content_type text,
  relevance    float4
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tsquery tsquery;
BEGIN
  tsquery := websearch_to_tsquery('english', query);

  RETURN QUERY
  WITH results AS (
    -- ── articles ──────────────────────────────────────────────────────────────
    SELECT
      a.id,
      a.title,
      a.slug,
      a.excerpt,
      a.lens,
      a.access_tier,
      a.published_at,
      'article'::text            AS content_type,
      ts_rank(a.search_vector, tsquery) AS relevance
    FROM public.articles a
    WHERE
      a.search_vector @@ tsquery
      AND a.status IN ('published', 'scheduled')
      AND a.published_at <= now()
      AND (filter_lens IS NULL OR a.lens = ANY(filter_lens))
      AND (filter_types IS NULL OR 'article' = ANY(filter_types))

    UNION ALL

    -- ── briefings ─────────────────────────────────────────────────────────────
    -- Excluded entirely when filter_lens IS NOT NULL (no lens column).
    SELECT
      b.id,
      b.title,
      b.slug,
      NULL::text                 AS excerpt,
      NULL::text                 AS lens,
      b.access_tier,
      b.published_at,
      'briefing'::text           AS content_type,
      ts_rank(b.search_vector, tsquery) AS relevance
    FROM public.briefings b
    WHERE
      b.search_vector @@ tsquery
      AND b.status IN ('published', 'scheduled')
      AND b.published_at <= now()
      AND filter_lens IS NULL
      AND (filter_types IS NULL OR 'briefing' = ANY(filter_types))

    UNION ALL

    -- ── dispatches ────────────────────────────────────────────────────────────
    -- access_tier is not a column on dispatches; return 'free' as sentinel.
    SELECT
      d.id,
      d.title,
      d.slug,
      d.excerpt,
      d.lens,
      'free'::text               AS access_tier,
      d.published_at,
      'dispatch'::text           AS content_type,
      ts_rank(d.search_vector, tsquery) AS relevance
    FROM public.dispatches d
    WHERE
      d.search_vector @@ tsquery
      AND d.status IN ('published', 'scheduled')
      AND d.published_at <= now()
      AND (filter_lens IS NULL OR d.lens = ANY(filter_lens))
      AND (filter_types IS NULL OR 'dispatch' = ANY(filter_types))

    UNION ALL

    -- ── handbooks ─────────────────────────────────────────────────────────────
    SELECT
      h.id,
      h.title,
      h.slug,
      h.description              AS excerpt,
      h.lens,
      h.access_tier,
      h.published_at,
      'handbook'::text           AS content_type,
      ts_rank(h.search_vector, tsquery) AS relevance
    FROM public.handbooks h
    WHERE
      h.search_vector @@ tsquery
      AND h.status IN ('published', 'scheduled')
      AND h.published_at <= now()
      AND (filter_lens IS NULL OR h.lens = ANY(filter_lens))
      AND (filter_types IS NULL OR 'handbook' = ANY(filter_types))
  )
  SELECT *
  FROM results
  ORDER BY
    CASE WHEN sort_by = 'date' THEN NULL ELSE results.relevance END DESC NULLS LAST,
    CASE WHEN sort_by = 'date' THEN results.published_at        ELSE NULL END DESC NULLS LAST
  LIMIT result_limit;
END;
$$;
