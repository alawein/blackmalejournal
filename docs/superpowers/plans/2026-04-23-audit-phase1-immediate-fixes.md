# Audit Phase 1 — Immediate Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the 10 highest-ROI fixes from the codebase audit — broken redirect, wrong brand font, dead Skeleton API, hardcoded hex color, missing rate limits, silent webhook failure, redundant proxy check, over-engineered newsletter parsing, and brand-compliance test gaps.

**Architecture:** All changes are isolated patches. No task depends on another. Each task is self-contained with its own test, implementation, and commit. Run `npm test` after each commit to confirm no regression.

**Tech Stack:** Next.js 16 App Router · `next/font/local` · Zod 4 · Jest + React Testing Library · Tailwind CSS · Supabase · Stripe

---

## File Map

| File | Change |
|---|---|
| `next.config.ts` | Fix redirect destination `/library` → `/records` |
| `src/app/layout.tsx` | Replace `Bebas_Neue` (Google) with Highrise via `next/font/local` |
| `src/styles/brand.css` | Update stale Bebas Neue comment |
| `src/components/ui/Skeleton.tsx` | Remove dead `shimmer` prop and ternary |
| `src/components/admin/dashboard/AttentionQueueSection.tsx` | Replace `#416100` with `bmj-olive` |
| `src/app/api/admin/upload/route.ts` | Add `rateLimit` check |
| `src/app/api/stripe/donate/route.ts` | Add `rateLimit` check |
| `src/app/api/stripe/webhook/route.ts` | Add donation branch to `handleCheckoutCompleted` |
| `src/proxy.ts` | Remove redundant role check |
| `src/app/api/newsletter/subscribe/route.ts` | Move email normalization into Zod transform |
| `tests/brand-compliance.test.ts` | Add hex-literal scan + layout font check |
| `tests/components/Skeleton.test.tsx` | Remove shimmer test, add clean prop-absent test |
| `tests/api/admin-upload.test.ts` | Add 429 rate-limit test |
| `tests/api/stripe-donate.test.ts` | Add 429 rate-limit test |
| `tests/api/stripe-webhook.test.ts` | Add donation `checkout.session.completed` test |

---

## Task 1: Fix broken redirect

**Files:**
- Modify: `next.config.ts:23`

- [ ] **Step 1: Locate the broken redirect in `next.config.ts`**

Line 23 currently reads:
```ts
{ source: '/resources', destination: '/library', permanent: true },
```

- [ ] **Step 2: Fix the destination**

Replace line 23 with:
```ts
{ source: '/resources', destination: '/records', permanent: true },
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "fix: redirect /resources to /records (not /library)"
```

---

