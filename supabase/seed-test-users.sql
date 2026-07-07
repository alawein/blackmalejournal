-- =============================================================================
-- ⚠️  TEST ONLY — seed-test-users.sql
-- Creates deterministic test accounts for local/staging development.
-- NEVER run against production. Guarded by environment check below.
-- Idempotent: safe to re-run.
-- =============================================================================

-- Production guard: abort if NEXT_PUBLIC_SITE_URL points to the live domain.
DO $$
BEGIN
  IF current_setting('app.site_url', true) ILIKE '%blackmalejournal.org%' THEN
    RAISE EXCEPTION 'seed-test-users: refusing to run against production (app.site_url = %)',
      current_setting('app.site_url', true);
  END IF;
END $$;

-- ── 1. Auth users (auth.users) ────────────────────────────────────────────────
-- Uses Supabase's internal auth schema. Passwords are bcrypt-hashed.
-- Hash for 'TestOnly!1' (bcrypt cost 10) — change before any public deploy.

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  aud, role
)
VALUES
  -- ⚠️ TEST ONLY: admin@bmj.test / TestOnly!1
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@bmj.test',
    crypt('TestOnly!1', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated'
  ),
  -- ⚠️ TEST ONLY: free@bmj.test / TestOnly!1
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'free@bmj.test',
    crypt('TestOnly!1', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated'
  ),
  -- ⚠️ TEST ONLY: basic@bmj.test / TestOnly!1
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'basic@bmj.test',
    crypt('TestOnly!1', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated'
  ),
  -- ⚠️ TEST ONLY: premium@bmj.test / TestOnly!1
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'premium@bmj.test',
    crypt('TestOnly!1', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO UPDATE SET
  email             = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at        = now();

-- ── 2. members table ──────────────────────────────────────────────────────────

INSERT INTO public.members (id, email, tier, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@bmj.test',   'free',    'admin'),
  ('00000000-0000-0000-0000-000000000002', 'free@bmj.test',    'free',    'member'),
  ('00000000-0000-0000-0000-000000000003', 'basic@bmj.test',   'basic',   'member'),
  ('00000000-0000-0000-0000-000000000004', 'premium@bmj.test', 'premium', 'member')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  tier  = EXCLUDED.tier,
  role  = EXCLUDED.role;
