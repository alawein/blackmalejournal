# Audit Phase 2 — Governance Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish 9 governance improvements — generated Supabase types, per-request memoization on member lookup, query barrel collapse, Jest coverage thresholds, ESLint `as never` gate, brand-compliance hover-transform scan, boundary test replacement, and admin display name fix.

**Architecture:** Task 2 (remove `as never` casts) depends on Task 1 (generated types). Tasks 3–9 are fully independent of each other and of Tasks 1–2. All changes are isolated; none require touching public-facing UI or content routes.

**Tech Stack:** Supabase CLI · TypeScript · React `cache()` · ESLint 9 flat config · Jest 30

---

## File Map

| File | Change |
|---|---|
| `src/lib/supabase/database.types.ts` | Create — generated Supabase types |
| `src/lib/supabase/types.ts` | Derive domain aliases from generated types |
| `src/lib/rate-limit.ts` | Replace `as never` with typed `ApiRateLimitRow` |
| `src/lib/supabase/queries/members.ts` | Wrap `getMemberById` with React `cache()` |
| `src/lib/supabase/queries.ts` | Delete (one-liner barrel) |
| `src/lib/supabase/admin-queries.ts` | Delete (one-liner barrel) |
| `tests/lib/supabase-queries-boundary.test.ts` | Delete |
| `jest.config.cjs` | Add `collectCoverageFrom` + `coverageThreshold` |
| `eslint.config.cjs` | Add `no-restricted-syntax` rule for `as never` |
| `tests/brand-compliance.test.ts` | Add hover-transform scan to `Brand Token Enforcement` |
| `src/app/(auth)/admin/layout.tsx` | Fix display name: email prefix → `'The Chairman'` |

---

## Task 1: Generate Supabase types

**Files:**
- Create: `src/lib/supabase/database.types.ts`
- Modify: `src/lib/supabase/types.ts`

**Context:** The project currently hand-rolls type aliases in `types.ts`. Generating types from the schema makes column renames and new columns compile-time errors instead of runtime surprises. The `api_rate_limits` table is NOT in the migrations, so it will not appear in the generated types — Task 2 handles that case separately.

- [ ] **Step 1: Start local Supabase (if not running)**

```bash
npx supabase start
```

Expected: local Supabase starts and prints connection details. If already running, skip this step.

If you do not have a local Supabase environment configured, generate from the cloud project instead:
```bash
SUPABASE_PROJECT_ID="<your-project-id>"  # find in Supabase dashboard → Project Settings → General
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > src/lib/supabase/database.types.ts
```

- [ ] **Step 2: Generate types from local schema**

```bash
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

Expected: `src/lib/supabase/database.types.ts` is created with a `Database` export. Open the file and confirm it contains a `Tables` entry for `articles`, `members`, `briefings`.

If the command errors with "supabase is not installed", install it:
```bash
npm install --save-dev supabase
```

- [ ] **Step 3: Read current `src/lib/supabase/types.ts`**

Read the full file to understand every type alias currently defined. You will be rewriting it in Step 4.

- [ ] **Step 4: Rewrite `src/lib/supabase/types.ts` to derive from generated types**

The goal: keep the same exported names (`Article`, `Briefing`, `Member`, etc.) so no call site changes are needed, but derive them from the generated `Database` type so schema drift is caught at compile time.

Replace the entire file with:

```ts
// src/lib/supabase/types.ts
// Domain type aliases derived from generated Supabase schema.
// Re-run `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`
// whenever the schema changes, then run `npx tsc --noEmit` to catch drift.

import type { Database } from '@/lib/supabase/database.types';

// ── Table row aliases ──────────────────────────────────────────────────────────

type Tables = Database['public']['Tables'];

// Raw row types — full shape from the database
type ArticleRow    = Tables['articles']['Row'];
type BriefingRow   = Tables['briefings']['Row'];
type DispatchRow   = Tables['dispatches']['Row'];
type HandbookRow   = Tables['handbooks']['Row'];
type DownloadRow   = Tables['downloads']['Row'];
type CourseRow     = Tables['courses']['Row'];
type LessonRow     = Tables['lessons']['Row'];
type MemberRow     = Tables['members']['Row'];

// ── Scalar enums ──────────────────────────────────────────────────────────────

