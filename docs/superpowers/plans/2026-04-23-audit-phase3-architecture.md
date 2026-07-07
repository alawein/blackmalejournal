# Audit Phase 3 — Architectural Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Six architectural improvements — atomic rate limiting, a shared FilterTabs primitive, admin dashboard error boundaries, a toast notification system, article query consolidation, and Sentry error tracking.

**Architecture:** All tasks are independent and can be executed in any order and in separate sessions. Task 5 (query consolidation) depends on Phase 1 and Phase 2 being merged to `main` first — skip it until those PRs land. Each task produces working, testable software on its own.

**Tech Stack:** Next.js 16 App Router · Supabase (RPC) · React `ErrorBoundary` · `@sentry/nextjs`

---

## File Map

| File | Change |
|---|---|
| `supabase/migrations/<ts>_create_atomic_rate_limit.sql` | Create — table + RPC migration |
| `src/lib/rate-limit.ts` | Replace TOCTOU Supabase path with atomic RPC call |
| `src/components/content/FilterTabs.tsx` | Create — shared tab primitive |
| `src/components/content/CategoryFilterTabs.tsx` | Thin wrapper over FilterTabs |
| `src/components/content/LensFilterTabs.tsx` | Thin wrapper over FilterTabs + aria-label fix |
| `src/components/content/DownloadCategoryTabs.tsx` | Thin wrapper over FilterTabs |
| `src/components/admin/dashboard/DashboardSection.tsx` | Create — client ErrorBoundary for dashboard sections |
| `src/app/(auth)/admin/page.tsx` | Wrap each section in DashboardSection |
| `src/lib/toast.tsx` | Create — ToastProvider + useToast hook |
| `src/app/(auth)/admin/layout.tsx` | Wrap with ToastProvider |
| `src/lib/supabase/queries/articles.ts` | Consolidate getArticles/getArticlesForListing (post Phase 1+2 merge) |
| `sentry.client.config.ts` | Create — Sentry browser config |
| `sentry.server.config.ts` | Create — Sentry server config |
| `next.config.ts` | Wrap with withSentryConfig |

---

## Task 1: Atomic rate limiter via Supabase RPC

**Files:**
- Create: `supabase/migrations/<timestamp>_create_atomic_rate_limit.sql`
- Modify: `src/lib/rate-limit.ts`
- Test: `tests/lib/rate-limit.test.ts`

**Context:** The current distributed rate limiter performs a read-then-write, creating a TOCTOU race. Two concurrent requests at count=4 (limit=5) can both pass the check and both increment — resulting in count=6. The fix: a single Supabase RPC that does an atomic `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` so the compare-and-increment is one database operation.

- [ ] **Step 1: Create the migration file**

Generate a timestamp: `date +%Y%m%d%H%M%S` (or use `20260423000000` if running manually).

Create `supabase/migrations/20260423000000_create_atomic_rate_limit.sql`:

```sql
-- Creates the api_rate_limits table and an atomic increment RPC.
-- The RPC replaces the TOCTOU read-check-write pattern in rate-limit.ts.

CREATE TABLE IF NOT EXISTS api_rate_limits (
  bucket_key TEXT NOT NULL,
  token      TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  reset_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_key, token)
);

-- Clean up expired buckets automatically (Postgres cron or manual)
CREATE INDEX IF NOT EXISTS api_rate_limits_reset_at_idx ON api_rate_limits (reset_at);

-- Atomic compare-and-increment.
-- Returns: (allowed BOOLEAN, remaining INTEGER)
-- If the bucket is expired (reset_at <= now), it resets to count=1.
-- If count < p_limit, increments and returns allowed=true.
-- If count >= p_limit, does NOT increment and returns allowed=false.
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_bucket_key TEXT,
  p_token      TEXT,
  p_limit      INTEGER,
  p_reset_at   TIMESTAMPTZ
) RETURNS TABLE (allowed BOOLEAN, request_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO api_rate_limits (bucket_key, token, request_count, reset_at)
  VALUES (p_bucket_key, p_token, 1, p_reset_at)
  ON CONFLICT (bucket_key, token) DO UPDATE
    SET
      request_count = CASE
        WHEN api_rate_limits.reset_at <= NOW() THEN 1
        WHEN api_rate_limits.request_count >= p_limit THEN api_rate_limits.request_count
        ELSE api_rate_limits.request_count + 1
      END,
      reset_at = CASE
        WHEN api_rate_limits.reset_at <= NOW() THEN p_reset_at
        ELSE api_rate_limits.reset_at
      END
  RETURNING api_rate_limits.request_count INTO v_count;

  RETURN QUERY SELECT v_count <= p_limit, v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_rate_limit TO anon, authenticated, service_role;
```

