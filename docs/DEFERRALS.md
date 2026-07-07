---
title: External configuration checklist (deferrals)
status: reference
audience: [operators, engineers]
last-verified: 2026-04-09
---

# External Configuration Checklist

Code wiring for Stripe checkout, portal redirects, Plausible, and site metadata is now in the repo. The remaining work is dashboard and environment configuration outside source control. Each entry below lists the exact external tasks that still need to be completed.

For the exact future launch runbook, see the ops lane ([ops/README.md](ops/README.md)).

---

## Stripe Integration

**Status:** Repo wiring complete. Dashboard and env configuration still required.

**What to do:**
1. Create products in Stripe Dashboard: Basic ($9/mo) and Premium ($19/mo)
2. Copy price IDs into `src/lib/stripe/config.ts`
3. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_BASIC_PRICE_ID`, and `STRIPE_PREMIUM_PRICE_ID` in Vercel for Development, Preview, and Production
4. Register webhook endpoints:
   - Preview: `https://<preview-domain>/api/stripe/webhook`
   - Production: `https://blackmalejournal.org/api/stripe/webhook`
5. Subscribe the webhook to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

**Unblocks:** Paid membership sign-up flow, webhook tier sync, billing portal management in `/portal/settings`

---

## DNS / Custom Domain

**Status:** Repo wiring complete. Domain purchase and DNS cutover still required.

**What to do:**
1. Run `/domain-setup` skill — it walks through the full checklist
2. Add domain to Vercel project → Vercel → Settings → Domains
3. Set `NEXT_PUBLIC_SITE_URL`:
   - Development: `http://localhost:3000`
   - Preview: optional if the Vercel deployment URL fallback is acceptable
   - Production: `https://blackmalejournal.org` once the custom domain is live, otherwise `https://blackmalejournal.vercel.app`
4. Add auth callback URL to Supabase:
   - `http://localhost:3000/auth/callback`
   - preview deployment callback URL
   - `https://blackmalejournal.org/auth/callback`

**Unblocks:** Canonical URLs in SEO/JSON-LD, email deliverability for auth emails

---

## Plausible Analytics

**Status:** Repo wiring complete. Domain registration and env configuration still required.

**What to do:**
1. Create account at plausible.io, add site for the custom domain
2. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`:
   - Development: leave unset
   - Preview: leave unset unless preview analytics is intentional
   - Production: `blackmalejournal.org`
3. The `<Script>` tag in `src/app/layout.tsx` is already wired — no code changes needed

**Unblocks:** Traffic analytics, goal tracking for sign-up conversions

---

## Lenses 3 → 5 (Content Taxonomy Expansion)

**Status:** Deferred — needs editorial decision on two new lens names

**What to do (once lenses are defined):**
- `src/app/(public)/about/page.tsx` — ThreeLenses section
- `src/app/(public)/resources/page.tsx` — "Browse by Lens" filter
- `src/components/content/LensFilterTabs.tsx` — add new values
- `src/components/brand/LensBadge.tsx` — add color mappings
- Supabase: update `lens` column check constraint in a migration
- Update article seed data

**Unblocks:** Richer content categorization, more precise reader targeting