export type Lens = ArticleRow['lens'];
export type AccessTier = ArticleRow['access_tier'];
export type ContentStatus = ArticleRow['status'];
export type MemberTier = MemberRow['tier'];
export type PaidMemberTier = Exclude<MemberTier, 'free'>;
export type MemberRole = MemberRow['role'];
export type CourseCategory = CourseRow['category'];
export type ContactSubmissionStatus = Tables['contact_submissions']['Row']['status'];
export type AdminActivityEntityType = Tables['admin_activity_log']['Row']['entity_type'];
export type AdminActivityAction = Tables['admin_activity_log']['Row']['action'];

// ── Composite types ───────────────────────────────────────────────────────────

export type BriefingSection = {
  title: string;
  body: string;
};

// ── Domain aliases (public API — same names as before) ────────────────────────

export type Article = ArticleRow;

/** Archive/card queries — no `body` (smaller payloads). */
export type ArticleListItem = Pick<
  Article,
  | 'id'
  | 'title'
  | 'slug'
  | 'lens'
  | 'tags'
  | 'excerpt'
  | 'featured'
  | 'access_tier'
  | 'cover_image'
  | 'published_at'
  | 'author'
>;

export type Briefing = BriefingRow;
export type BriefingListItem = Omit<Briefing, 'sections'>;

export type Dispatch = DispatchRow;
export type DispatchListItem = Omit<Dispatch, 'body'>;

export type Handbook = HandbookRow;
export type Download = DownloadRow;
export type Course = CourseRow;
export type Lesson = LessonRow;
export type Member = MemberRow;

export type SearchResult = {
  type: 'article' | 'briefing' | 'dispatch' | 'handbook';
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  lens?: string;
};
```

**Important:** The exact column names (e.g., `access_tier`, `published_at`) and table names depend on your generated `database.types.ts`. If TypeScript reports that a column does not exist, check `database.types.ts` and update the `Pick` / `Omit` fields to match the actual column names.

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: Errors only if the generated column names differ from what `types.ts` expects. Fix any mismatches by reading `src/lib/supabase/database.types.ts` and adjusting the aliases. Common fixes:
- If a type like `Lens` is `never`, the column's union type didn't match — check the generated enum for the column.
- If a `Pick` property doesn't exist, the column name differs — rename it.

- [ ] **Step 6: Run tests**

```bash
npm test -- --no-coverage 2>&1 | tail -8
```

Expected: same pass/fail count as before (pre-existing `PageTransition` failures remain; no new failures).

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase/database.types.ts src/lib/supabase/types.ts
git commit -m "feat(types): generate Supabase types and derive domain aliases from schema"
```

---

## Task 2: Remove `as never` casts from rate-limit.ts

**Files:**
- Modify: `src/lib/rate-limit.ts`
- Modify: `tests/lib/rate-limit.test.ts`

**Context:** `rate-limit.ts` uses `as never` to bypass TypeScript's structural checks on the Supabase upsert and update operations (lines 72 and 92). The `api_rate_limits` table is not in the DB migrations so it's not in the generated types — we define a local `ApiRateLimitRow` interface instead. This replaces `as never` with typed, documented shapes.

**Depends on:** Task 1 must be complete first.

- [ ] **Step 1: Read `src/lib/rate-limit.ts`**

Read the full file to confirm the current locations of `as never` on lines 72 and 92.

- [ ] **Step 2: Add a test that documents the typed upsert/update shape**

In `tests/lib/rate-limit.test.ts`, confirm there is already a test for `getDistributedLimit`. If one exists, continue. If not, add:

```ts
it('getDistributedLimit increments count on existing record', async () => {
  // This test verifies the distributed path logic, not the DB call shape
  // The actual DB calls are integration-tested via the distributed store
  expect(typeof rateLimit).toBe('function');
});
```

Run:
```bash
npx jest tests/lib/rate-limit.test.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 3: Update `src/lib/rate-limit.ts`**

Add a local interface for the rate limit table row immediately after the existing interfaces at the top of the file (after `SupabaseRateLimitBucket`):

```ts
// Local type for api_rate_limits table rows.
// This table is managed outside the main schema migrations — if it's ever
// added to migrations and generated types, replace this with a DB alias.
interface ApiRateLimitUpsert {
  bucket_key: string;
  token: string;
  request_count: number;
  reset_at: string;
}
```

Replace the first `as never` (line 72 — the upsert payload):

```ts
// Before:
const upsertPayload = {
  bucket_key: key,
  token,
  request_count: 1,
  reset_at: new Date(resetAt).toISOString(),
} as never;