## Task 2: Load Highrise via next/font/local

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/styles/brand.css:51`

**Context:** The font chain is: `layout.tsx` sets `--font-bebas-neue` → `brand.css` maps `--font-display: var(--font-bebas-neue)` → Tailwind uses `var(--font-display)`. The fix loads Highrise with the same CSS variable name (`--font-bebas-neue`), so no downstream files need to change.

- [ ] **Step 1: Confirm Highrise font files are present**

```bash
ls public/fonts/highrise-*.otf
```

Expected:
```
public/fonts/highrise-bold.otf
public/fonts/highrise-condensed.otf
public/fonts/highrise-regular.otf
```

- [ ] **Step 2: Update the imports in `src/app/layout.tsx`**

Remove `Bebas_Neue` from the Google Fonts import and add a local font import. The top of the file becomes:

```ts
import localFont from "next/font/local";
import {
  Oswald,
  IBM_Plex_Mono,
  Libre_Baskerville,
  Courier_Prime,
} from "next/font/google";
```

- [ ] **Step 3: Replace the `bebasNeue` declaration with `highrise`**

Remove:
```ts
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});
```

Add (immediately after the new imports):
```ts
const highrise = localFont({
  src: [
    {
      path: "../../public/fonts/highrise-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/highrise-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-bebas-neue",
  display: "swap",
});
```

The `variable` stays `"--font-bebas-neue"` — brand.css already maps this to `--font-display`, so no other file changes.

- [ ] **Step 4: Update the `fontVars` array**

Replace `bebasNeue.variable` with `highrise.variable`:

```ts
const fontVars = [
  highrise.variable,
  libreBaskerville.variable,
  oswald.variable,
  ibmPlexMono.variable,
  courierPrime.variable,
].join(" ");
```

- [ ] **Step 5: Update the stale comment in `src/styles/brand.css`**

Find line 51:
```css
/* Display font weight — Bebas Neue has only weight 400 */
```

Replace with:
```css
/* Display font weight — Highrise ships 400 (regular) and 700 (bold) */
```

- [ ] **Step 6: Type-check and build**

```bash
npx tsc --noEmit && npm run build
```

Expected: no type errors, build succeeds. Next.js will optimize and self-host the Highrise font files.

- [ ] **Step 7: Commit**

```bash
git add src/app/layout.tsx src/styles/brand.css
git commit -m "fix(brand): load Highrise via next/font/local — replaces incorrect Bebas Neue"
```

---

## Task 3: Remove dead Skeleton shimmer prop

**Files:**
- Modify: `src/components/ui/Skeleton.tsx`
- Modify: `tests/components/Skeleton.test.tsx`

**Context:** The `shimmer` prop is accepted, JSDoc-commented, and used by internal callers — but both branches of its ternary produce identical output. The brand prohibits `bg-gradient-*`, making a real gradient-sweep shimmer non-compliant. Removing the prop is the correct fix.

- [ ] **Step 1: Add a test that confirms consistent behavior after removal**

In `tests/components/Skeleton.test.tsx`, add inside `describe('Skeleton')`:

```ts
test('always uses pulse animation regardless of props passed', () => {
  render(<Skeleton data-testid="s" />);
  const el = screen.getByTestId('s');
  expect(el.className).toContain('animate-pulse');
  expect(el.className).toContain('bg-bmj-tan/10');
});
```

- [ ] **Step 2: Run to confirm this test currently passes**

```bash
npx jest tests/components/Skeleton.test.tsx --no-coverage
```

Expected: PASS. (The test documents intended post-removal behavior and already holds true.)

- [ ] **Step 3: Rewrite `Skeleton` component without the `shimmer` prop**

Replace the full `Skeleton` component and its interface (top of `src/components/ui/Skeleton.tsx`) with:

```tsx
import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-bmj-tan/10', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
```

- [ ] **Step 4: Remove `shimmer` from all internal call sites in `Skeleton.tsx`**

Every `<Skeleton shimmer ...>` in `SkeletonCard`, `SkeletonBriefingCard`, `SkeletonDispatchCard`, `SkeletonHandbookCard`, `SkeletonCourseCard`, and `SkeletonCardGrid` — remove the word `shimmer` (and its trailing space). There are approximately 16 occurrences.

Use find-and-replace in the file: replace the string `shimmer ` (with trailing space) with empty string.

Before:
```tsx
<Skeleton shimmer className="aspect-[16/9] w-full" />
```

After:
```tsx
<Skeleton className="aspect-[16/9] w-full" />
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. TypeScript will flag any external call site still passing `shimmer`. If any appear in the output, remove the `shimmer` prop from those call sites too before proceeding.

- [ ] **Step 6: Run tests**

```bash
npx jest tests/components/Skeleton.test.tsx --no-coverage
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Skeleton.tsx tests/components/Skeleton.test.tsx
git commit -m "fix(ui): remove dead shimmer prop from Skeleton — both branches were identical"
```

---

## Task 4: Replace hardcoded hex with brand token

**Files:**
- Modify: `src/components/admin/dashboard/AttentionQueueSection.tsx:38`

- [ ] **Step 1: Locate and replace the hardcoded hex**

Line 38 currently reads:
```tsx
<p className="mt-6 border border-[#416100]/30 bg-[#416100]/10 p-4 font-body text-sm text-bmj-cream/80">
```

Replace with:
```tsx
<p className="mt-6 border border-bmj-olive/30 bg-bmj-olive/10 p-4 font-body text-sm text-bmj-cream/80">
```

- [ ] **Step 2: Run brand compliance test**

```bash
npx jest tests/brand-compliance.test.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add "src/components/admin/dashboard/AttentionQueueSection.tsx"
git commit -m "fix(brand): replace hardcoded #416100 with bmj-olive token"
```

---

## Task 5: Add rate limit to admin upload endpoint

**Files:**
- Modify: `src/app/api/admin/upload/route.ts`
- Modify: `tests/api/admin-upload.test.ts`

- [ ] **Step 1: Add rate limit mock and failing test to `tests/api/admin-upload.test.ts`**

At the top of the file alongside the existing mocks, add:

```ts
const mockRateLimitCheck = jest.fn();
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({ check: mockRateLimitCheck }),
}));
```

In the `beforeEach` block, add the default allow response:

```ts
mockRateLimitCheck.mockResolvedValue({ success: true, remaining: 19 });
```

Add this test inside `describe('POST /api/admin/upload')`:

```ts
it('returns 429 when rate limit exceeded', async () => {
  mockRateLimitCheck.mockResolvedValue({ success: false, remaining: 0 });
  const req = makeRequest();
  const res = await POST(req);
  expect(res.status).toBe(429);
  const body = await res.json();
  expect(body.error).toBe('Too many requests');
});
```

- [ ] **Step 2: Run to confirm the test fails**

```bash
npx jest tests/api/admin-upload.test.ts --no-coverage
```

Expected: FAIL — `returns 429 when rate limit exceeded` fails because the route has no rate limiting yet.

- [ ] **Step 3: Add rate limiting to `src/app/api/admin/upload/route.ts`**

Add after the existing imports at the top of the file:

```ts
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
```

At the start of `POST`, after the auth checks and before `formData`:

```ts
export async function POST(request: Request) {
  const actor = await getAdminActor(['admin', 'editor']);
  if (!actor.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (!actor.member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success } = await limiter.check(20, ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const formData = await request.formData();
  // ... rest unchanged
```

- [ ] **Step 4: Run to confirm tests pass**

```bash
npx jest tests/api/admin-upload.test.ts --no-coverage
```

Expected: PASS — all tests pass including the new 429 test.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/upload/route.ts tests/api/admin-upload.test.ts
git commit -m "fix(security): add rate limit to admin upload endpoint (20 req/min/IP)"
```

---

## Task 6: Add rate limit to donation endpoint

**Files:**
- Modify: `src/app/api/stripe/donate/route.ts`
- Modify: `tests/api/stripe-donate.test.ts`

- [ ] **Step 1: Add rate limit mock and failing test to `tests/api/stripe-donate.test.ts`**

At the top of the file alongside existing mocks, add:

```ts
const mockRateLimitCheck = jest.fn();
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({ check: mockRateLimitCheck }),
}));
```

In `beforeEach` (or add one), include:

```ts
mockRateLimitCheck.mockResolvedValue({ success: true, remaining: 9 });
```

Add this test:

```ts
it('returns 429 when rate limit exceeded', async () => {
  mockRateLimitCheck.mockResolvedValue({ success: false, remaining: 0 });
  const req = makeRequest(validOneTime);
  const res = await POST(req);
  expect(res.status).toBe(429);
  const body = await res.json();
  expect(body.error).toBe('Too many requests');
});
```

- [ ] **Step 2: Run to confirm the test fails**

```bash
npx jest tests/api/stripe-donate.test.ts --no-coverage
```

Expected: FAIL — `returns 429 when rate limit exceeded` fails because the route has no rate limiting yet.

- [ ] **Step 3: Add rate limiting to `src/app/api/stripe/donate/route.ts`**

Add after the existing imports at the top:

```ts
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });
```

At the start of `POST`, before the `body` parse:

```ts
export async function POST(request: Request) {
  const siteUrl = resolveSiteUrl();

  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success } = await limiter.check(10, ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  // ... rest unchanged
```

- [ ] **Step 4: Run to confirm tests pass**

```bash
npx jest tests/api/stripe-donate.test.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/stripe/donate/route.ts tests/api/stripe-donate.test.ts
git commit -m "fix(security): add rate limit to donation endpoint (10 req/min/IP)"
```

---

## Task 7: Add donation branch to Stripe webhook

**Files:**
- Modify: `src/app/api/stripe/webhook/route.ts`
- Modify: `tests/api/stripe-webhook.test.ts`

- [ ] **Step 1: Add a failing test for donation webhook handling in `tests/api/stripe-webhook.test.ts`**

Locate the existing `checkout.session.completed` test section. Add:

```ts
it('handles donation checkout.session.completed without updating member tier', async () => {
  const donationSession = {
    id: 'cs_test_donation',
    metadata: { type: 'donation' },
    customer_email: 'donor@example.com',
    amount_total: 2500,
    customer: null,
    subscription: null,
  };

  mockConstructEvent.mockReturnValue({
    type: 'checkout.session.completed',
    data: { object: donationSession },
  });

  const req = makeRequest('{}', 'stripe-sig');
  const res = await POST(req);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.received).toBe(true);
});
```

(Adjust `mockConstructEvent` and `makeRequest` to match the names used in the existing webhook test file.)

- [ ] **Step 2: Run to confirm test behavior**

```bash
npx jest tests/api/stripe-webhook.test.ts --no-coverage
```

If the test passes without changes (the current handler returns 200 even for donations), confirm it does so without calling member-update logic, then proceed. If it fails, the implementation change in Step 3 is needed.

- [ ] **Step 3: Add donation branch to `handleCheckoutCompleted` in `src/app/api/stripe/webhook/route.ts`**

Replace `handleCheckoutCompleted` with:

```ts
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: AdminClient) {
  // Donation payments: log and return — they do not update membership tier
  if (session.metadata?.type === 'donation') {
    const amount = session.amount_total ?? 0;
    const email = session.customer_email ?? 'anonymous';
    console.info(`[webhook] donation.completed: amount=${amount} email=${email}`);
    return;
  }

  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as 'basic' | 'premium' | undefined;

  if (!userId || !tier) {
    console.error('[webhook] Missing metadata on checkout session');
    return;
  }

  const customerId = resolveCustomerId(session.customer);
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  const result = await supabase
    .from('members')
    .update({
      tier,
      stripe_customer_id: customerId ?? null,
      stripe_subscription_id: subscriptionId ?? null,
    })
    .eq('id', userId);
  assertMutationSucceeded(result, 'Failed to update member after checkout completion');

  console.info(`[webhook] checkout.session.completed: user=${userId} tier=${tier}`);
}
```

- [ ] **Step 4: Run tests**

```bash
npx jest tests/api/stripe-webhook.test.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts tests/api/stripe-webhook.test.ts
git commit -m "fix(webhook): handle donation checkout.session.completed — log instead of silent no-op"
```

---

## Task 8: Remove redundant role check in proxy

**Files:**
- Modify: `src/proxy.ts:51–61`

- [ ] **Step 1: Run existing middleware tests to establish baseline**

```bash
npx jest tests/middleware/middleware.test.ts --no-coverage
```

Expected: PASS. Note which tests cover admin route protection.

- [ ] **Step 2: Remove the redundant role check**

In `src/proxy.ts`, replace this block:

```ts
const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
if (isAdmin && user) {
  const actor = await getAdminActor(['admin', 'editor'], user.id);
  const member = actor.member;

  if (!member || (member.role !== 'admin' && member.role !== 'editor')) {
    const portalUrl = request.nextUrl.clone();
    portalUrl.pathname = PATHS.PORTAL;
    portalUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(portalUrl);
  }
}
```

With:

```ts
const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
if (isAdmin && user) {
  const actor = await getAdminActor(['admin', 'editor'], user.id);
  if (!actor.member) {
    const portalUrl = request.nextUrl.clone();
    portalUrl.pathname = PATHS.PORTAL;
    portalUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(portalUrl);
  }
}
```

The `member` local variable is eliminated. The `!actor.member` check is sufficient — `getAdminActor(['admin', 'editor'], ...)` already returns `member: null` when the role is not `admin` or `editor`.

- [ ] **Step 3: Run middleware tests to confirm behavior is unchanged**

```bash
npx jest tests/middleware/middleware.test.ts --no-coverage
```

Expected: PASS — same tests pass, same guard behavior.

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/proxy.ts
git commit -m "refactor(proxy): remove redundant role check — getAdminActor already filters by role"
```

