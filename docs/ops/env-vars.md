---
title: Environment variables reference
authority: canonical
status: canonical
audience: [engineers, operators, agents]
last-verified: 2026-04-24
---

# Environment Variables Reference

> Canonical list of every environment variable used by The Black Male Journal.
> When adding a new env var, add it here first. Run `/env-audit` to verify.

---

## Supabase (required — app won't function without these)

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | `server.ts`, `client.ts`, `admin.ts`, `proxy.ts` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | `server.ts`, `client.ts`, `proxy.ts` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | `admin.ts` (webhook handler) | Supabase service role key — bypasses RLS. Never expose to client. |

## Stripe (required — subscriptions + donations)

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `STRIPE_SECRET_KEY` | Server only | `stripe/config.ts` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Server only | `webhook/route.ts` | Stripe webhook signing secret — must match the endpoint registered in Stripe Dashboard |
| `STRIPE_BASIC_PRICE_ID` | Server only | `stripe/config.ts` | Stripe Price ID for Basic tier ($9/mo) |
| `STRIPE_PREMIUM_PRICE_ID` | Server only | `stripe/config.ts` | Stripe Price ID for Premium tier ($19/mo) |

## Resend (optional — contact form works without, just no email delivery)

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `RESEND_API_KEY` | Server only | `contact/route.ts` | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Server only | `contact/route.ts` | Sender address for outgoing email (must be verified domain in Resend) |
| `CONTACT_TO_EMAIL` | Server only | `contact/route.ts` | Recipient address for contact form submissions |

## Site Config

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Client + Server | `seo.ts`, `auth/actions.ts`, `stripe/helpers.ts`, `donate/route.ts` | Preferred canonical site URL (e.g., `https://blackmalejournal.org` or `https://blackmalejournal.vercel.app`). When unset on Vercel, the app falls back to `VERCEL_PROJECT_PRODUCTION_URL` and then `VERCEL_URL`. |
| `NEXT_PUBLIC_WHATSAPP_LINK` | Client | `contact/page.tsx` | WhatsApp contact link |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Client | `layout.tsx` | Optional Plausible domain. When set, the analytics script is injected into the root layout. |

## Sentry (optional — no-op unless DSN is set)

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Client | `sentry.client.config.ts` | Client-side DSN. Safe to expose. When unset, client Sentry init is skipped. |
| `SENTRY_DSN` | Server + Edge | `sentry.server.config.ts`, `sentry.edge.config.ts` | Server/edge DSN (can match `NEXT_PUBLIC_SENTRY_DSN`). When unset, server Sentry init is skipped. |
| `SENTRY_ORG` | Build-time | `next.config.ts` (via `withSentryConfig`) | Sentry org slug for sourcemap upload. Build skips upload when unset. |
| `SENTRY_PROJECT` | Build-time | `next.config.ts` | Sentry project slug. |
| `SENTRY_AUTH_TOKEN` | Build-time (CI only) | `next.config.ts` | Auth token for sourcemap upload. Never commit. Configure in Vercel and GitHub Actions secrets. Sourcemap upload is disabled when unset. |

## Local E2E (optional)

| Variable | Scope | Used In | Description |
|----------|-------|---------|-------------|
| `E2E_ADMIN_EMAIL` | Local / CI secret | `playwright.config.ts`, `tests/e2e/authenticated/admin.setup.ts` | Email for an existing Supabase auth user whose `members.role` is `admin` or `editor`. When set together with `E2E_ADMIN_PASSWORD`, Playwright runs the authenticated admin article workflow. |
| `E2E_ADMIN_PASSWORD` | Local / CI secret | Same as above | Password for that user. Never commit real values; use `.env.local` or CI secrets. |
| `E2E_MEMBER_EMAIL` | Local / CI secret | `playwright.config.ts`, `tests/e2e/authenticated/member.setup.ts`, `tests/e2e/auth-flow.spec.ts` | Email for a normal member (`members.role` `member`). With `E2E_MEMBER_PASSWORD`, runs portal E2E and the “valid login” auth-flow test. Use a different account than the admin E2E user when both suites are enabled. |
| `E2E_MEMBER_PASSWORD` | Local / CI secret | Same as above | Password for the member test account. |
| `E2E_BASIC_EMAIL` | Local / CI secret | `playwright.config.ts`, `tests/e2e/authenticated/basic.setup.ts` | Basic-tier test user email (with `E2E_BASIC_PASSWORD`). |
| `E2E_BASIC_PASSWORD` | Local / CI secret | Same as above | Password for the basic-tier E2E account. |
| `E2E_PREMIUM_EMAIL` | Local / CI secret | `playwright.config.ts`, `tests/e2e/authenticated/premium.setup.ts` | Premium-tier test user email (with `E2E_PREMIUM_PASSWORD`). |
| `E2E_PREMIUM_PASSWORD` | Local / CI secret | Same as above | Password for the premium-tier E2E account. |