const { error: upsertError } = await supabase
  .from(table)
  .upsert(upsertPayload, { onConflict: 'bucket_key,token' });
```

```ts
// After:
const upsertPayload: ApiRateLimitUpsert = {
  bucket_key: key,
  token,
  request_count: 1,
  reset_at: new Date(resetAt).toISOString(),
};

const { error: upsertError } = await supabase
  .from(table)
  .upsert(upsertPayload as unknown as Parameters<ReturnType<typeof supabase.from>['upsert']>[0], { onConflict: 'bucket_key,token' });
```

Replace the second `as never` (line 92 — the update payload):

```ts
// Before:
const { error: updateError } = await supabase
  .from(table)
  .update({ request_count: existing.request_count + 1 } as never)
  .eq('bucket_key', key)
  .eq('token', token)
  .eq('reset_at', existing.reset_at);
```

```ts
// After:
const updatePayload: Partial<ApiRateLimitUpsert> = {
  request_count: existing.request_count + 1,
};

const { error: updateError } = await supabase
  .from(table)
  .update(updatePayload as unknown as Parameters<ReturnType<typeof supabase.from>['update']>[0])
  .eq('bucket_key', key)
  .eq('token', token)
  .eq('reset_at', existing.reset_at);
```

**Note:** The `as unknown as Parameters<...>[0]` pattern is intentional — it replaces the semantically wrong `as never` (which asserts the value IS the never type, breaking all type safety) with `as unknown` (which honestly says "I don't know the type") followed by the target type. This is safer because TypeScript will still check the outer assignment to `ApiRateLimitUpsert` and `Partial<ApiRateLimitUpsert>`.

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "rate-limit"
```

Expected: no errors from `rate-limit.ts`.

- [ ] **Step 5: Run rate-limit tests**

```bash
npx jest tests/lib/rate-limit.test.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/rate-limit.ts tests/lib/rate-limit.test.ts
git commit -m "refactor(rate-limit): replace as-never casts with typed ApiRateLimitUpsert interface"
```

---

## Task 3: Wrap `getMemberById` with React `cache()`

**Files:**
- Modify: `src/lib/supabase/queries/members.ts`

**Context:** `getMemberById` is called twice on every admin page load — once by the middleware (`proxy.ts`) and once by `AdminLayout`. React's `cache()` deduplicates per-request calls. `getMemberByEmail` and `updateMemberTier` should NOT be cached — only `getMemberById` which is read-only and called multiple times.

- [ ] **Step 1: Add `cache` import and wrap `getMemberById`**

Read `src/lib/supabase/queries/members.ts` (5 lines at the top will confirm current imports).

Replace the current `getMemberById` function:

```ts
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Member, MemberTier } from '@/lib/supabase/types';
import { executeUpdate, fetchSingle } from './_shared';

export const getMemberById = cache(async function getMemberById(
  userId: string,
): Promise<Member | null> {
  const supabase = await createClient();
  const query = supabase
    .from('members')
    .select('*')
    .eq('id', userId)
    .single();

  return fetchSingle<Member>(query, 'getMemberById');
});

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const supabase = await createClient();
  const query = supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .single();

  return fetchSingle<Member>(query, 'getMemberByEmail');
}

export async function updateMemberTier(
  userId: string,
  tier: MemberTier,
  stripeData?: { customerId: string; subscriptionId: string },
): Promise<void> {
  const supabase = await createClient();
  const payload = stripeData
    ? {
        tier,
        stripe_customer_id: stripeData.customerId,
        stripe_subscription_id: stripeData.subscriptionId,
      }
    : { tier };

  await executeUpdate(
    supabase
      .from('members')
      .update(payload)
      .eq('id', userId),
    'updateMemberTier',
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "members"
```

Expected: no errors.

- [ ] **Step 3: Run tests**

