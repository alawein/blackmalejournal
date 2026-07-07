---
title: Backup and restore
status: operational
audience: [engineers, operators]
last-verified: 2026-04-08
---

# Backup and Restore

This project depends on Supabase Postgres, Supabase Storage, and Vercel environment variables. Backups are only useful if all three are recoverable.

## Weekly Backup Checklist

1. Export the production database using the approved Supabase backup path for your team.
2. Export the `covers`, `downloads`, and `media` storage buckets.
3. Verify Vercel environment variables against [env-vars.md](env-vars.md).
4. Store the backup bundle in the approved org-controlled location.
5. Record the backup date, environment, and operator initials.

## What Must Be Recoverable

- Database tables: `articles`, `briefings`, `dispatches`, `handbooks`, `downloads`, `courses`, `lessons`, `members`, `newsletter_subscribers`, `contact_submissions`
- Storage buckets: `covers`, `downloads`, `media`
- Runtime config: Vercel Development, Preview, and Production env vars

## Restore Drill

1. Create or select a non-production Supabase project for the drill.
2. Restore the database dump.
3. Restore the storage buckets.
4. Set the environment variables for the restored environment.
5. Run:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm test -- --ci`
   - `npm run build`
6. Verify these routes manually:
   - `/`
   - `/pricing`
   - `/portal`
   - `/portal/settings`
   - `/admin`
   - `/academy`
   - `/downloads`

## Restore Order

1. Environment variables
2. Database
3. Storage buckets
4. Application deploy
5. Payment and auth callback verification

## After Any Restore

- Re-register Stripe webhooks if the host URL changed.
- Reconfirm Supabase auth callback URLs.
- Test a member checkout in the restored environment.
- Test a signed download from `/downloads`.
