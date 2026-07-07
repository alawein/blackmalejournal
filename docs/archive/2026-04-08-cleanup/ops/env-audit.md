---
title: Environment audit checklist
status: operational
audience: [engineers, operators]
last-verified: 2026-03-31
---

# Environment Audit

Run this checklist after any integration change and before launch.

## Source of Truth

- Canonical variable list: [env-vars.md](env-vars.md)
- Stripe runtime use: [helpers.ts](../../src/lib/stripe/helpers.ts)
- Metadata and analytics wiring: [layout.tsx](../../src/app/layout.tsx)
- Auth callback route: [route.ts](<../../src/app/(auth)/auth/callback/route.ts>)

## Audit Steps

1. Compare Development, Preview, and Production values in Vercel against [env-vars.md](env-vars.md).
2. Confirm `NEXT_PUBLIC_SITE_URL` matches the actual host for each environment.
3. Confirm Supabase callback URLs include `/auth/callback` for each environment.
4. Confirm Stripe webhook endpoints use `/api/stripe/webhook` for Preview and Production.
5. Confirm preview and production use the correct Stripe webhook secrets.
6. Confirm `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is unset outside Production unless preview analytics is intentional.
7. Confirm server-only secrets do not use the `NEXT_PUBLIC_` prefix.
8. Run `npm run secrets:check` locally before pushing.

## Launch-Critical Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_BASIC_PRICE_ID`
- `STRIPE_PREMIUM_PRICE_ID`

## Sign-Off

- Env audit completed by:
- Date:
- Environments checked:
- Follow-up issues:
