---
name: bmj-membership
description: Use when working with membership tiers, content access control, Stripe billing, paywall gates, or the member portal. Triggers on "tier", "paywall", "access control", "subscription", "checkout", "billing", "member portal".
---

# BMJ Membership & Access Control

How tiers, billing, and content gating work.

## Doc context (Tier A/B)

[AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md). **Task-scoped:** Stripe and tiers in CLAUDE.md; billing ops in [docs/ops/member-billing-sop.md](../../docs/ops/member-billing-sop.md); env names in [docs/ops/env-vars.md](../../docs/ops/env-vars.md).

## Tier Hierarchy

```
free < basic < premium
```

- **free**: public articles, briefing previews, video gallery, academy
- **basic**: full briefing archive, select handbooks, member-only resources
- **premium**: everything — all handbooks, downloads, private content, early access

## Key Rules

1. **Never compare tier strings directly** — always use helpers:
   ```tsx
   import { includesTier, compareTiers } from '@/lib/membership';
   includesTier('premium', 'basic'); // true — premium includes basic
   compareTiers('basic', 'premium'); // -1 — basic < premium
   ```

2. **Access checking** — use `checkContentAccess()`:
   ```tsx
   import { checkContentAccess } from '@/lib/supabase/access';
   const { hasAccess, user } = await checkContentAccess(content.access_tier);
   ```

3. **Paywall rendering** — show preview + gate:
   ```tsx
   {hasAccess ? (
     <FullContent />
   ) : (
     <PaywallGate
       requiredTier={content.access_tier}
       previewBody={content.body.slice(0, 300)}
       isLoggedIn={!!user}
       nextHref={`/articles/${content.slug}`}
     />
   )}
   ```

## Stripe Integration

| Flow | Route | Description |
|------|-------|-------------|
| Membership checkout | `/api/stripe/checkout` | Creates Stripe Checkout session for basic/premium |
| Donation | `/api/stripe/donate` | One-time or recurring donation |
| Manage billing | `/api/stripe/manage-billing` | Redirects to Stripe Customer Portal |
| Webhook | `/api/stripe/webhook` | Handles subscription lifecycle events |

Config: `src/lib/stripe/config.ts` (client), `src/lib/stripe/helpers.ts` (session creation)

## Member Portal

- Route: `src/app/(auth)/portal/`
- Settings: `src/app/(auth)/portal/settings/` (tier upgrade, profile)
- Components: `src/components/portal/` (CheckoutButton, SubscriptionManager, TierBadge)

## Database Fields

Members table: `email`, `tier` (free|basic|premium), `role` (member|editor|admin), `stripe_customer_id`, `stripe_subscription_id`

Query: `getMemberById()` from `src/lib/supabase/queries.ts`