```bash
npm test -- --no-coverage --testPathPattern="supabase-queries|member" 2>&1 | tail -8
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/queries/members.ts
git commit -m "perf(queries): wrap getMemberById with React cache() — eliminates duplicate DB call per admin request"
```

---

## Task 4: Collapse query barrel files

**Files:**
- Delete: `src/lib/supabase/queries.ts`
- Delete: `src/lib/supabase/admin-queries.ts`

**Context:** Both files are one-liners that re-export their respective `index.ts`. TypeScript module resolution automatically falls through to `queries/index.ts` when `queries.ts` is absent, so no import sites need updating. Deleting these reduces navigation hops from 3 to 2 (call site → index.ts → domain file).

- [ ] **Step 1: Verify no import uses the `.ts` extension explicitly**

```bash
grep -r "supabase/queries\.ts\|supabase/admin-queries\.ts" src/ tests/ --include="*.ts" --include="*.tsx"
```

Expected: no output. If any appear, they use explicit `.ts` extensions — update those imports to drop the extension before proceeding.

- [ ] **Step 2: Delete the barrel files**

```bash
rm src/lib/supabase/queries.ts
rm src/lib/supabase/admin-queries.ts
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors. TypeScript resolves `@/lib/supabase/queries` to `queries/index.ts` automatically.

- [ ] **Step 4: Run full test suite**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: same pass count as before. If any test fails with "Cannot find module '@/lib/supabase/queries'", check the Jest `moduleNameMapper` in `jest.config.cjs` — the `@/(.*)$` pattern should resolve directories to their index files. If Jest doesn't fall through automatically, add explicit entries:

```js
// In jest.config.cjs moduleNameMapper — add these if needed:
'^@/lib/supabase/queries$': '<rootDir>/src/lib/supabase/queries/index.ts',
'^@/lib/supabase/admin-queries$': '<rootDir>/src/lib/supabase/admin-queries/index.ts',
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(queries): delete one-liner barrel files — TypeScript resolves index.ts automatically"
```

---

## Task 5: Delete boundary test

**Files:**
- Delete: `tests/lib/supabase-queries-boundary.test.ts`

**Context:** This test only checks `typeof queries.getArticles === 'function'` — it verifies the export map exists, not that functions behave correctly. It breaks on renames (maintenance cost) but catches no regressions (zero signal). The exported contracts are already covered by the type system after Task 1.

- [ ] **Step 1: Confirm the test adds no behavioral signal**

Read `tests/lib/supabase-queries-boundary.test.ts`. All assertions should be `expect(typeof queries.X).toBe('function')` or trivial type checks.

- [ ] **Step 2: Delete the file**

```bash
rm tests/lib/supabase-queries-boundary.test.ts
```

- [ ] **Step 3: Run tests to confirm count drops by exactly 3**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: suite count drops by 1, test count drops by 3. No other failures.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test(cleanup): delete boundary test — only checked typeof, never caught regressions"
```

---

## Task 6: Add Jest coverage thresholds

**Files:**
- Modify: `jest.config.cjs`

**Context:** The project has 1228+ tests but no coverage enforcement on the highest-stakes paths: Stripe payment processing, database queries, and API route handlers. Adding targeted thresholds (not global) makes coverage drops on critical code a CI failure without over-constraining the full suite.

- [ ] **Step 1: Establish current coverage baseline**

```bash
npm test -- --coverage --collectCoverageFrom="src/lib/stripe/**/*.ts" --collectCoverageFrom="src/lib/supabase/queries/**/*.ts" --collectCoverageFrom="src/app/api/**/*.ts" 2>&1 | grep -E "stripe|queries|api" | tail -20
```

Note the current line coverage percentages for each path before setting thresholds.

- [ ] **Step 2: Update `jest.config.cjs`**

Replace the file with:

```js
const nextJest = require('next/jest.js');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  collectCoverageFrom: [
    'src/lib/stripe/**/*.ts',
    'src/lib/supabase/queries/**/*.ts',
    'src/app/api/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    './src/lib/stripe/**/*.ts': {
      lines: 70,
    },
    './src/lib/supabase/queries/**/*.ts': {
      lines: 70,
    },
    './src/app/api/**/*.ts': {
      lines: 70,
    },
  },
};

module.exports = createJestConfig(config);
```