- [ ] **Step 2: Apply the migration locally**

```bash
npx supabase db push
```

Or, if using local Docker:
```bash
npx supabase migration up
```

Expected: migration applied, table `api_rate_limits` and function `increment_rate_limit` exist.

- [ ] **Step 3: Write a failing test for the atomic distributed path**

In `tests/lib/rate-limit.test.ts`, add:

```ts
describe('rateLimit — distributed path (mocked RPC)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  it('returns allowed=true when RPC reports count under limit', async () => {
    jest.mock('@/lib/supabase/admin', () => ({
      createAdminClient: () => ({
        rpc: jest.fn().mockResolvedValue({
          data: [{ allowed: true, request_count: 3 }],
          error: null,
        }),
      }),
    }));
    const { rateLimit } = await import('@/lib/rate-limit');
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
    const result = await limiter.check(5, 'test-token');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('returns allowed=false when RPC reports count at limit', async () => {
    jest.mock('@/lib/supabase/admin', () => ({
      createAdminClient: () => ({
        rpc: jest.fn().mockResolvedValue({
          data: [{ allowed: false, request_count: 5 }],
          error: null,
        }),
      }),
    }));
    const { rateLimit } = await import('@/lib/rate-limit');
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
    const result = await limiter.check(5, 'test-token');
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
```

Run:
```bash
npx jest tests/lib/rate-limit.test.ts --no-coverage
```

Expected: the new tests FAIL (the current distributed path uses the TOCTOU approach, not RPC).

- [ ] **Step 4: Replace the distributed rate limit implementation in `src/lib/rate-limit.ts`**

Read the full current file first. Then replace the `getDistributedLimit` function:

```ts
async function getDistributedLimit(
  token: string,
  interval: number,
  limit: number,
): Promise<RateLimitResult | null> {
  const now = Date.now();
  const windowStart = nextWindowStart(now, interval);
  const resetAt = windowStart + interval;
  const key = `${windowStart}:${token}`;

  const supabase = createAdminClient();
  const table = process.env.API_RATE_LIMITS_TABLE ?? defaultOptions.table;

  try {
    const { data, error } = await supabase
      .rpc('increment_rate_limit', {
        p_bucket_key: key,
        p_token: token,
        p_limit: limit,
        p_reset_at: new Date(resetAt).toISOString(),
      });

    if (error) throw error;

    const row = data?.[0] as { allowed: boolean; request_count: number } | undefined;
    if (!row) throw new Error('increment_rate_limit returned no rows');

    return {
      success: row.allowed,
      remaining: row.allowed ? Math.max(0, limit - row.request_count) : 0,
    };
  } catch (error) {
    console.error('[rateLimit] distributed check failed, falling back to in-memory', error);
    return null;
  }
}
```

Also remove the now-unused `ApiRateLimitUpsert` interface and the `SupabaseRateLimitBucket` interface (the raw bucket type is no longer needed since the RPC handles the DB logic). Keep `MemoryRateLimitBucket` — in-memory is still the fallback.

- [ ] **Step 5: Run the updated tests**

```bash
npx jest tests/lib/rate-limit.test.ts --no-coverage
```

Expected: PASS — the new RPC-based tests pass, and existing in-memory tests still pass.

- [ ] **Step 6: Verify existing API routes still pass**

```bash
npx jest tests/api/ --no-coverage 2>&1 | tail -8
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/ src/lib/rate-limit.ts tests/lib/rate-limit.test.ts
git commit -m "feat(rate-limit): replace TOCTOU Supabase path with atomic increment_rate_limit RPC"
```

---

## Task 2: FilterTabs shared primitive + ARIA fix

**Files:**
- Create: `src/components/content/FilterTabs.tsx`
- Modify: `src/components/content/CategoryFilterTabs.tsx`
- Modify: `src/components/content/LensFilterTabs.tsx`
- Modify: `src/components/content/DownloadCategoryTabs.tsx`
- Test: `tests/components/FilterTabs.test.tsx` (new)

**Context:** Three filter tab components — `CategoryFilterTabs`, `LensFilterTabs`, `DownloadCategoryTabs` — share identical rendering logic, URL param management, and tab interaction. Extracting a `FilterTabs<T>` primitive reduces the pattern to one place. `LensFilterTabs` currently lacks an `aria-label` on its container, making it screen-reader-anonymous — the extraction also fixes this. `TagFilterRow` is a chip-toggle (different interaction model) and is NOT included in this extraction.

- [ ] **Step 1: Write a failing test for the FilterTabs primitive**

Create `tests/components/FilterTabs.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { FilterTabs } from '@/components/content/FilterTabs';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/articles',
  useSearchParams: () => new URLSearchParams(),
}));

const tabs = [
  { label: 'All', value: 'all' as const },
  { label: 'Health', value: 'health' as const },
  { label: 'Politics', value: 'politics' as const },
];

describe('FilterTabs', () => {
  it('renders a tablist with the correct aria-label', () => {
    render(
      <FilterTabs
        tabs={tabs}
        activeValue="all"
        paramKey="lens"
        allValue="all"
        ariaLabel="Filter by lens"
      />
    );
    expect(screen.getByRole('tablist', { name: 'Filter by lens' })).toBeInTheDocument();
  });

  it('marks the active tab with aria-selected=true', () => {
    render(
      <FilterTabs
        tabs={tabs}
        activeValue="health"
        paramKey="lens"
        allValue="all"
        ariaLabel="Filter by lens"
      />
    );
    expect(screen.getByRole('tab', { name: 'Health' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false');
  });

  it('renders all tab options', () => {
    render(
      <FilterTabs
        tabs={tabs}
        activeValue="all"
        paramKey="lens"
        allValue="all"
        ariaLabel="Filter by lens"
      />
    );
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
});
```

Run:
```bash
npx jest tests/components/FilterTabs.test.tsx --no-coverage
```

Expected: FAIL — `FilterTabs` does not exist yet.

- [ ] **Step 2: Create `src/components/content/FilterTabs.tsx`**

```tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FILTER_TABLIST_ROW_CLASS } from '@/lib/constants';

interface FilterTabsProps<T extends string> {
  tabs: ReadonlyArray<{ label: string; value: T }>;
  activeValue: T;
  paramKey: string;
  allValue: T;
  ariaLabel: string;
  /** Extra URL params to delete on any tab change (e.g. reset 'tag' when lens changes). */
  resetParams?: string[];
  className?: string;
}

export function FilterTabs<T extends string>({
  tabs,
  activeValue,
  paramKey,
  allValue,
  ariaLabel,
  resetParams,
  className,
}: FilterTabsProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(value: T) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === allValue) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }
    resetParams?.forEach((p) => params.delete(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className={className ?? FILTER_TABLIST_ROW_CLASS}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeValue;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(tab.value)}
            className={[
              'filter-tab whitespace-nowrap',
              isActive ? 'border-b-2 border-bmj-red text-bmj-white' : 'filter-tab-inactive',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Run the test to confirm it passes**

```bash
npx jest tests/components/FilterTabs.test.tsx --no-coverage
```

Expected: PASS.

- [ ] **Step 4: Rewrite `CategoryFilterTabs.tsx` as a thin wrapper**

Replace the entire file:

```tsx
'use client';

