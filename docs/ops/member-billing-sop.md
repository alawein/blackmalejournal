---
title: Member billing SOP
status: operational
audience: [operators]
last-verified: 2026-04-08
---

# Member Billing SOP

Use this for tier changes, billing support, and paid-access problems.

## Member Lookup

1. Go to `/admin/members`.
2. Check the billing-exceptions card first if the issue is a paid-access mismatch.
2. Search by email.
3. Open the member detail page.

## What You Can Change in Admin

- Tier: `free`, `basic`, `premium`
- Role: `member`, `editor`, `admin`
- Read-only Stripe references:
  - `stripe_customer_id`
  - `stripe_subscription_id`

## Billing Triage

1. If checkout succeeded but access did not change, verify the member’s Stripe IDs are present.
2. If Stripe IDs are missing, inspect the Stripe webhook configuration at `/api/stripe/webhook`.
3. If the member has a Stripe customer ID, ask them to use `/portal/settings` and choose `Manage Billing`.
4. If access needs a temporary manual correction, update the tier in `/admin/members/[id]` and record the reason.

## Safeguards

- Do not remove your own admin role.
- Do not demote the final `admin`.
- Treat webhook-confirmed Stripe state as the long-term source of truth.

## Common Outcomes

- Checkout cancelled: member remains on existing tier.
- Active subscription: member should have Stripe customer and subscription IDs.
- Subscription deleted: tier should return to `free`.
