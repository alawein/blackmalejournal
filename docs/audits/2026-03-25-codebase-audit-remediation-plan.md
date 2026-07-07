# 2026-03-25 Codebase Audit Remediation Plan

> **Status: closed** — all items completed; outcomes folded into BMJ-SSOT.md §12.

This plan operationalizes findings from [2026-03-25-codebase-audit.md](2026-03-25-codebase-audit.md).

## Baseline

- `src/lib/supabase/admin-queries.ts` statement coverage: `19.79%`
- Global coverage:
  - statements: `72.71%`
  - branches: `64.33%`
  - functions: `78.65%`
- E2E coverage: `10` tests across `6` specs
- Route-governance drift:
  - `CLAUDE.md` claims centralized route constants in `src/lib/paths.ts`
  - current implementation primarily uses direct route literals

## Objectives

1. Reduce regression risk in the admin data layer.
2. Deconcentrate complexity in large admin modules.
3. Re-align governance docs with implementation reality.
4. Expand browser-level confidence on critical flows.

## Workstream A — Admin Query Coverage Uplift (Priority: P0)

### Target

- Raise `src/lib/supabase/admin-queries.ts` statement coverage from `19.79%` to `>=60%`.

### Execution

1. Add focused unit tests for highest-risk operations first:
   - article CRUD and status transitions
   - briefing CRUD and section parsing/validation
   - dispatch CRUD and publish scheduling
   - handbook/download CRUD and file path integrity
   - message/subscriber/member admin mutations
2. Use deterministic Supabase mocks (existing helpers in `tests/helpers/`).
3. Keep tests behavior-oriented (inputs/outputs), not implementation-coupled.

### Acceptance Criteria

- `npm test -- --ci --coverage --runInBand` passes.
- `src/lib/supabase/admin-queries.ts` statements `>=60%`.
- No changes to runtime behavior outside tested scope.

## Workstream B — Admin Data-Layer Modularization (Priority: P1)

### Target

- Break `src/lib/supabase/admin-queries.ts` into bounded domain modules.

### Recommended Module Split

- `src/lib/supabase/admin/articles.ts`
- `src/lib/supabase/admin/briefings.ts`
- `src/lib/supabase/admin/dispatches.ts`
- `src/lib/supabase/admin/handbooks.ts`
- `src/lib/supabase/admin/downloads.ts`
- `src/lib/supabase/admin/members.ts`
- `src/lib/supabase/admin/messages.ts`
- `src/lib/supabase/admin/subscribers.ts`
- `src/lib/supabase/admin/index.ts` (stable export surface)

### Acceptance Criteria

- Public export API remains stable (or migration is documented and applied atomically).
- `npm run lint`, `npx tsc --noEmit`, `npm test -- --ci --runInBand` all pass.
- Per-module tests added/updated with no net coverage regression.

## Workstream C — Route-Governance Contract Alignment (Priority: P1)

### Target

- Remove ambiguity between documentation and implementation for route management.

### Decision Gate

Choose one and apply consistently:

1. **Adopt centralized route constants** in `src/lib/paths.ts` and incrementally migrate high-churn surfaces first (admin/auth/nav/sitemap/tests), or
2. **Update governance docs** to reflect helper-based path utilities and permit direct literals where appropriate.

### Acceptance Criteria

- `CLAUDE.md` and code reflect the same contract.
- Route rename checklist remains valid and test-backed.

## Workstream D — E2E Critical Journey Expansion (Priority: P2)

### Target

- Move from smoke-only confidence to workflow confidence.

### Candidate Journeys

1. Admin login gate and redirect handling.
2. Admin create/edit/publish for one representative content type.
3. Stripe checkout initiation and return handling (mockable where required).
4. Portal settings access and billing-management trigger.
5. Contact/newsletter happy-path and validation failure path.

### Acceptance Criteria

- E2E suite includes at least one authenticated admin content mutation flow.
- Flake-free pass in CI for three consecutive runs.

## Sequencing

1. **Phase 1 (immediate):** Workstream A
2. **Phase 2:** Workstream B (after A begins stabilizing)
3. **Phase 3:** Workstream C (choose contract before broad migration)
4. **Phase 4:** Workstream D

## Guardrails

- Keep one logical unit per commit (Invariant I-4).
- Avoid opportunistic side quests (Invariant I-6).
- Preserve lowest necessary authority for env and secret handling (Invariant I-7).
- Re-run full gates before merge:
  - `npm run secrets:check`
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm test -- --ci --coverage --runInBand`
  - `npm run build`
  - `npm run test:e2e`

## Exit Condition

Remediation is complete when P0 and P1 workstreams are accepted, coverage targets are met, route-governance drift is resolved, and all release gates remain green.