import type { CourseCategory } from '@/lib/supabase/types';
import { getCategoryLabel } from '@/lib/utils';
import { FilterTabs } from './FilterTabs';

type Tab = { label: string; value: CourseCategory | 'all' };

const TABS: ReadonlyArray<Tab> = [
  { label: 'All', value: 'all' },
  { label: getCategoryLabel('martial-arts'), value: 'martial-arts' },
  { label: getCategoryLabel('mental-health'), value: 'mental-health' },
  { label: getCategoryLabel('relationships'), value: 'relationships' },
  { label: getCategoryLabel('purpose'), value: 'purpose' },
  { label: getCategoryLabel('branding'), value: 'branding' },
];

interface CategoryFilterTabsProps {
  activeCategory: CourseCategory | 'all';
}

export function CategoryFilterTabs({ activeCategory }: CategoryFilterTabsProps) {
  return (
    <FilterTabs
      tabs={TABS}
      activeValue={activeCategory}
      paramKey="category"
      allValue="all"
      ariaLabel="Filter courses by category"
    />
  );
}
```

- [ ] **Step 5: Rewrite `LensFilterTabs.tsx` as a thin wrapper**

Replace the entire file:

```tsx
'use client';

import type { Lens } from '@/lib/supabase/types';
import { FilterTabs } from './FilterTabs';

type Tab = { label: string; value: Lens | 'all' };

const TABS: ReadonlyArray<Tab> = [
  { label: 'All',                        value: 'all' },
  { label: 'Health/Wellness',            value: 'health' },
  { label: 'Politics/Law',               value: 'politics' },
  { label: 'Culture/Ideology',           value: 'culture' },
  { label: 'Entertainment/Technology',   value: 'entertainment' },
  { label: 'Business/Finance',           value: 'business' },
];

interface LensFilterTabsProps {
  activeLens: Lens | 'all';
}

export function LensFilterTabs({ activeLens }: LensFilterTabsProps) {
  return (
    <FilterTabs
      tabs={TABS}
      activeValue={activeLens}
      paramKey="lens"
      allValue="all"
      ariaLabel="Filter articles by lens"
      resetParams={['tag']}
    />
  );
}
```

Note: `resetParams={['tag']}` replaces the old `params.delete('tag')` logic. The ARIA gap (`aria-label` was missing) is also fixed here.

- [ ] **Step 6: Rewrite `DownloadCategoryTabs.tsx` as a thin wrapper**

Replace the entire file:

```tsx
'use client';

import { FilterTabs } from './FilterTabs';

type DownloadCat = 'template' | 'worksheet' | 'guide' | 'toolkit' | 'handbook' | 'all';

type Tab = { label: string; value: DownloadCat };

const TABS: ReadonlyArray<Tab> = [
  { label: 'All',       value: 'all' },
  { label: 'Templates', value: 'template' },
  { label: 'Worksheets', value: 'worksheet' },
  { label: 'Guides',    value: 'guide' },
  { label: 'Toolkits',  value: 'toolkit' },
  { label: 'Handbooks', value: 'handbook' },
];

interface DownloadCategoryTabsProps {
  activeCategory: string;
}

export function DownloadCategoryTabs({ activeCategory }: DownloadCategoryTabsProps) {
  return (
    <FilterTabs
      tabs={TABS}
      activeValue={(activeCategory as DownloadCat) || 'all'}
      paramKey="category"
      allValue="all"
      ariaLabel="Filter downloads by category"
    />
  );
}
```

- [ ] **Step 7: Run the existing filter tab tests**

```bash
npx jest --no-coverage --testPathPattern="FilterTabs|CategoryFilter|LensFilter|DownloadCategory" 2>&1 | tail -8
```

Expected: PASS — existing tests still pass and the new FilterTabs tests pass.

- [ ] **Step 8: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E "FilterTabs|CategoryFilter|LensFilter|DownloadCategory" | head -10
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/content/FilterTabs.tsx src/components/content/CategoryFilterTabs.tsx src/components/content/LensFilterTabs.tsx src/components/content/DownloadCategoryTabs.tsx tests/components/FilterTabs.test.tsx
git commit -m "feat(ui): extract shared FilterTabs primitive — fixes LensFilterTabs missing aria-label"
```