### GitHub Actions (`.github/workflows/ci.yml`)

Add **repository secrets** (Settings → Secrets and variables → Actions) so CI can run Supabase-backed E2E. Full checklist, seed instructions, security boundaries, and workflow nuances (quality job vs E2E job, fork PRs): **[playwright-e2e-github-actions.md](playwright-e2e-github-actions.md)**.

Summary — secrets used by CI:

| Secret | Purpose |
|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Real project URL (Vercel / local). When unset, E2E falls back to `https://placeholder.supabase.co` and login-related tests are skipped. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key for that project when URL is real. |
| `NEXT_PUBLIC_SITE_URL` | **Quality** job: `check:no-test-users` (with `SUPABASE_SERVICE_ROLE_KEY`) when verifying production has no test accounts. Not the same value as the E2E job’s localhost site URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Quality** job only for `check:no-test-users` — never pass to the E2E job. |
| `E2E_MEMBER_EMAIL` / `E2E_MEMBER_PASSWORD` | Member account for “valid login” (`auth-flow.spec.ts`) and member Playwright projects. |
| `E2E_ADMIN_*`, `E2E_BASIC_*`, `E2E_PREMIUM_*` | Optional — enable matching Playwright projects when both email and password are set. |

Fork pull requests do not receive repository secrets; E2E continues to use placeholders and skips tests that need a live Supabase host.

## Environment-Specific Values

| Variable | Development | Preview | Production |
|----------|-------------|---------|------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Optional if Vercel fallback is acceptable | `https://blackmalejournal.org` or `https://blackmalejournal.vercel.app` until the custom domain is live |
| `STRIPE_WEBHOOK_SECRET` | Local Stripe CLI or dev endpoint secret | Preview webhook secret | Production webhook secret |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Unset | Usually unset | `blackmalejournal.org` |

## Callback and Webhook URLs

- Supabase auth callback:
  - `http://localhost:3000/auth/callback`
  - `https://<preview-domain>/auth/callback`
  - `https://blackmalejournal.org/auth/callback`
- Stripe webhook endpoint:
  - `http://localhost:3000/api/stripe/webhook` when using a local tunnel or Stripe CLI
  - `https://<preview-domain>/api/stripe/webhook`
  - `https://blackmalejournal.org/api/stripe/webhook`

---

## Rules

1. **Never commit `.env` files** — `.gitignore` must include `.env*`
2. **`NEXT_PUBLIC_` prefix** means the value is bundled into client-side JavaScript and visible to users. Only use this prefix for values that are safe to expose (Supabase URL, anon key, site URL, WhatsApp link, Plausible domain).
3. **Server-only variables** (Stripe secret key, Supabase service role key, Resend key) must NEVER have the `NEXT_PUBLIC_` prefix.
4. **Vercel scoping:** Set env vars for Production, Preview, and Development environments separately in the Vercel dashboard. Some values differ per environment (e.g., `NEXT_PUBLIC_SITE_URL`, `STRIPE_WEBHOOK_SECRET`).
5. **Host fallback:** On Vercel, BMJ will fall back to `VERCEL_PROJECT_PRODUCTION_URL` and then `VERCEL_URL` when `NEXT_PUBLIC_SITE_URL` is unset. Keep `NEXT_PUBLIC_SITE_URL` explicit in Production for stable canonicals and webhook/email links.
6. **Rotation:** Rotate all secret keys annually, or immediately if compromised.
7. **Backup:** Keep a copy of all env vars in Bitwarden under `Nonprofit / Developer`.

---

## Adding a New Environment Variable

1. Add it to the code where needed
2. Add a row to the appropriate table in this file
3. Set it in Vercel Dashboard > Project > Settings > Environment Variables
4. Store a copy in Bitwarden
5. Run `/env-audit` to verify consistency

## Total Count

- **21 documented variables** for CI parity (5 client-safe, 8 server-only, 8 optional E2E secrets)
- **Required for the core app:** Supabase (3), Stripe (4), site URL (1)
- **Optional integrations:** Resend (3), WhatsApp (1), Plausible (1)
- **Optional local/CI:** E2E credentials (8) — see Local E2E table and GitHub Actions subsection
