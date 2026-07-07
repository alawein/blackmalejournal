---
title: Launch dashboard checklist
status: operational
audience: [operators, engineers]
last-verified: 2026-03-31
---

# Launch Dashboard Checklist

Use this runbook when BMJ is actually preparing to launch on the public production domain. This is the exact dashboard-by-dashboard follow-through for the external systems that are not stored in git.

Run this only after the repo gates in [launch-checklist.md](launch-checklist.md) pass.

## Inputs To Prepare First

Collect these values before touching dashboards:

- current production deployment URL from Vercel
- current preview deployment URL from Vercel
- intended production domain: `blackmalejournal.com`
- local callback URL: `http://localhost:3000/auth/callback`
- preview callback URL: `https://<preview-deployment>.vercel.app/auth/callback`
- production callback URL: `https://blackmalejournal.com/auth/callback`
- production webhook URL: `https://blackmalejournal.com/api/stripe/webhook`
- preview webhook URL: `https://<preview-deployment>.vercel.app/api/stripe/webhook`
- support sender address for BMJ email, for example `support@blackmalejournal.com`
- contact inbox address for BMJ operator mail routing

## 1. Vercel Dashboard

Path:

- Vercel Dashboard -> `blackmalejournal` -> Settings -> Environment Variables

Set or verify these variables.

### Required In Development, Preview, And Production

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_WHATSAPP_LINK`

### Required In Development And Production

- `NEXT_PUBLIC_SITE_URL`
  - Development: `http://localhost:3000`
  - Production: `https://blackmalejournal.com`

### Recommended In Preview

- `NEXT_PUBLIC_SITE_URL`
  - Preview: the current preview deployment URL if you want stable callback and canonical behavior during launch rehearsal
  - If left unset, BMJ falls back to `VERCEL_PROJECT_PRODUCTION_URL` and then `VERCEL_URL`, but production launch prep should prefer explicit values

### Stripe Variables

Set these after completing the Stripe dashboard steps below.

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_BASIC_PRICE_ID`
- `STRIPE_PREMIUM_PRICE_ID`

Environment guidance:

- Development: test-mode Stripe secret, local or tunnel webhook secret, test-mode price IDs
- Preview: test-mode Stripe secret, preview webhook secret, test-mode price IDs
- Production: live-mode Stripe secret, production webhook secret, live-mode price IDs

### Contact Email Variables

Set these after completing the Resend dashboard steps below.

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

### Analytics Variable

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
  - Development: leave unset
  - Preview: leave unset unless preview analytics is intentionally enabled
  - Production: `blackmalejournal.com`

### Vercel Rules

- Do not create any server-only secret with a `NEXT_PUBLIC_` prefix.
- After adding or changing environment variables, redeploy Production and the active Preview so the values are picked up.

## 2. Vercel Domains

Path:

- Vercel Dashboard -> `blackmalejournal` -> Settings -> Domains

Steps:

1. Add `blackmalejournal.com`.
2. Add `www.blackmalejournal.com` only if you want it active.
3. Make `blackmalejournal.com` the canonical production domain.
4. If `www` is added, configure it to redirect to the apex domain unless BMJ intentionally wants `www` as canonical.
5. Copy the exact DNS records that Vercel tells you to create.

Expected result:

- Vercel shows the production domain as assigned to `blackmalejournal`
- BMJ production traffic resolves to the same deployment family currently served under `vercel.app`

## 3. DNS Provider Dashboard

Use the authoritative DNS dashboard for `blackmalejournal.com`.

If Squarespace is the DNS authority later, the path is:

- Squarespace -> Domains -> `blackmalejournal.com` -> DNS Settings

If a different provider remains authoritative, use its DNS records screen instead.

Steps:

1. Add the exact Vercel-provided DNS records for the apex domain and any `www` redirect host.
2. Remove conflicting legacy A, AAAA, or CNAME records that would override the Vercel assignment.
3. Wait for DNS propagation until Vercel reports the domain as valid.

Expected result:

- `https://blackmalejournal.com` resolves to the Vercel production deployment
- if `www` is kept, it redirects to the canonical production host

## 4. Supabase Dashboard

Path:

- Supabase Dashboard -> Project -> Authentication -> URL Configuration

Steps:

1. Set Site URL to `https://blackmalejournal.com`.
2. Add these Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://<preview-deployment>.vercel.app/auth/callback`
   - `https://blackmalejournal.com/auth/callback`