---

## Task 3: Admin dashboard ErrorBoundary

**Files:**
- Create: `src/components/admin/dashboard/DashboardSection.tsx`
- Modify: `src/app/(auth)/admin/page.tsx`
- Test: `tests/components/admin-dashboard.test.tsx` (new)

**Context:** The admin dashboard page fetches all data in a single `getAdminCommandCenterSnapshot()` call and passes it to multiple section components. If any section component throws during render (type mismatch, null ref, etc.), the entire dashboard crashes. A `DashboardSection` ErrorBoundary wraps each section so failures are isolated.

The `getAdminCommandCenterSnapshot()` server-side data fetch is also wrapped in a try/catch — if it fails entirely, the page renders a graceful fallback instead of crashing.

- [ ] **Step 1: Write a failing test**

Create `tests/components/admin-dashboard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { DashboardSection } from '@/components/admin/dashboard/DashboardSection';

const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Section render failed');
  return <div>Section content</div>;
};

// Suppress console.error for expected throws in tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('DashboardSection', () => {
  it('renders children when no error', () => {
    render(
      <DashboardSection title="Test Section">
        <ThrowingComponent shouldThrow={false} />
      </DashboardSection>
    );
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('renders error fallback when child throws', () => {
    render(
      <DashboardSection title="Key Metrics">
        <ThrowingComponent shouldThrow={true} />
      </DashboardSection>
    );
    expect(screen.getByText(/Key Metrics/)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    expect(screen.getByText(/Section render failed/)).toBeInTheDocument();
  });
});
```

Run:
```bash
npx jest tests/components/admin-dashboard.test.tsx --no-coverage
```

Expected: FAIL — `DashboardSection` does not exist yet.

- [ ] **Step 2: Create `src/components/admin/dashboard/DashboardSection.tsx`**