---

## Task 9: Move newsletter email normalization into Zod transform

**Files:**
- Modify: `src/app/api/newsletter/subscribe/route.ts`

- [ ] **Step 1: Run existing newsletter tests to establish baseline**

```bash
npx jest tests/api/newsletter-subscribe.test.ts --no-coverage
```

Expected: PASS. Note which tests verify that submitted emails are processed correctly.

- [ ] **Step 2: Simplify the schema and handler**

In `src/app/api/newsletter/subscribe/route.ts`, replace the schema:

```ts
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().optional(),
});
```

With:

```ts
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address').transform(normalizeEmailAddress),
  source: z.string().optional().transform((s) => s?.trim()),
});
```

Replace the pre-Zod manual processing block (all of this):

```ts
const payload = typeof body === 'object' && body !== null
  ? body as Record<string, unknown>
  : {};
const result = subscribeSchema.safeParse({
  ...payload,
  email: typeof payload.email === 'string'
    ? normalizeEmailAddress(payload.email)
    : payload.email,
  source: typeof payload.source === 'string'
    ? payload.source.trim()
    : payload.source,
});
```

With:

```ts
const result = subscribeSchema.safeParse(body);
```

- [ ] **Step 3: Run tests to confirm behavior is preserved**

```bash
npx jest tests/api/newsletter-subscribe.test.ts --no-coverage
```