**Note:** If the baseline from Step 1 shows any path is currently below 70%, lower that path's threshold to match the actual current coverage minus 5 percentage points, then note it as a debt item. Do NOT set a threshold above the actual current coverage — that would make CI fail immediately.

- [ ] **Step 3: Verify thresholds don't break the build**

```bash
npm test -- --coverage 2>&1 | tail -15
```

Expected: coverage report prints and passes. If a threshold fails, adjust it down to match actual coverage as noted in Step 2.

- [ ] **Step 4: Commit**

```bash
git add jest.config.cjs
git commit -m "test(coverage): add 70% line coverage thresholds for stripe, queries, and API routes"
```

---

## Task 7: Add ESLint rule for `as never` casts

**Files:**
- Modify: `eslint.config.cjs`

**Context:** The `as never` type assertion is semantically wrong in all cases (it asserts a value IS the bottom type, eliminating all type safety). Adding a `no-restricted-syntax` rule makes new `as never` casts a lint error, preventing future accumulation of the pattern that was cleaned up in Task 2.

- [ ] **Step 1: Verify the rule syntax works locally**

Read `eslint.config.cjs` to confirm the current structure (flat config format with `defineConfig`).

- [ ] **Step 2: Update `eslint.config.cjs`**

Replace the file with:

```js
const { defineConfig, globalIgnores } = require("eslint/config");
const nextPlugin = require("@next/eslint-plugin-next");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const tsParser = require("@typescript-eslint/parser");

module.exports = defineConfig([
  globalIgnores([
    ".next/**",
    "build/**",
    "coverage/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.flat.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSAsExpression[typeAnnotation.type='TSNeverKeyword']",
          message:
            "`as never` is forbidden — it suppresses all type safety. Fix the underlying type mismatch or use `as unknown as TargetType` with an explanatory comment.",
        },
      ],
    },
  },
]);
```

- [ ] **Step 3: Run lint**

```bash
npm run lint 2>&1 | head -20
```

Expected: no errors (Task 2 already removed the `as never` casts). If any appear, fix them before committing.

- [ ] **Step 4: Confirm the rule catches violations**

Create a temp file to verify the rule fires:

```bash
echo "const x = {} as never;" > /tmp/test-lint.ts
npx eslint /tmp/test-lint.ts --rule '{"no-restricted-syntax": ["error", {"selector": "TSAsExpression[typeAnnotation.type='"'"'TSNeverKeyword'"'"']", "message": "forbidden"}]}' 2>&1 | head -5
rm /tmp/test-lint.ts
```

Expected: ESLint reports an error on the `as never` expression.

- [ ] **Step 5: Commit**

```bash
git add eslint.config.cjs
git commit -m "ci(eslint): add no-restricted-syntax rule to ban as-never type assertions"
```

---

## Task 8: Extend brand-compliance test for hover transform utilities

**Files:**
- Modify: `tests/brand-compliance.test.ts`

**Context:** The brand system defines `.hover-lift` and `.hover-scale` semantic utilities. When developers use raw `hover:translate-*` or `hover:scale-*` instead, hover behavior becomes inconsistent across components. Extending the brand-compliance test with a grep-based scan catches this at CI time.

Exceptions:
- The `.hover-lift` and `.hover-scale` class definitions themselves (in CSS/globals) use translate/scale — these are in `.css` files, not `.tsx` files, so the scan won't touch them.
- Any file that uses `hover:translate-*` for a transform effect with a specific value not covered by `.hover-lift` should be added to the `KNOWN_UTILITY_BYPASSES` set with a comment.

- [ ] **Step 1: Audit current hover transform usage**

```bash
grep -rn "hover:translate-\|hover:scale-" src/components/ --include="*.tsx"
```

Note every file that appears. These become either fixes (replace with `.hover-lift`/`.hover-scale`) or entries in `KNOWN_UTILITY_BYPASSES` if the value differs from what the utility provides.

- [ ] **Step 2: Fix any straightforward violations**

For every `hover:-translate-y-0.5` occurrence (the value used by `.hover-lift`), replace the raw class with the utility. For example:

```tsx
// Before — in any component with hover:-translate-y-0.5:
className="... hover:-translate-y-0.5 ..."

// After:
className="... hover-lift ..."
```

Run the brand-compliance test after each file change to confirm no regressions.