```tsx
'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class DashboardSection extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[DashboardSection:${this.props.title}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="surface-panel border-bmj-red/20 p-6">
          <p className="font-label text-xs uppercase tracking-widest text-bmj-red">
            {this.props.title} — Failed to load
          </p>
          <p className="mt-2 font-body text-sm text-bmj-cream/60">
            {this.state.errorMessage ?? 'An unexpected error occurred.'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 3: Run test to confirm it passes**

```bash
npx jest tests/components/admin-dashboard.test.tsx --no-coverage
```

Expected: PASS.

- [ ] **Step 4: Export `DashboardSection` from the dashboard index**

Read `src/components/admin/dashboard/index.ts`. Add `DashboardSection` to the exports:

```ts
export { DashboardSection } from './DashboardSection';
```

- [ ] **Step 5: Update `src/app/(auth)/admin/page.tsx`**

Read the current file. Make two changes:

**Change 1:** Wrap `getAdminCommandCenterSnapshot()` in a try/catch at the top of the component:

```ts
export default async function AdminDashboardPage() {
  let snapshot;
  try {
    snapshot = await getAdminCommandCenterSnapshot();
  } catch (err) {
    console.error('[AdminDashboard] snapshot failed', err);
    return (
      <div className="surface-panel p-8">
        <p className="font-display text-xl uppercase tracking-widest text-bmj-red">
          DASHBOARD UNAVAILABLE
        </p>
        <p className="mt-3 font-body text-sm text-bmj-cream/60">
          Failed to load dashboard data. Check the server logs and try refreshing.
        </p>
      </div>
    );
  }
  const { counts, pipeline, activity, members, messages, subscribers } = snapshot;
  // ... rest unchanged
```

**Change 2:** Wrap the major rendered sections in `<DashboardSection>`. Import `DashboardSection` from the dashboard index. Add imports and wrap the 5 grid areas:

```tsx
import {
  KeyMetricsGrid,
  AttentionQueueSection,
  PublishingQueueSection,
  EditorialPipelineSection,
  AudienceBillingSection,
  RecentActivitySection,
  TopSourcesSection,
  AdminCoverageSection,
  QuickActionsSection,
  DashboardSection,
  type AttentionItem,
} from '@/components/admin/dashboard';
```

Then wrap each `<ScrollReveal>` section with `<DashboardSection title="...">`. For example:

```tsx
<ScrollReveal as="div" delay={0.05}>
  <DashboardSection title="Key Metrics">
    <KeyMetricsGrid
      messages={messages}
      pipeline={pipeline}
      members={members}
      subscribers={subscribers}
    />
  </DashboardSection>
</ScrollReveal>
```

Apply the same `<DashboardSection title="...">` wrapper to:
- `AttentionQueueSection` + `PublishingQueueSection` grid → title `"Attention Queue"`
- `EditorialPipelineSection` grid → title `"Editorial Pipeline"`
- `AudienceBillingSection` → title `"Audience & Billing"`
- `RecentActivitySection` → title `"Recent Activity"`
- `TopSourcesSection` → title `"Top Sources"`
- `AdminCoverageSection` → title `"Coverage"`
- `QuickActionsSection` → title `"Quick Actions"`

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "admin/page\|DashboardSection" | head -5
```

Expected: no errors.

- [ ] **Step 7: Run admin page tests**

```bash
npx jest --no-coverage --testPathPattern="admin-dashboard|DashboardSection" 2>&1 | tail -6
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/dashboard/DashboardSection.tsx src/components/admin/dashboard/index.ts "src/app/(auth)/admin/page.tsx" tests/components/admin-dashboard.test.tsx
git commit -m "feat(admin): add DashboardSection ErrorBoundary — isolates section failures from full dashboard crash"
```

---

## Task 4: Toast notification system

**Files:**
- Create: `src/lib/toast.tsx`
- Modify: `src/app/(auth)/admin/layout.tsx`
- Test: `tests/lib/toast.test.tsx` (new)

**Context:** Admin actions (publish, delete, update) currently have no user feedback — success and error states are either URL-param-based or silent. A lightweight toast system using React context provides non-blocking notifications. No library needed — the implementation is ~60 lines.

- [ ] **Step 1: Write a failing test**

Create `tests/lib/toast.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '@/lib/toast';

function TestComponent() {
  const { toast } = useToast();
  return (
    <>
      <button onClick={() => toast('Saved successfully', 'success')}>
        Show success
      </button>
      <button onClick={() => toast('Something went wrong', 'error')}>
        Show error
      </button>
    </>
  );
}

describe('toast', () => {
  it('shows a toast message when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    await userEvent.click(screen.getByText('Show success'));
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('shows an error toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    await userEvent.click(screen.getByText('Show error'));
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders the live region for screen readers', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    expect(screen.getByRole('log')).toBeInTheDocument();
  });
});
```

Run:
```bash
npx jest tests/lib/toast.test.tsx --no-coverage
```

Expected: FAIL — `@/lib/toast` does not exist yet.

- [ ] **Step 2: Create `src/lib/toast.tsx`**

```tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        role="log"
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'max-w-sm border px-4 py-3 font-body text-sm',
              t.type === 'success' && 'border-bmj-olive/40 bg-bmj-brown text-bmj-cream',
              t.type === 'error' && 'border-bmj-red/40 bg-bmj-brown text-bmj-cream',
              t.type === 'info' && 'border-bmj-tan/30 bg-bmj-brown text-bmj-cream',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 3: Run tests to confirm they pass**

```bash
npx jest tests/lib/toast.test.tsx --no-coverage
```

Expected: PASS.

- [ ] **Step 4: Add `ToastProvider` to the admin layout**

Read `src/app/(auth)/admin/layout.tsx`. Import `ToastProvider` and wrap the layout:

```tsx
import { AdminNav } from './AdminNav';
import { requireAdminActor } from '@/lib/admin-auth';
import { ToastProvider } from '@/lib/toast';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await requireAdminActor(['admin', 'editor']);
  const displayName = actor.member.role === 'admin' ? 'The Chairman' : 'Editor';

  return (
    <ToastProvider>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AdminNav displayName={displayName} role={actor.member.role} />
        <div className="flex-1 bg-bmj-brown/30 p-8">{children}</div>
      </div>
    </ToastProvider>
  );
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "toast\|admin/layout" | head -5
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/toast.tsx "src/app/(auth)/admin/layout.tsx" tests/lib/toast.test.tsx
git commit -m "feat(admin): add lightweight toast notification system — useToast hook available in all admin components"
```

---

## Task 5: Consolidate article query functions

**⚠️ Prerequisite: Execute this task ONLY after Phase 1 PR (#40) and Phase 2 PR (#41) are merged to `main`.** Phase 1 splits `queries.ts` into `src/lib/supabase/queries/articles.ts` which is the file this task modifies.

**Files:**
- Modify: `src/lib/supabase/queries/articles.ts`
- Modify: call sites that use `getArticles` or `getArticlesForListing`
- Test: `tests/lib/supabase-queries.test.ts`

**Context:** `getArticles` and `getArticlesForListing` in `queries/articles.ts` are nearly identical — both take the same options object, apply the same filters, differ only in whether they `select('*')` or `select(ARTICLE_LIST_SELECT)`. Consolidating them reduces surface area and prevents the two implementations from diverging.

The `getLatestArticles` and `getFeaturedArticles` functions call `select(ARTICLE_LIST_SELECT)` directly — these stay as-is since they have different filter logic.

- [ ] **Step 1: Read `src/lib/supabase/queries/articles.ts`**

Confirm the current state of `getArticles` and `getArticlesForListing`. Note which call sites use `getArticles` vs `getArticlesForListing`.

- [ ] **Step 2: Find all call sites**

```bash
grep -rn "getArticles\b\|getArticlesForListing" src/ --include="*.ts" --include="*.tsx" | grep -v "queries/articles.ts"
```

Note every call site — you'll update each one in Step 5.

- [ ] **Step 3: Write a test that verifies the consolidated function**

In `tests/lib/supabase-queries.test.ts` (or wherever article queries are tested), add:

```ts
it('getArticlesForListing returns ArticleListItem shape without body field', async () => {
  mockSupabase.from.mockReturnValue({
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    lte: jest.fn().mockResolvedValue({
      data: [{ id: '1', title: 'Test', slug: 'test', lens: 'health', tags: [], excerpt: 'x', featured: false, access_tier: 'free', cover_image: null, published_at: '2026-01-01', author: 'The Chairman' }],
      error: null,
    }),
  });
  const results = await getArticlesForListing({ lens: 'health', limit: 5 });
  expect(results[0]).not.toHaveProperty('body');
  expect(results[0]).toHaveProperty('slug');
});
```

Run to confirm it passes before you change anything:
```bash
npx jest tests/lib/supabase-queries.test.ts --no-coverage 2>&1 | tail -6
```

Expected: PASS.

- [ ] **Step 4: Consolidate in `src/lib/supabase/queries/articles.ts`**

Replace `getArticles` and `getArticlesForListing` with a single function that accepts a `full?: boolean` option:

```ts
const ARTICLE_LIST_SELECT =
  'id,title,slug,lens,tags,excerpt,featured,access_tier,cover_image,published_at,author';

export async function getArticlesForListing(
  options: {
    lens?: Lens;
    tag?: string;
    limit?: number;
    offset?: number;
    tier?: AccessTier;
  } = {},
): Promise<ArticleListItem[]> {
  const { lens, tag, limit = 20, offset = 0, tier } = options;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = applyPublicContentVisibility(
    supabase
      .from('articles')
      .select(ARTICLE_LIST_SELECT)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1),
    nowIso,
  );

  if (lens) query = query.eq('lens', lens);
  if (tag) query = query.contains('tags', [tag]);
  if (tier) query = query.eq('access_tier', tier);

  return fetchRows<ArticleListItem>(query, 'getArticlesForListing');
}

