---
title: Troubleshooting
status: canonical
audience: [engineers, contributors]
last-verified: 2026-04-08
---

# Troubleshooting

> Common issues and fixes. Check here before filing a bug.

## Build Failures

### "Cannot find module" after renaming a route directory

**Symptom:** `npx tsc --noEmit` reports `Cannot find module` for a path that no longer exists.

**Cause:** Stale type artifacts in `.next/types/validator.ts`.

**Fix:**
```bash
rm -rf .next
npx tsc --noEmit
```

### Tailwind class "does not exist" error

**Symptom:** `CssSyntaxError: The 'text-bmj-cream/80' class does not exist` during build.

**Cause:** Someone replaced hex values in `tailwind.config.ts` with `var(--bmj-*)`. Tailwind opacity modifiers (`/80`, `/10`, etc.) require decomposable hex values, not CSS variables.

**Fix:** Revert `tailwind.config.ts` colors to hex values. The canonical hex values are in `src/styles/brand.css`. The drift-detection hook (`.claude/hooks/drift-detection.sh`) guards against this.

### "SWC binary not found" or test crashes after switching OS

**Symptom:** Tests or builds crash with SWC-related errors after switching between Windows/WSL/macOS.

**Fix:**
```bash
rm -rf node_modules
npm install
```

## Development Server

### Next.js dev server won't stop (Windows)

**Symptom:** Port 3000 is still occupied after closing the terminal.

**Fix:**
```powershell
# Find the process
Get-Process node
# Kill it
Stop-Process -Id <PID> -Force
```

`pkill` and `taskkill /F /IM node.exe` are unreliable on Windows.

### Hot reload not working

**Cause:** Usually a file watcher limit or a stale `.next` cache.

**Fix:**
```bash
rm -rf .next
npm run dev
```

## Database (Supabase)

### "relation does not exist" error

**Cause:** Missing migration or connecting to wrong Supabase project.

**Fix:**
1. Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
2. Run pending migrations:
   ```bash
   supabase db push     # for remote
   supabase db reset    # for local (destructive — re-seeds)
   ```

### Seed data is empty

**Fix:**
```bash
npx tsx scripts/seed-all.ts    # All tables (clean slate)
npx tsx scripts/seed.ts         # Articles only (upsert)
```

Or apply individual SQL seeds:
```bash
supabase db reset  # Runs all seed-*.sql files
```

### "JWT expired" or auth errors

**Cause:** Supabase session expired and middleware couldn't refresh.

**Fix:** Clear cookies and re-login. If persistent, check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` matches the Supabase dashboard.

## Stripe

### Webhook not firing locally

**Setup:** Stripe webhooks require the CLI to forward events locally.

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret (starts with `whsec_`) to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### "No signatures found matching the expected signature"

**Cause:** `STRIPE_WEBHOOK_SECRET` in `.env.local` doesn't match the Stripe CLI or Dashboard.

**Fix:** Regenerate the webhook endpoint in Stripe and update `.env.local`.

### Subscription created but member tier not updated

**Cause:** Webhook failed or wasn't received.

**Check:**
1. Stripe Dashboard > Webhooks > check delivery logs
2. Supabase > members table > check `stripe_customer_id` and `tier`
3. Application logs for webhook handler errors

## Tests

### "useInView is not a function"

**Cause:** Framer Motion mock in `tests/setup.ts` is missing `useInView`.

**Fix:** Ensure `tests/setup.ts` mocks all used Framer Motion exports:
```ts
jest.mock('framer-motion', () => ({
  motion: { div: 'div', ... },
  AnimatePresence: ({ children }) => children,
  useReducedMotion: jest.fn(() => false),
  useInView: jest.fn(() => true),
}));
```

### Tests fail with "document is not defined"

**Cause:** A server-only module is being tested in jsdom environment, or vice versa.

**Fix:** Check the test's `jest` environment pragma:
```ts
/** @jest-environment jsdom */  // for component tests
/** @jest-environment node */   // for server-side tests
```

### Snapshot tests are stale

**Fix:**
```bash
npm test -- --updateSnapshot
```

## Environment Variables

### "Missing environment variable" at build time

**Fix:**
1. Check `.env.local` has the variable
2. Check if it needs `NEXT_PUBLIC_` prefix (client-side access requires it)
3. On Vercel: check Settings > Environment Variables

See [docs/ops/env-vars.md](ops/env-vars.md) for the complete variable list.

### Variable works locally but not on Vercel

**Common causes:**
- Variable not added to Vercel environment settings
- Variable added to wrong environment (Preview vs Production)
- Missing `NEXT_PUBLIC_` prefix for client-side variable

## Deployment (Vercel)

### Build passes locally but fails on Vercel

**Common causes:**
1. Missing environment variables on Vercel
2. Case sensitivity (Vercel runs Linux; Windows filenames are case-insensitive)
3. Different Node.js version (check `engines` in `package.json`)

### Preview deployment shows stale content

**Cause:** Vercel caches aggressively. Content from Supabase should be fresh, but static assets may be cached.

**Fix:** Wait for cache invalidation (usually automatic) or trigger a manual redeploy from the Vercel dashboard.

## Admin Panel

### Admin page shows "Not authorized"

**Cause:** Your member record doesn't have `role: 'admin'` or `role: 'editor'`.

**Fix:** Update the member's role in Supabase:
```sql
UPDATE members SET role = 'admin' WHERE email = 'your@email.com';
```

### File upload fails

**Common causes:**
1. Supabase Storage bucket doesn't exist or has wrong permissions
2. File exceeds size limit
3. MIME type not allowed in bucket policy

**Fix:** Check Supabase Dashboard > Storage > bucket policies.

### Content published but not visible on site

**Checklist:**
1. Is `status` set to `published`?
2. Is `published_at` in the past (not future)?
3. Is the content's `access_tier` accessible to the viewer?
4. Clear `.next` cache and rebuild if using ISR

## Performance

### Pages load slowly

1. Check if images have `sizes` prop on `<Image>` components
2. Check for N+1 queries in server components
3. Use `count: 'exact', head: true` for count-only queries (already done in admin-queries/counts.ts)
4. Check Vercel Analytics for specific slow routes