Expected: PASS — normalization still happens; it just happens inside Zod now.

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. Zod's `.transform()` changes the output type of `result.data` to the transformed value, which is correct.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/newsletter/subscribe/route.ts
git commit -m "refactor(api): move newsletter email normalization into Zod transform"
```

---

## Task 10: Extend brand-compliance test

**Files:**
- Modify: `tests/brand-compliance.test.ts`

- [ ] **Step 1: Add the hex-literal scan describe block**

In `tests/brand-compliance.test.ts`, add a new `describe` block after the existing `'Brand Compliance Guard'` describe:

```ts
describe('Brand Token Enforcement', () => {
  const BRAND_HEX_VALUES = new Set([
    // Primary colors — must use bmj-* tokens, not raw hex
    '0D0C0B', 'E8DCC8', 'C0281F', 'C8852A', '3B2417', 'B8986A', 'F2EDE4',
    // Sectional accent colors
    'F0DDBC', '1C130E', '712414', '5D3F2E', '416100', 'C77A0E', '554978',
  ]);

  it('no component uses hardcoded brand hex in Tailwind arbitrary value syntax', () => {
    // Pattern: [#416100] or [#C0281F] — Tailwind arbitrary hex values
    const inlineHexPattern = /\[#([0-9A-Fa-f]{6})\]/g;
    const violations: string[] = [];

    for (const filePath of componentFiles) {
      const content = readFileSync(filePath as string, 'utf-8');
      const relPath = relative(COMPONENTS_DIR, filePath);
      const matches = content.match(inlineHexPattern) ?? [];

      for (const match of matches) {
        // match is like [#416100] — extract the 6-char hex
        const hex = match.slice(2, -1).toUpperCase();
        if (BRAND_HEX_VALUES.has(hex)) {
          violations.push(`${relPath}: found ${match} — use bmj-* token instead`);
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        'Brand hex violations (use token classes, not raw hex):\n' +
          violations.map((v) => `  - ${v}`).join('\n') +
          '\n\nSee .claude/rules/brand.md for token names.',
      );
    }
  });

  it('root layout loads Highrise via next/font/local, not Bebas Neue from Google', () => {
    const layoutPath = join(__dirname, '..', 'src', 'app', 'layout.tsx');
    const content = readFileSync(layoutPath, 'utf-8');

    expect(content).toContain('next/font/local');
    expect(content).toContain('highrise-regular.otf');
    expect(content).not.toContain('Bebas_Neue');
  });
});
```

Note: `join`, `readFileSync`, `relative`, and `componentFiles` are already in scope from the top of the file.

- [ ] **Step 2: Run to confirm both new tests pass**

```bash
npx jest tests/brand-compliance.test.ts --no-coverage
```

Expected: PASS — Task 2 loaded Highrise; Task 4 replaced `#416100`. Both guards are satisfied.

- [ ] **Step 3: Commit**

```bash
git add tests/brand-compliance.test.ts
git commit -m "test(brand): add hex-literal scan and font-loading invariant to brand-compliance guard"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
npm test
```

Expected: all tests pass, no new failures.

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Build**

```bash
npm run build
```

Expected: build succeeds.

---

## What's Next

Phase 2 (governance — generated Supabase types, barrel collapse, ESLint rules, coverage thresholds) and Phase 3 (architecture — atomic rate limiter, FilterTabs, error boundaries, toast system) are documented in the audit spec at `docs/superpowers/specs/2026-04-23-codebase-audit-design.md` and will each have their own implementation plan.
