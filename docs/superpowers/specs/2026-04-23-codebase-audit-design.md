---
title: BMJ Codebase Audit — Full System Review
date: 2026-04-23
author: Claude Sonnet 4.6 (audit) / Meshal Alawein (review)
status: approved
---

# BMJ Codebase Audit — Full System Review

**Scope:** Complete audit of the Black Male Journal codebase as of 2026-04-23.
**Stack:** Next.js 16.2.3 · React 19 · Supabase SSR 0.9.0 · Stripe 20.4.1 · Zod 4.3.6 · Tailwind 3.4.19
**Format:** Domain-layered findings (front-end → architecture → API/security → governance), then roadmap and implementation plan.
**Priority weight:** Brand/visual drift and codebase navigability are primary. Test maintenance and security/correctness are secondary.

---

## A. Executive Summary

**Overall health: Structurally sound, visually drifting, navigability eroding.**

The codebase is well-architected at the macro level. The App Router structure is correct. The query layer is properly separated (public vs. admin). Auth and access control follow sound patterns. The Stripe webhook is implemented correctly with signature verification. The test suite is comprehensive and the CI governance is real — not cosmetic.

The problems are not architectural collapse. They are accumulated drift: a brand font that doesn't match the spec, a Skeleton component with a dead API, hardcoded hex colors slipping past the brand compliance tests, a broken redirect pointing at a non-existent route, and a distributed rate limiter with a race condition nobody has hit yet. Individually minor. Collectively: the codebase is slowly becoming unreliable as a reference for itself.

### Main strengths

- Clean domain separation in `lib/supabase/queries/` vs `lib/supabase/admin-queries/`
- Consistent Zod validation at all API boundaries
- Stripe webhook with proper signature verification and correct DB mutations
- React `cache()` on `getAuthUser` — correct pattern for per-request deduplication
- `withRetry` is a clean, well-tested utility
- CLAUDE.md is a genuine governance document, not a stub
- CI gates (lint, build, docs links, frontmatter) are real enforcement
- `drift-detection.sh` hook actively guards `tailwind.config.ts` vs `brand.css` divergence

### Main risks

- Brand display font is wrong at the root layout level — every page renders with Bebas Neue (Google Fonts) instead of Highrise (self-hosted) despite the brand spec being explicit
- Distributed rate limiter has a TOCTOU race — not blocking today, but ineffective under real burst load
- Codebase navigability is eroding: double-barrel exports, two parallel query hierarchies, growing `docs/` tree
- Test suite volume (136 suites) is accumulating maintenance weight with diminishing signal from boundary-only tests

**Verdict: Do not rebuild. Refactor and enforce.** The foundation is correct. The drift needs to be caught and locked down before it compounds further.

---

## B. Priority Findings

### Front-end & Brand (primary)

#### B-FE-1 · Critical · Root layout uses the wrong display font

- **Files:** `src/app/layout.tsx:25–30`, `public/fonts/`, CLAUDE.md brand spec, `.claude/rules/brand.md`
- **Evidence:** Root layout imports `Bebas_Neue` from `next/font/google` and maps it to `--font-bebas-neue`. The brand spec explicitly states: *"Display/Headlines: Highrise (self-hosted, next/font/local) — always ALL-CAPS."* Highrise is not loaded anywhere in the codebase.
- **Impact:** Every headline on every public page renders in the wrong font. This is the brand's most visible invariant, broken at the root.
- **Action:** Determine whether Highrise has been replaced by editorial decision (update brand spec) or whether this is an implementation error (load Highrise via `next/font/local` from `public/fonts/`). The spec and implementation must agree. Either outcome is acceptable; disagreement is not.
- **Type:** Refactor — resolve the spec/implementation contradiction
- **Effort:** Low once font decision is made

#### B-FE-2 · High · `Skeleton` shimmer prop is a dead API surface