3. Save the authentication URL configuration.

BMJ route reference:

- the app exchanges the auth code at `/auth/callback` in [route.ts](<../../src/app/(auth)/auth/callback/route.ts>)

Expected result:

- login and magic-link flows can return to the requested BMJ path after auth

## 5. Stripe Dashboard

### 5A. Products

Path:

- Stripe Dashboard -> Product catalog -> Products

Create these recurring monthly products in both test mode and live mode:

1. `BMJ Basic`
   - recurring monthly price: `$9`
2. `BMJ Premium`
   - recurring monthly price: `$19`

Copy the resulting Price IDs:

- `BMJ Basic` -> Vercel `STRIPE_BASIC_PRICE_ID`
- `BMJ Premium` -> Vercel `STRIPE_PREMIUM_PRICE_ID`

BMJ code reference:

- tier-to-price resolution happens in [config.ts](../../src/lib/stripe/config.ts)

### 5B. API Keys

Path:

- Stripe Dashboard -> Developers -> API keys

Copy the Secret key into Vercel:

- test secret -> Development and Preview
- live secret -> Production

BMJ note:

- this repo does not currently require a Stripe publishable key because checkout sessions are created server-side

### 5C. Webhooks

Path:

- Stripe Dashboard -> Developers -> Webhooks

Create or verify two endpoints:

1. Preview endpoint
   - URL: `https://<preview-deployment>.vercel.app/api/stripe/webhook`
2. Production endpoint
   - URL: `https://blackmalejournal.com/api/stripe/webhook`

Subscribe both endpoints to exactly these events:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Copy each endpoint signing secret into the matching Vercel environment as `STRIPE_WEBHOOK_SECRET`.

BMJ code reference:

- webhook handling lives in [route.ts](../../src/app/api/stripe/webhook/route.ts)

### 5D. Customer Portal

Path:

- Stripe Dashboard -> Settings -> Billing -> Customer portal

Steps:

1. Ensure the default customer portal configuration is active.
2. Enable payment method updates.
3. Enable subscription cancellation if BMJ wants self-serve cancellation.
4. Review branding and business details so customers see the correct BMJ identity.

BMJ note:

- the app creates billing portal sessions server-side and returns customers to `/portal/settings` via [helpers.ts](../../src/lib/stripe/helpers.ts)
- the return URL is set in code, so the dashboard default return link can stay blank if you prefer

## 6. Resend Dashboard

### 6A. Domains

Path:

- Resend Dashboard -> Domains

Steps:

1. Add and verify the BMJ sending domain.
2. Choose the sender address BMJ will use, for example `support@blackmalejournal.com`.

### 6B. API Keys

Path:

- Resend Dashboard -> API Keys

Steps:

1. Create an API key for BMJ production sending.
2. Store it in Vercel as `RESEND_API_KEY`.
3. Store the verified sender address in Vercel as `RESEND_FROM_EMAIL`.
4. Store the operator inbox recipient in Vercel as `CONTACT_TO_EMAIL`.

BMJ code reference:

- contact-form delivery uses those three variables in [route.ts](../../src/app/api/contact/route.ts)

## 7. Plausible Dashboard

Path:

- Plausible Dashboard -> Sites

Steps:

1. Add the site `blackmalejournal.com`.
2. Confirm the site domain exactly matches the production canonical host.
3. Put `blackmalejournal.com` into Vercel as `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` for Production only.

BMJ code reference:

- analytics script injection is conditional in [layout.tsx](../../src/app/layout.tsx)

## 8. Final Cross-Dashboard Verification

After all dashboards are updated:

1. Redeploy Production in Vercel.
2. Open `https://blackmalejournal.com`.
3. Confirm login and signup return through `/auth/callback`.
4. Run one preview checkout and one production checkout with the correct Stripe mode.
5. Confirm the webhook updates the `members` row and the member can reach `/portal`.
6. Open `/portal/settings` and confirm `Manage Billing` opens the Stripe customer portal.
7. Submit the contact form and confirm the message is stored and, if Resend is enabled, delivered to the operator inbox.
8. View page source or network traffic and confirm the Plausible script only appears on Production when enabled.

## Sign-Off

- Vercel envs verified by:
- Vercel domains verified by:
- DNS verified by:
- Supabase auth URLs verified by:
- Stripe products and webhooks verified by:
- Resend verified by:
- Plausible verified by:
- Final production smoke test date:
