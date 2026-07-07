---
title: Secret rotation procedure
status: operational
audience: [engineers, operators]
last-verified: 2026-04-08
---

# Secret Rotation Procedure

> Reference for rotating API keys and secrets used by The Black Male Journal.

## Schedule

- **Annually**: Rotate all secrets on a fixed schedule
- **Immediately**: Rotate if a key is compromised or a team member leaves

## Rotation Steps

### 1. Generate new key
- Log into the service dashboard (Supabase, Stripe, Resend)
- Generate a new API key / secret
- Do NOT revoke the old key yet

### 2. Update Vercel
- Go to Vercel Dashboard > Project > Settings > Environment Variables
- Update the variable with the new value
- Apply to Production, Preview, and Development environments

### 3. Update Bitwarden
- Store the new key in Bitwarden under `Nonprofit / Developer`
- Note the rotation date

### 4. Verify deploy
- Trigger a new deployment (or wait for the next push)
- Verify the app functions correctly with the new key
- Check logs for any auth/API errors

### 5. Revoke old key
- Only after confirming the new key works in production
- Go back to the service dashboard and revoke/delete the old key

## Keys to Rotate

| Key | Service | Dashboard |
|-----|---------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Project Settings > API |
| `STRIPE_SECRET_KEY` | Stripe | Developers > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Developers > Webhooks |
| `RESEND_API_KEY` | Resend | API Keys |

## Notes

- `STRIPE_BASIC_PRICE_ID` and `STRIPE_PREMIUM_PRICE_ID` are not secrets — they are price identifiers. They don't need rotation unless pricing changes.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SITE_URL` are not secrets.
- After rotating Stripe webhook secret, update it in both Vercel and the Stripe Dashboard endpoint configuration.