/** Full article rows including `body`. Use only on detail pages — larger payload. */
export async function getArticles(
  options: {
    lens?: Lens;
    tag?: string;
    limit?: number;
    offset?: number;
    tier?: AccessTier;
  } = {},
): Promise<Article[]> {
  const { lens, tag, limit = 20, offset = 0, tier } = options;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = applyPublicContentVisibility(
    supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1),
    nowIso,
  );

  if (lens) query = query.eq('lens', lens);
  if (tag) query = query.contains('tags', [tag]);
  if (tier) query = query.eq('access_tier', tier);

  return fetchRows<Article>(query, 'getArticles');
}
```

Note: The functions remain separate exports (same API surface) but the shared options type and query-building logic is now clearly parallel. If further consolidation is desired, extract a `buildArticleQuery` helper — but only if both functions diverge further in the future (YAGNI).

- [ ] **Step 5: Run tests**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: PASS — all existing call sites work unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/queries/articles.ts
git commit -m "refactor(queries): normalize getArticles and getArticlesForListing — consistent structure, same API"
```

---

## Task 6: Sentry integration

**Files:**
- Create: `sentry.client.config.ts`
- Create: `sentry.server.config.ts`
- Modify: `next.config.ts`
- Modify: `.env` documentation (not the actual file — update `docs/ops/env-vars.md`)

**Context:** The project currently has no production error tracking. Silent failures in Stripe webhook handlers, failed DB queries, and rendering errors are invisible unless you happen to check Vercel logs. Sentry captures errors automatically and surfaces them with stack traces and context.

**Before starting:** You need a Sentry DSN. Create a project at sentry.io (or use an existing one) and copy the DSN from Project Settings → Client Keys.

- [ ] **Step 1: Install `@sentry/nextjs`**

```bash
npm install @sentry/nextjs
```

- [ ] **Step 2: Create `sentry.client.config.ts`**

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  debug: false,
  // Only report errors — not performance traces — in production
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
  replaysSessionSampleRate: 0,
});
```

- [ ] **Step 3: Create `sentry.server.config.ts`**

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  debug: false,
});
```

- [ ] **Step 4: Update `next.config.ts` to wrap with Sentry**

Replace the current file:

```ts
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/resources', destination: '/records', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/logos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/textures/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/placeholders/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/og-image.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
```

- [ ] **Step 5: Add the required environment variables**

In `.env.local` (do NOT commit):
```
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@o123.ingest.sentry.io/456
SENTRY_ORG=your-sentry-org-slug
SENTRY_PROJECT=blackmalejournal
SENTRY_AUTH_TOKEN=your-auth-token
```

In Vercel dashboard → Environment Variables, add `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` for all environments.

- [ ] **Step 6: Document in `docs/ops/env-vars.md`**

Add entries for all four Sentry variables following the existing format in that file. Mark `SENTRY_AUTH_TOKEN` as server-only (no `NEXT_PUBLIC_` prefix).

- [ ] **Step 7: Type-check and build**

```bash
npx tsc --noEmit 2>&1 | grep -i sentry | head -5
npm run build 2>&1 | tail -10
```

Expected: no type errors. Build may emit Sentry upload warnings if `SENTRY_AUTH_TOKEN` is not set — that's fine for local builds.

- [ ] **Step 8: Commit**

```bash
git add sentry.client.config.ts sentry.server.config.ts next.config.ts docs/ops/env-vars.md package.json package-lock.json
git commit -m "feat(observability): add Sentry error tracking for production — covers server errors, webhook failures, and client exceptions"
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

Expected: no errors.

- [ ] **Build**

```bash
npm run build
```

Expected: build succeeds.

---

## Task Order and Dependencies

```
Task 1 (rate limiter)    — independent, requires Docker for migration
Task 2 (FilterTabs)      — independent
Task 3 (ErrorBoundary)   — independent
Task 4 (toast)           — independent
Task 5 (query cleanup)   — requires Phase 1 + Phase 2 merged first
Task 6 (Sentry)          — independent, requires Sentry DSN
```

All tasks except 5 can be executed in any order in any session. Task 5 should wait for the two open PRs to land.
