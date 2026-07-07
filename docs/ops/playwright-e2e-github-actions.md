---
title: Playwright E2E and GitHub Actions
authority: canonical
status: canonical
audience: [engineers, operators, agents]
last-verified: 2026-04-11
---

# Playwright E2E and GitHub Actions

This guide describes how to wire **repository secrets** so CI can run Supabase-backed Playwright tests. Use a **dedicated dev or staging Supabase project** and **smoke-test accounts** only—never production customer data.

**Related:** [env-vars.md](env-vars.md) (variable list), [`tests/README.md`](../../tests/README.md), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`playwright.config.ts`](../../playwright.config.ts), [`tests/e2e/auth-flow.spec.ts`](../../tests/e2e/auth-flow.spec.ts).

---

## 1. Values from Supabase (Dashboard → Project → Settings → API)

| Value | Location |
|-------|----------|
| **Project URL** | “Project URL” (e.g. `https://xxxx.supabase.co`) |
| **Anon (public) key** | “Project API keys” → `anon` / public |
| **Service role key** | Same page → `service_role` — **server only**; used in the **quality** job for `check:no-test-users`, **not** in the E2E job |

---

## 2. Canonical test accounts (`supabase/seed-test-users.sql`)

Run the seed **only** against dev/staging. Password for all seeded users: **`TestOnly!1`** (documented in the seed file).

| Role / use | Email | `members.tier` | `members.role` |
|------------|-------|----------------|----------------|
| Admin E2E | `admin@bmj.test` | `free` | `admin` |
| Member / `auth-flow` login | `free@bmj.test` | `free` | `member` |
| Basic tier E2E | `basic@bmj.test` | `basic` | `member` |
| Premium tier E2E | `premium@bmj.test` | `premium` | `member` |

The seed inserts **`auth.users`** rows (bcrypt passwords, confirmed emails) and matching **`public.members`** rows with fixed UUIDs. It is **idempotent** (`ON CONFLICT DO UPDATE`).

**How to apply:** Supabase **SQL Editor** → paste and execute `supabase/seed-test-users.sql`, or run the SQL via `psql` / `supabase db execute` against the dev database. `supabase db push` applies **migrations**, not this seed file, unless you explicitly run the SQL.

**Production guard:** The file checks `current_setting('app.site_url', true)` for `blackmalejournal.org`. In the **SQL Editor**, that setting is often **unset**, so the guard may **not** raise—do not rely on it alone. Only run this seed against a known non-production project.

---

## 3. GitHub repository secrets

**Path:** Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

| Secret | Purpose |
|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Real Supabase project URL. If unset in CI, the E2E job falls back to `https://placeholder.supabase.co` and tests that need a live host skip (see `auth-flow.spec.ts`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key for that project. Fallback: `placeholder-anon-key` when the secret is unset. |
| `NEXT_PUBLIC_SITE_URL` | Used by the **quality** job step `check:no-test-users` when verifying production has no `@bmj.test` rows. **Not** the same as the E2E job’s `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (Playwright base URL / server). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Quality job only** (`check:no-test-users`). Queries `members` via REST with service role. **Never** add this to the E2E job `env`. |
| `E2E_MEMBER_EMAIL` / `E2E_MEMBER_PASSWORD` | Minimum for “valid login” in `auth-flow.spec.ts` + member Playwright project. Typical: `free@bmj.test` / `TestOnly!1` after seeding. |
| `E2E_ADMIN_*`, `E2E_BASIC_*`, `E2E_PREMIUM_*` | Optional; each pair enables the matching Playwright project in `playwright.config.ts`. |

**CI workflow nuance:** The **Build** step in `ci.yml` sets `NEXT_PUBLIC_SITE_URL` to a **literal** production-style URL for the build artifact—it does **not** read `NEXT_PUBLIC_SITE_URL` from secrets for that step. The **secret** matters for `check:no-test-users` when you configure it with your production site URL and production Supabase (to ensure test users did not leak).

---

## 4. Security boundaries

- Never commit `.env`, `.env.local`, or keys. See [env-vars.md](env-vars.md) — Rules.
- **E2E job:** only **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (and URL) — the same public keys the app uses in the browser; RLS applies.
- **Service role:** bypasses RLS; keep it in server-only contexts (`check:no-test-users`, server scripts), never in Playwright’s environment.

---

## 5. Password login in CI

Login uses the server action in **`src/app/(auth)/actions.ts`** (`signInWithPassword`). Seeded users have **`email_confirmed_at`** set in SQL, so confirmation is satisfied without changing Auth provider settings for those rows. If you create users manually in the Dashboard instead of the seed, you may need to confirm them explicitly.

---

## 6. `public.members` and portal access

The app expects a **`members`** row aligned with the auth user. The seed keeps `id`, `email`, `tier`, and `role` in sync with `auth.users`.

---

## 7. Fork pull requests

GitHub does **not** expose repository secrets to workflows from **forks**. Unset secrets yield empty strings; the workflow’s `||` fallbacks use the placeholder Supabase URL, and **`auth-flow.spec.ts`** skips live login tests. Same-repo branches and `main` pushes use secrets when configured.

---

## 8. Maintainer checklist (copy/paste)

1. Create or use a **dev/staging** Supabase project.
2. Run **`supabase/seed-test-users.sql`** in that project’s SQL Editor (dev only).
3. Add GitHub **Actions** secrets: at minimum `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `E2E_MEMBER_EMAIL`, `E2E_MEMBER_PASSWORD`; add `NEXT_PUBLIC_SITE_URL` + `SUPABASE_SERVICE_ROLE_KEY` for production **`check:no-test-users`** behavior on `main` as already wired in `ci.yml`.
4. Optionally add `E2E_ADMIN_*`, `E2E_BASIC_*`, `E2E_PREMIUM_*` for tier suites.
5. Confirm **`scripts/check-no-test-users.mjs`** passes before production deploys (no `@bmj.test` emails in production `members`).

---

## 9. Verify in repo

| Concern | Location |
|---------|----------|
| Placeholder skip / member creds skip | `tests/e2e/auth-flow.spec.ts` |
| Conditional Playwright projects | `playwright.config.ts` |
| E2E env injection | `.github/workflows/ci.yml` → job `e2e` |
| Production test-user gate | `scripts/check-no-test-users.mjs` |
| Seed data | `supabase/seed-test-users.sql` |