- **File:** `src/components/ui/Skeleton.tsx:13–16`
- **Evidence:** Both branches of the `shimmer` ternary produce identical output: `'animate-pulse bg-bmj-tan/10'`. The prop is accepted, JSDoc-commented, and used by callers — but does nothing. The shimmer animation either never got implemented or was removed without removing the prop.
- **Impact:** Every call site using `shimmer={true}` silently behaves identically to not using it. The API misleads future readers and maintainers.
- **Action:** Implement a real shimmer animation (e.g., a gradient sweep keyframe defined in Tailwind config under `animations.shimmer`) or remove the `shimmer` prop and update all call sites.
- **Type:** Patch (implement) or Remove (drop prop)
- **Effort:** Low

#### B-FE-3 · High · Hardcoded hex `#416100` bypasses brand token system

- **File:** `src/components/admin/dashboard/AttentionQueueSection.tsx:38`
- **Evidence:** Line 38 uses `border-[#416100]/30 bg-[#416100]/10` directly in JSX. The brand token `bmj-olive` (`--bmj-olive: #416100`) is already defined in `brand.css` and wired into the Tailwind config.
- **Impact:** If the olive color changes, this component won't update. More critically, this reached production because `tests/brand-compliance.test.ts` does not scan component source for hex literals matching brand token values.
- **Action:** Replace with `border-bmj-olive/30 bg-bmj-olive/10`. Extend brand compliance test to grep `src/components/**` for hex literals matching any of the 7 primary brand colors and sectional accent colors.
- **Type:** Patch the component, Refactor the test
- **Effort:** Low

#### B-FE-4 · Medium · Brand animation utilities are bypassed with raw Tailwind

- **Files:** `src/components/admin/dashboard/AttentionQueueSection.tsx:48–52`, multiple other components
- **Evidence:** Item rows use inline `hover:-translate-y-0.5` rather than the `.hover-lift` utility defined in the brand animation system. This pattern recurs across components.
- **Impact:** Hover behavior, shadow depth, and transition timing become inconsistent across components that are supposed to feel like the same system. The semantic animation layer is defined but not used.
- **Action:** Grep all components for `hover:translate-*` and `hover:scale-*`. Replace with `.hover-lift` / `.hover-scale` where the brand system provides them. Add an ESLint rule that flags raw hover transforms in JSX when the semantic alternatives exist.
- **Type:** Refactor
- **Effort:** Medium (audit required across 40+ components)

#### B-FE-5 · Low · Admin display name derived from email prefix

- **File:** `src/app/(auth)/admin/layout.tsx:12`
- **Evidence:** `actor.member.email?.split('@')[0] || 'Admin'` — display name is the email username.
- **Impact:** Fragile. If email changes or a second admin is added with a non-descriptive address, the display breaks silently.
- **Action:** Hardcode `'The Chairman'` given CLAUDE.md establishes this is a single-author setup, or add a `display_name` field to the `members` table.
- **Type:** Patch
- **Effort:** Trivial

---

### Navigability & Architecture (primary)

#### B-NA-1 · High · Broken redirect points at non-existent route

- **File:** `next.config.ts:23`
- **Evidence:** `{ source: '/resources', destination: '/library', permanent: true }`. The route `/library` does not exist — it was renamed to `/records`. Any user following a `/resources` bookmark receives a 404 after the redirect.
- **Impact:** SEO damage, broken user-facing links, link equity passed to a dead URL.
- **Action:** Change destination to `/records`. Verify the full `/library` → `/records` rename was completed across all redirect chains.
- **Type:** Patch
- **Effort:** Trivial

#### B-NA-2 · Medium · `queries.ts` is a redundant barrel wrapping another barrel

- **Files:** `src/lib/supabase/queries.ts`, `src/lib/supabase/queries/index.ts`
- **Evidence:** `queries.ts` contains one line: `export * from './queries/index'`. Then `queries/index.ts` re-exports from 8 domain files. Two levels of barrel with no behavioral difference. `admin-queries.ts` → `admin-queries/index.ts` follows the same pattern.
- **Impact:** Navigating from a call site to the implementation of `getArticles` requires 3 hops. Adds friction for zero benefit.
- **Action:** Delete `src/lib/supabase/queries.ts`. TypeScript and Next.js resolve `@/lib/supabase/queries` to `queries/index.ts` automatically. Same for `admin-queries.ts`.
- **Type:** Refactor
- **Effort:** Low (mechanical, touches import sites)

