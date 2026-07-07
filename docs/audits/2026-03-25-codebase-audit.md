# 2026-03-25 Codebase Audit

> **Status: closed** — remediation completed; see [2026-03-25-codebase-audit-remediation-plan.md](2026-03-25-codebase-audit-remediation-plan.md) and BMJ-SSOT.md §12.

This audit reviews the current BMJ repository state on `2026-03-25` with emphasis on governance alignment, quality gates, test depth, and structural risk.

## Scope

- Repository: `blackmalejournal` (Next.js 16, Supabase, Stripe)
- Audit focus:
  - Build/test/release readiness signals
  - Governance and brand invariant adherence
  - Structural complexity and maintainability risk
  - Test coverage concentration and blind spots
- Excluded:
  - Production dashboard validation (Vercel/Supabase/Stripe dashboards)
  - Runtime traffic/performance telemetry

## Evidence Snapshot

### Repository Shape

- Tracked/working file snapshot (excluding `node_modules`, `.next`, coverage outputs): `494` files
- Domain file counts:
  - `src`: `203`
  - `tests`: `129`
  - `docs`: `44`
  - `supabase`: `24`
  - `public`: `34`
  - `scripts`: `2`
- Extension distribution (top):
  - `.tsx` `222`
  - `.ts` `112`
  - `.md` `82`
  - `.svg` `17`
  - `.sql` `14`

### Verification Gates (all passed)

- `npm run secrets:check`
- `npm run lint`
- `npx tsc --noEmit`
- `npm test -- --ci --runInBand`
  - `117` suites passed
  - `861` tests passed
- `npm test -- --ci --coverage --runInBand`
  - aggregate coverage:
    - statements: `72.71%`
    - branches: `64.33%`
    - functions: `78.65%`
- `npm run build`
  - production build passed
  - route inventory generated (`52` app routes)
- `npm run test:e2e`
  - `10/10` tests passed across `6` E2E spec files

### Governance/Invariant Signals

- Brand token drift check between `src/styles/brand.css` and `tailwind.config.ts`:
  - BMJ color tokens in `brand.css`: `14`
  - BMJ colors in Tailwind config: `14`
  - missing/extra/mismatched tokens: none detected
- Prohibited styling pattern scan:
  - `shadow-*` utility usage in `src/`: `0`
  - `backdrop-blur-*` usage: `1` (navbar scroll state)
  - Tailwind gradient utilities: none detected
- Secret exposure scan:
  - suspicious `NEXT_PUBLIC_` secret-like names: none detected
- Code hygiene scan:
  - `TODO|FIXME|HACK|XXX` markers in `src`, `tests`, `docs`: none detected
  - `@ts-ignore|@ts-expect-error` markers in `src`, `tests`: none detected

## Findings

### High

1. **Critical admin data layer has low coverage for its size**
   - File: `src/lib/supabase/admin-queries.ts`
   - Size: `1751` LOC (largest TS/TSX file in repo)
   - Statement coverage: `19.79%`
   - Risk: high regression potential in admin CRUD, filters, metrics, and activity logging paths despite green suite totals.

### Medium

1. **Complexity concentration in admin surface**
   - Large files cluster around admin dashboards/actions:
     - `src/app/(auth)/admin/page.tsx` (`580` LOC)
     - `src/app/(auth)/admin/*/actions.ts` files (`281-320` LOC range)
     - `src/app/(auth)/admin/*/page.tsx` files (`273-314` LOC range)
   - Risk: entropy increase and difficult reviewability (Invariant I-5).

2. **Route-constant governance drift**
   - `CLAUDE.md` states `src/lib/paths.ts` is centralized route constants.
   - Current `src/lib/paths.ts` only contains path/query helper functions (no route map/constants).
   - Repository scan shows heavy direct route literals (`/admin` occurrences: `571` in `src` + `tests`, excluding `src/lib/paths.ts`).
   - Risk: route renames become broad string-edit operations; documentation and implementation are out of sync.

3. **E2E breadth is still smoke-level versus route surface**
   - App routes from production build: `52`
   - API route handlers: `11`
   - E2E coverage: `6` specs / `10` tests
   - Risk: critical workflows can regress without browser-level detection (especially admin publishing and billing flows).

### Process Risk (Contextual)

1. **Large active dirty worktree during audit**
   - `git status` snapshot: `77` changed paths (`54` modified, `23` untracked)
   - Includes broad admin and Supabase migration work-in-progress.
   - Risk: scope binding and release traceability pressure (Invariants I-3, I-4, I-6) if shipped as a single unit.

## Strengths

- Full local quality pipeline currently green (lint, typecheck, unit/integration, build, E2E, secret scan).
- No lint-suppression markers (`@ts-ignore` / `@ts-expect-error`) found in app/test code.
- Brand color SSOT parity is intact between runtime CSS tokens and Tailwind mirror.
- No obvious `NEXT_PUBLIC_` secret misuse pattern detected.

## Recommendations

1. **Increase coverage where risk is concentrated**
   - Prioritize targeted tests for `src/lib/supabase/admin-queries.ts` and `src/lib/admin-bulk-actions.ts`.
   - Goal: raise `admin-queries.ts` statement coverage from `19.79%` to at least `60%` in staged increments.

2. **Refactor by bounded modules**
   - Split `admin-queries.ts` by domain (`articles`, `briefings`, `dispatches`, `handbooks`, `downloads`, `members`, `messages`, `subscribers`) to lower blast radius.
   - Keep each module with colocated tests to preserve scope binding.

3. **Reconcile route-governance contract**
   - Either:
     - implement an actual route-constant map in `src/lib/paths.ts`, or
     - update `CLAUDE.md` so governance text matches current helper-based approach.
   - Avoid leaving the current mismatch unresolved.

4. **Expand E2E from smoke to critical journeys**
   - Add authenticated admin flows: create/edit/publish for each content type.
   - Add subscription/billing portal journey coverage around Stripe actions.

5. **Reduce release batch size**
   - Break current in-flight work into smaller conventional commits aligned to one logical unit each.

## Closing Assessment

The codebase is operationally healthy today (all gates green), but risk is concentrated in an under-tested, high-complexity admin data layer and in governance drift around route-path centralization. Immediate priority should be focused coverage and modularization of admin query logic before further surface expansion.