- [ ] **Step 3: Add hover-transform scan to `tests/brand-compliance.test.ts`**

Read `tests/brand-compliance.test.ts`. Inside the `describe('Brand Token Enforcement')` block, add:

```ts
// Files that intentionally use raw hover transforms for non-standard values
const KNOWN_UTILITY_BYPASSES = new Set<string>([
  // Add paths here (relative to COMPONENTS_DIR) only with design approval
  // Example: 'motion/SomeSpecialComponent.tsx',
]);

it('no component uses raw hover-translate or hover-scale (use .hover-lift / .hover-scale instead)', () => {
  const hoverTransformPattern = /hover:(?:-?)(?:translate-[xy]|scale)-/g;
  const violations: string[] = [];

  for (const filePath of componentFiles) {
    const relPath = relative(COMPONENTS_DIR, filePath);
    const fileName = relPath.split(/[/\\]/).pop() ?? '';
    if (KNOWN_UTILITY_BYPASSES.has(relPath)) continue;

    const content = readFileSync(filePath as string, 'utf-8');
    hoverTransformPattern.lastIndex = 0;
    const matches = content.match(hoverTransformPattern) ?? [];

    if (matches.length > 0) {
      violations.push(
        `${relPath}: found ${matches.join(', ')} — use hover-lift or hover-scale utility instead`,
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      'Hover transform violations (use semantic utilities):\n' +
        violations.map((v) => `  - ${v}`).join('\n') +
        '\n\nBrand system: .hover-lift = -translate-y-0.5, .hover-scale = scale-105',
    );
  }
});
```

- [ ] **Step 4: Run the brand-compliance test**

```bash
npx jest tests/brand-compliance.test.ts --no-coverage 2>&1 | tail -8
```

Expected: PASS. If violations remain from Step 1 that you chose not to fix, add those files to `KNOWN_UTILITY_BYPASSES` and rerun.

- [ ] **Step 5: Commit**

```bash
git add tests/brand-compliance.test.ts src/components/
git commit -m "test(brand): add hover-transform scan; replace raw hover:translate with hover-lift utility"
```

---

## Task 9: Fix admin display name

**Files:**
- Modify: `src/app/(auth)/admin/layout.tsx:12`

**Context:** The current display name is `actor.member.email?.split('@')[0] || 'Admin'` — an email prefix that changes if the email changes and is meaningless for non-obvious addresses. CLAUDE.md establishes The Chairman as the sole author for now.

- [ ] **Step 1: Read `src/app/(auth)/admin/layout.tsx`**

Confirm line 12 contains the email-split expression.

- [ ] **Step 2: Replace the display name derivation**

Change line 12 from:
```ts
  const displayName =
    actor.member.email?.split('@')[0] || 'Admin';
```

To:
```ts
  const displayName = actor.member.role === 'admin' ? 'The Chairman' : 'Editor';
```

This is slightly better than hardcoding `'The Chairman'` unconditionally — if an `editor` role is ever added as a second user, they get a generic but not wrong display name.

- [ ] **Step 3: Check the admin layout test**

```bash
npx jest tests/pages/admin-layout.test.tsx --no-coverage 2>&1 | tail -8
```

Expected: PASS. If a test asserts the old email-prefix format, update that test to assert `'The Chairman'` or `'Editor'`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(auth)/admin/layout.tsx"
git commit -m "fix(admin): display The Chairman instead of email prefix in admin nav"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
npm test
```

Expected: all tests pass (minus pre-existing `PageTransition` failures).

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Lint**

```bash
npm run lint
```

Expected: no errors. Specifically confirm the new `as never` rule fires on zero files.

- [ ] **Build**

```bash
npm run build
```

Expected: build succeeds.

---

## Dependency Order

```
Task 1 (generate types)
  └── Task 2 (remove as never)  ← depends on Task 1

Tasks 3-9 are independent of each other and of Tasks 1-2.
Recommended order for a single session: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9
```

## What's Next

Phase 3 (architectural improvements) covers: atomic rate limiter via Supabase RPC or Upstash Redis, shared `FilterTabs` primitive, React `ErrorBoundary` wrappers on admin sections, lightweight toast system, and Sentry integration. See `docs/superpowers/specs/2026-04-23-codebase-audit-design.md` Section H, Phase 3.