#### B-NA-3 · Medium · `getMemberById` is not request-memoized — called twice on every admin page

- **Files:** `src/proxy.ts:52`, `src/app/(auth)/admin/layout.tsx:9`
- **Evidence:** Both middleware and admin layout call `getAdminActor()` / `requireAdminActor()`, which both call `getMemberById()`. `getAuthUser` is wrapped in React `cache()` and deduplicates. `getMemberById` is not — it hits the database twice for every admin page load.
- **Impact:** One unnecessary DB query per admin request. The pattern is architecturally wrong regardless of current traffic level.
- **Action:** Wrap `getMemberById` with React `cache()`. One import, one wrapper, no API surface change.
- **Type:** Patch
- **Effort:** Trivial

#### B-NA-4 · Medium · `as never` casts signal unresolved SDK type mismatch

- **File:** `src/lib/rate-limit.ts:72, 92`
- **Evidence:** `upsertPayload = { ... } as never` and `.update({ ... } as never)`. These escape hatches exist because the project uses hand-rolled type aliases rather than generated Supabase types — the SDK's structural type check fails, and `as never` silences it.
- **Impact:** Renamed columns and schema changes fail at runtime, not at compile time. TypeScript's protection is disabled for these mutations.
- **Action:** Generate types with `supabase gen types typescript`. Derive `types.ts` aliases from generated types. The `as never` casts then resolve naturally.
- **Type:** Refactor (medium scope)
- **Effort:** Medium (schema introspection + type derivation)

---

### Testing (secondary)

#### B-T-1 · Medium · Boundary tests verify exports exist, not behavior

- **File:** `tests/lib/supabase-queries-boundary.test.ts`
- **Evidence:** Tests like `expect(typeof queries.getArticles).toBe('function')` verify the export map, not function behavior, return shapes, or error handling.
- **Impact:** These tests break on renames (maintenance cost) but catch no regressions (zero signal). They inflate the suite count without adding protection.
- **Action:** Delete these tests and replace with behavior tests against a test database, or promote to integration tests using a local Supabase instance. Do not maintain tests that only verify the export map.
- **Type:** Redesign
- **Effort:** Medium

#### B-T-2 · Low · No coverage thresholds on critical paths

- **File:** `jest.config.ts` (or absence of coverage thresholds in it)
- **Evidence:** `npm test` runs all suites but no `coverageThreshold` is configured. Suite count is high but coverage enforcement is absent.
- **Action:** Add targeted coverage thresholds for `src/lib/stripe/**` (80% lines), `src/lib/supabase/queries/**` (70%), and `src/app/api/**` (70%). Global thresholds are too aggressive for a moving codebase.
- **Type:** Refactor
- **Effort:** Low

---

### Security & Correctness (secondary)

#### B-SC-1 · High · Distributed rate limiter has TOCTOU race condition

- **File:** `src/lib/rate-limit.ts:60–98`
- **Evidence:** The function reads the current count, checks against the limit, then updates in separate Supabase calls. Two concurrent requests at count=4 (limit=5) can both read 4, both pass the check, both increment — resulting in count=6. No atomic compare-and-increment.
- **Impact:** Rate limiting is ineffective under burst load in production. The in-memory fallback (the only path that works locally) has the same race but is less exposed.
- **Action:** Replace the read-check-update pattern with a Supabase RPC that performs atomic `INSERT ... ON CONFLICT DO UPDATE SET request_count = request_count + 1 RETURNING request_count`. Alternatively, add Upstash Redis via the Vercel marketplace for true atomic counters.
- **Type:** Refactor
- **Effort:** Medium

#### B-SC-2 · Medium · Admin upload endpoint has no rate limit

- **File:** `src/app/api/admin/upload/route.ts`
- **Evidence:** Every other user-facing API route uses `rateLimit()`. The upload route — accepting files up to 50MB — does not.
- **Impact:** A compromised or rogue admin/editor account can loop upload requests and exhaust storage bandwidth or quota.
- **Action:** Add `rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 })` with a limit of 20 uploads/minute/IP. Same pattern as other API routes.
- **Type:** Patch
- **Effort:** Trivial

