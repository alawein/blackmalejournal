-- =============================================================================
-- THE BLACK MALE JOURNAL — Database Schema
-- Run this in the Supabase SQL Editor (supabase.com → project → SQL Editor)
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS throughout.
-- =============================================================================

-- ── Enum-like text check helpers ──────────────────────────────────────────────
-- We use text columns with CHECK constraints rather than Postgres enums so that
-- adding new tiers or lenses never requires an ALTER TYPE migration.

-- ── articles ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.articles (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  slug         text        NOT NULL UNIQUE,
  lens         text        NOT NULL CHECK (lens IN ('health', 'philosophy', 'politics')),
  tags         text[]      NOT NULL DEFAULT '{}',
  excerpt      text        NOT NULL DEFAULT '',
  body         text        NOT NULL DEFAULT '',
  featured     boolean     NOT NULL DEFAULT false,
  access_tier  text        NOT NULL DEFAULT 'free' CHECK (access_tier IN ('free', 'basic', 'premium')),
  author       text        NOT NULL DEFAULT 'The Chairman',
  cover_image  text,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can read all articles (access_tier enforcement handled in app layer)
CREATE POLICY "articles_select_public"
  ON public.articles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert/update/delete (admin operations)
-- No INSERT/UPDATE/DELETE policy for anon or authenticated = denied by default.

CREATE INDEX IF NOT EXISTS articles_lens_idx        ON public.articles (lens);
CREATE INDEX IF NOT EXISTS articles_featured_idx    ON public.articles (featured);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON public.articles (published_at DESC);
CREATE INDEX IF NOT EXISTS articles_access_tier_idx ON public.articles (access_tier);

-- ── briefings ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.briefings (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number integer     NOT NULL UNIQUE,
  title        text        NOT NULL,
  slug         text        NOT NULL UNIQUE,
  -- sections: JSON array of {title: string, body: string}
  sections     jsonb       NOT NULL DEFAULT '[]',
  access_tier  text        NOT NULL DEFAULT 'free' CHECK (access_tier IN ('free', 'basic', 'premium')),
  cover_image  text,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "briefings_select_public"
  ON public.briefings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS briefings_issue_number_idx ON public.briefings (issue_number DESC);
CREATE INDEX IF NOT EXISTS briefings_published_at_idx ON public.briefings (published_at DESC);

-- ── members ───────────────────────────────────────────────────────────────────
-- Members are linked to Supabase Auth users via id = auth.uid().
-- The row is created by a trigger on auth.users signup (see below).

CREATE TABLE IF NOT EXISTS public.members (
  id                      uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email                   text        NOT NULL UNIQUE,
  tier                    text        NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'premium')),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Members can read and update their own row
CREATE POLICY "members_select_own"
  ON public.members FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "members_update_own"
  ON public.members FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: auto-create a member row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.members (id, email, tier)
  VALUES (NEW.id, NEW.email, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── courses ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.courses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  description text        NOT NULL DEFAULT '',
  category    text        NOT NULL,
  access_tier text        NOT NULL DEFAULT 'free' CHECK (access_tier IN ('free', 'basic', 'premium')),
  published   boolean     NOT NULL DEFAULT false,
  cover_image text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select_public"
  ON public.courses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS courses_category_idx   ON public.courses (category);
CREATE INDEX IF NOT EXISTS courses_published_idx  ON public.courses (published);

-- ── newsletter_subscribers ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text        NOT NULL UNIQUE,
  source          text,
  subscribed_at   timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (upsert by email)
CREATE POLICY "newsletter_insert_anon"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow upsert (UPDATE) so re-subscribe clears unsubscribed_at
CREATE POLICY "newsletter_update_anon"
  ON public.newsletter_subscribers FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ── contact_submissions ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  email        text        NOT NULL,
  subject      text,
  message      text        NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit the contact form
CREATE POLICY "contact_insert_anon"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =============================================================================
-- Done. Tables created:
--   public.articles
--   public.briefings
--   public.members
--   public.courses
--   public.newsletter_subscribers
--   public.contact_submissions
-- =============================================================================