#### B-SC-3 · Medium · Donation payments fire a webhook that silently no-ops

- **File:** `src/app/api/stripe/webhook/route.ts:113–131`
- **Evidence:** The donate endpoint creates a `payment` mode session with `metadata.type: 'donation'`. When the payment completes, Stripe fires `checkout.session.completed`. The handler checks for `metadata.userId` and `metadata.tier` — neither set for donations — logs "Missing metadata on checkout session," and returns. The payment succeeds on Stripe's side; nothing happens server-side.
- **Impact:** No server-side record of completed donations. Extending the flow later (confirmation email, donor log) has no hook to attach to.
- **Action:** Add a `metadata.type === 'donation'` branch in `handleCheckoutCompleted` that at minimum logs the donation amount and email. Silent returns on payment events are operational traps.
- **Type:** Patch
- **Effort:** Low

---

## C. Architecture Assessment

### Current architecture summary

Three-layer system: Next.js App Router (presentation + routing) → `lib/` service layer (queries, auth, Stripe, rate limiting) → Supabase + Stripe (persistence + payments). The separation is clean and largely correct.

Route groups: `(public)/` for unauthenticated content, `(auth)/` for portal + admin. API routes are appropriately thin — validate with Zod, call lib functions, return responses. No business logic in route handlers.

Query layer has two parallel hierarchies:

```
lib/supabase/
  queries.ts                → one-liner re-export of queries/index.ts
  queries/
    index.ts                → re-exports 8 domain files
    articles.ts, briefings.ts, dispatches.ts, courses.ts,
    downloads.ts, handbooks.ts, members.ts, subscriptions.ts, search.ts
    _shared.ts              → fetchRows, fetchSingle, executeUpdate, applyPublicContentVisibility

  admin-queries.ts          → one-liner re-export of admin-queries/index.ts
  admin-queries/
    index.ts                → re-exports 15 domain files
    articles.ts, briefings.ts, campaigns.ts, counts.ts, insights.ts,
    members.ts, subscribers.ts, ...
```

The domain separation between public and admin queries is architecturally correct — they serve different clients (anon vs service role) and different consumers. The double-barrel wrapping is not.

### Key architectural problems

1. **No generated database types.** Hand-rolled `types.ts` aliases can silently drift from the actual schema. Every query helper in `_shared.ts` casts results with `as T[]` and `as T | null`. The `as never` casts in `rate-limit.ts` are a downstream symptom of this same root cause.

2. **Double-barrel export chains.** `queries.ts` and `admin-queries.ts` are single-line re-exports. Two navigation hops with zero benefit.

3. **`getMemberById` is not request-memoized.** Called twice per admin request (middleware + layout). `getAuthUser` is correctly wrapped in `cache()`; `getMemberById` is not.

4. **In-memory rate limiter is meaningless in serverless.** The `memoryStore` Map lives at module scope. In Vercel's serverless model, each Lambda invocation has its own memory — the store is neither shared across concurrent requests nor persistent across cold starts. The distributed Supabase path is the only effective implementation, but it has the TOCTOU race. In practice the rate limiter works only in local development.

5. **`applyPublicContentVisibility` uses a hand-rolled structural type.** The `PublicVisibilityQuery` interface in `_shared.ts` is a manually-defined duck type to satisfy TypeScript's structural checks on the Supabase query builder. If the SDK changes its builder signatures, TypeScript won't catch the mismatch until runtime. Resolved by adopting generated types.

6. **No observability layer.** Errors are logged with `console.error`. No structured error tracking, no request tracing, no alerting. Silent failures in Stripe webhook handlers are operationally dangerous for a paid membership platform.

### Target architecture

**Keep:** App Router structure, public/admin query separation, Zod at API boundaries, Stripe webhook pattern, `withRetry` utility.

**Refactor:**
- Adopt generated Supabase types; derive `types.ts` aliases from them
- Collapse double-barrel exports (delete the one-liner `queries.ts` and `admin-queries.ts`)
- Wrap `getMemberById` with React `cache()`
- Replace TOCTOU rate limiter with atomic RPC or Upstash Redis

**Add:**
- Sentry (or equivalent) for production error tracking — especially for webhook handlers
- Coverage thresholds on `lib/stripe/` and `lib/supabase/queries/`

**Remove:**
- `as never` casts (resolved by generated types)
- Redundant barrel files
- Redundant role check in `proxy.ts:55`

### Migration path

1. `supabase gen types typescript --local > src/lib/supabase/database.types.ts`
2. Update `types.ts` to derive domain aliases from generated types
3. Remove `as never` casts — they resolve naturally once types match
4. Wrap `getMemberById` with `cache()`
5. Delete `queries.ts` and `admin-queries.ts` one-liner barrels
6. Fix distributed rate limiter with atomic RPC

---

## D. Front-end Assessment

### Current state

Component hierarchy is well-organized and correctly separated into `ui/`, `brand/`, `content/`, `home/`, `layout/`, `motion/`, `admin/`, `seo/`. Most components are appropriately sized. The admin dashboard is properly decomposed into sub-components. Skeleton variants exist for every content card type.

### Major inconsistencies

**Brand utility class adoption is uneven.** The design system defines semantic classes (`.hover-lift`, `.surface-panel`, `.btn-primary`, `.card-media`) but components mix these with raw Tailwind utility chains. The practical consequence: hover behavior, shadow depth, and transition timing are inconsistent across components that are supposed to feel like the same system.

**Filter/tab components are duplicated.** Four separate filter components — `CategoryFilterTabs`, `LensFilterTabs`, `DownloadCategoryTabs`, `TagFilterRow` — all implement the same core interaction: a horizontal list of options, one selected at a time. No shared primitive underneath them. A single accessibility fix or style change requires updating four components.

**No component-level error boundaries.** Error handling exists at the route level (`error.tsx`) but not at the component level. Admin dashboard sections that fail to load data silently render empty rather than surfacing a bounded error state.

### Top UX and UI weaknesses

1. **Wrong display font** — Every page. Covered in B-FE-1.
2. **Skeleton shimmer is unusable** — Loading states using `shimmer` show pulse. Covered in B-FE-2.
3. **Admin display name is an email prefix** — Covered in B-FE-5.
4. **No empty states on some admin sections** — `AttentionQueueSection` has a zero-items state (good). Not all dashboard sections are consistent.
5. **Filter tabs likely lack ARIA attributes** — `role="tablist"` / `role="tab"` / `aria-selected` are commonly absent in Tailwind-based filter UI. High probability this is the case here.

### Missing capabilities

1. **No toast / notification system.** Admin actions (publish, delete, update) have no feedback mechanism. Success/error states are URL-param-based or silent. A lightweight toast system (`useToast` hook + context, no library) would improve the entire admin experience.
2. **No rich text editor for article body.** If the admin `ArticleForm` uses a textarea for `body`, the editorial experience is poor for long-form content.
3. **No drag-and-drop ordering for briefing sections.** Briefings have `sections: BriefingSection[]`. Reordering them in the admin likely requires manual index editing.
4. **No image preview in `StorageUploadField`.** Upload confirmation is unclear without an inline preview.

### Recommended component improvements

1. Extract a `FilterTabs` primitive that all four filter tab components wrap
2. Implement real shimmer in `Skeleton` or remove the prop
3. Add `role="tablist"` / `role="tab"` / `aria-selected` to filter tab components
4. Add lightweight toast system
5. Add React `ErrorBoundary` wrappers around admin dashboard sections

---

## E. Governance and Enforcement Plan

### What's already working

| Mechanism | Status |
|---|---|
| CLAUDE.md with detailed standards | Active |
| `drift-detection.sh` hook for brand.css vs tailwind.config.ts | Active |
| `tests/brand-compliance.test.ts` | Active — gaps identified below |
| `verify:docs-links`, `verify:docs-frontmatter` scripts | Active |
| CI: lint + build + docs checks | Active |
| `secretlint` | Active |

### Gaps and enforcement actions

| Gap | Current state | Enforcement action |
|---|---|---|
| Hardcoded hex brand colors reach production | Not caught by brand-compliance test | Extend test to grep `src/components/**` for hex literals matching brand token values |
| Generated DB types not in workflow | Hand-rolled types only | Add `supabase gen types` to CI; fail if generated file is stale |
| `as never` type casts accumulate | No ESLint rule | Add `@typescript-eslint/ban-types` or equivalent; flag `as never` |
| No coverage enforcement on critical paths | No thresholds | Add `coverageThreshold` for `lib/stripe`, `lib/supabase/queries`, `app/api` |
| Raw hover transforms bypass semantic utilities | No rule | ESLint custom rule flagging `hover:translate-*` / `hover:scale-*` in JSX |
| Wrong font at root | No test | Add layout parse test asserting `Highrise` appears in layout font loading |
| `PATHS` constants bypassed with string literals | Prose rule only | ESLint `no-restricted-syntax` on `/portal`, `/admin`, `/login`, `/signup` string literals in JSX |
| `includesTier()` bypassed with direct string comparisons | Prose rule only | ESLint `no-restricted-syntax` on `=== 'premium'` / `=== 'basic'` on tier fields |

### Rollout sequence

**Week 1:** Extend brand-compliance test (hex literals + font check). Fix broken redirect. Fix shimmer. Fix hardcoded hex. Add rate limits to upload and donate.

**Week 2:** Generate Supabase types. Remove `as never` casts. Add ESLint rule for `as never`. Wrap `getMemberById` with `cache()`. Collapse barrel exports.

**Week 3:** Add Jest coverage thresholds. Add PATHS ESLint rule. Audit and fix hover utility usage across components.

**Ongoing:** FilterTabs consolidation, error boundaries, toast system.

---

## F. Cleanup and Minimization Plan

Ranked by value-to-effort ratio:

| # | Action | File(s) | Effort |
|---|---|---|---|
| F-1 | Fix broken redirect `/library` → `/records` | `next.config.ts:23` | 2 min |
| F-2 | Fix Skeleton `shimmer` prop (implement or remove) | `Skeleton.tsx` | 1 hr |
| F-3 | Replace `#416100` with `bmj-olive` | `AttentionQueueSection.tsx:38` | 5 min |
| F-4 | Remove redundant role check in `proxy.ts:55` | `src/proxy.ts` | 5 min |
| F-5 | Move newsletter email normalization into Zod transform | `api/newsletter/subscribe/route.ts` | 15 min |
| F-6 | Delete `queries.ts` and `admin-queries.ts` one-liner barrels | `src/lib/supabase/` | 1 hr |
| F-7 | Wrap `getMemberById` with `cache()` | `queries/members.ts` | 15 min |
| F-8 | Consolidate `getArticles` / `getArticlesForListing` | `queries/articles.ts` | 30 min |
| F-9 | Delete or replace `supabase-queries-boundary.test.ts` | `tests/lib/` | 30 min |

---

## G. Modernization Roadmap

### Immediate (this week)

- Fix broken redirect
- Fix font spec discrepancy
- Fix Skeleton shimmer
- Replace hardcoded hex
- Add rate limits to upload and donation endpoints
- Add donation handler branch to webhook

### Short-term (this month)

- Adopt generated Supabase types — highest-leverage code quality improvement; makes schema drift a compile error
- Wrap `getMemberById` with `cache()`
- Collapse barrel chains
- Extend brand-compliance tests (hex literal scanning + font check)
- Add Jest coverage thresholds for stripe and queries modules

### Medium-term (next quarter)

- Atomic rate limiter via Supabase RPC or Upstash Redis
- `FilterTabs` consolidation — single primitive behind all four filter components
- Component-level `ErrorBoundary` wrappers on admin dashboard sections
- Lightweight toast notification system
- Sentry integration for production error tracking (especially webhook failures)

### Optional / longer-term

- Rich text editor for article body in admin CMS
- RLS policy audit against production Supabase schema
- Structured logging (replace `console.error` with a log library that writes to Vercel log drain)
- Progressive search enhancement: preload on focus, debounce, keyboard navigation

---

## H. Actionable Implementation Plan

### Phase 1 — Fix what's broken (1–2 days)

Low-effort, high-impact. No architectural decisions required.

| # | Action | File(s) | Effort |
|---|---|---|---|
| 1.1 | Fix redirect: `/library` → `/records` | `next.config.ts:23` | 2 min |
| 1.2 | Resolve font spec discrepancy (Bebas Neue vs Highrise) | `src/app/layout.tsx`, `public/fonts/` | 30 min |
| 1.3 | Fix Skeleton `shimmer` prop — implement or remove | `src/components/ui/Skeleton.tsx` | 1 hr |
| 1.4 | Replace hardcoded `#416100` with `bmj-olive` | `AttentionQueueSection.tsx:38` | 5 min |
| 1.5 | Add `rateLimit` to admin upload endpoint | `src/app/api/admin/upload/route.ts` | 15 min |
| 1.6 | Add `rateLimit` to donation endpoint | `src/app/api/stripe/donate/route.ts` | 15 min |
| 1.7 | Add donation branch to webhook handler | `src/app/api/stripe/webhook/route.ts` | 20 min |
| 1.8 | Remove redundant role check in proxy | `src/proxy.ts:55` | 5 min |
| 1.9 | Move newsletter email normalization into Zod transform | `api/newsletter/subscribe/route.ts` | 15 min |
| 1.10 | Extend brand-compliance test: hex literals + font check | `tests/brand-compliance.test.ts` | 1 hr |

**Phase 1 gate:** All existing tests pass. No new regressions.

---

### Phase 2 — Establish governance (3–5 days)

| # | Action | File(s) | Effort | Depends on |
|---|---|---|---|---|
| 2.1 | Run `supabase gen types typescript`, adopt output | `src/lib/supabase/database.types.ts`, `types.ts` | 2 hr | — |
| 2.2 | Remove `as never` casts | `src/lib/rate-limit.ts`, elsewhere | 30 min | 2.1 |
| 2.3 | Wrap `getMemberById` with `cache()` | `src/lib/supabase/queries/members.ts` | 15 min | — |
| 2.4 | Delete `queries.ts` and `admin-queries.ts` barrels | `src/lib/supabase/` | 1 hr | — |
| 2.5 | Add Jest coverage thresholds | `jest.config.ts` | 30 min | — |
| 2.6 | Add ESLint rule: flag `as never` | ESLint config | 30 min | 2.2 |
| 2.7 | Add ESLint rule: flag raw `hover:translate-*` in JSX | ESLint config | 1 hr | — |
| 2.8 | Delete or replace boundary test | `tests/lib/supabase-queries-boundary.test.ts` | 30 min | — |
| 2.9 | Fix admin display name | `src/app/(auth)/admin/layout.tsx:12` | 15 min | — |

**Phase 2 gate:** `npm run build && npm test && npm run lint` all pass with new rules in effect.

---

### Phase 3 — Architectural improvements (1–2 weeks)

| # | Action | Depends on |
|---|---|---|
| 3.1 | Atomic rate limiter via Supabase RPC or Upstash Redis | 2.1 |
| 3.2 | Extract shared `FilterTabs` primitive | — |
| 3.3 | Add React `ErrorBoundary` wrappers to admin dashboard sections | — |
| 3.4 | Implement lightweight toast system | — |
| 3.5 | Consolidate `getArticles` / `getArticlesForListing` | 2.4 |
| 3.6 | Audit and fix filter tab ARIA attributes | 3.2 |
| 3.7 | Add Sentry for production error tracking | — |

**Phase 3 gate:** All Phase 2 gates continue to pass. New boundaries documented in CLAUDE.md.

---

### Phase 4 — Optional long-term

- RLS policy audit against production Supabase schema
- Rich text editor for article body in admin CMS
- Structured logging (replace `console.error` with a log library)
- Progressive search enhancement (preload on focus, debounce, keyboard navigation)

---

*Spec written 2026-04-23. Reviewed and approved before implementation plan was created.*
