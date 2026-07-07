# Search Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PostgreSQL full-text search with relevance ranking and lens/type/sort filters to the /search page.

**Architecture:** Supabase migration adds `search_vector` tsvector columns + GIN indexes to 4 content tables, plus an RPC function `search_content` that accepts query + filters and returns relevance-ranked results. The API route passes filter params through. The /search page gets a filter bar (lens pills, type chips, sort toggle, clear-all). Cmd+K dialog benefits from relevance ranking but gets no filter UI.

**Tech Stack:** PostgreSQL FTS (tsvector/tsquery/ts_rank), Supabase RPC, Next.js App Router (Server Components), Zod validation, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-26-search-enhancement-design.md`

---

## File Structure

### New files
| File | Responsibility |
|------|----------------|
| `supabase/migrations/20260327000000_add-fts-search.sql` | FTS columns, GIN indexes, `search_content` RPC function |
| `src/components/search/SearchFilters.tsx` | Filter bar: lens pills, type chips, sort dropdown, clear-all |
| `tests/components/SearchFilters.test.tsx` | Filter bar rendering and interaction tests |

### Modified files
| File | Changes |
|------|---------|
| `src/lib/supabase/types.ts` | Add `SearchContentType`, update `SearchResult` with `relevance` and `accessTier` |
| `src/lib/content/search-constants.ts` | Add `SEARCH_SORT_OPTIONS`, `SEARCH_CONTENT_TYPES` |
| `src/lib/supabase/queries.ts` | Add `searchContentFTS()` wrapping RPC call |
| `src/app/api/search/route.ts` | Accept filter/sort params, Zod validation, call FTS with fallback |
| `src/app/(public)/search/page.tsx` | Add filter bar, pass params, enhanced result cards |
| `tests/api/search.test.ts` | Add tests for filter params, sort, validation, fallback |
| `tests/pages/search.test.tsx` | Add page-level tests if they exist (create if not) |

---

### Task 1: Database Migration — FTS Columns, Indexes, RPC

**Files:**
- Create: `supabase/migrations/20260327000000_add-fts-search.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Add full-text search infrastructure for search enhancement
-- Adds tsvector columns, GIN indexes, and search_content RPC function

-- ── Step 1: Add search_vector columns ───────────────────────────────────────

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
  ) STORED;

ALTER TABLE public.briefings ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
  ) STORED;

ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
  ) STORED;

ALTER TABLE public.handbooks ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

-- ── Step 2: Add GIN indexes ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS articles_search_vector_idx ON public.articles USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS briefings_search_vector_idx ON public.briefings USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS dispatches_search_vector_idx ON public.dispatches USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS handbooks_search_vector_idx ON public.handbooks USING GIN (search_vector);

-- ── Step 3: Create search_content RPC function ──────────────────────────────

CREATE OR REPLACE FUNCTION public.search_content(
  query text,
  filter_lens text[] DEFAULT NULL,
  filter_types text[] DEFAULT NULL,
  sort_by text DEFAULT 'relevance',
  result_limit int DEFAULT 30
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  lens text,
  access_tier text,
  published_at timestamptz,
  content_type text,
  relevance real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tsq tsquery;
BEGIN
  tsq := websearch_to_tsquery('english', query);

  RETURN QUERY
  WITH combined AS (
    -- Articles
    SELECT
      a.id, a.title, a.slug,
      a.excerpt,
      a.lens::text,
      a.access_tier::text,
      a.published_at,
      'article'::text AS content_type,
      ts_rank(a.search_vector, tsq) AS relevance
    FROM public.articles a
    WHERE a.search_vector @@ tsq
      AND a.status IN ('published', 'scheduled')
      AND a.published_at <= now()
      AND (filter_lens IS NULL OR a.lens::text = ANY(filter_lens))
      AND (filter_types IS NULL OR 'article' = ANY(filter_types))

    UNION ALL

    -- Briefings (no lens column — excluded when lens filter is active)
    SELECT
      b.id, b.title, b.slug,
      ''::text AS excerpt,
      NULL::text AS lens,
      b.access_tier::text,
      b.published_at,
      'briefing'::text AS content_type,
      ts_rank(b.search_vector, tsq) AS relevance
    FROM public.briefings b
    WHERE b.search_vector @@ tsq
      AND b.status IN ('published', 'scheduled')
      AND b.published_at <= now()
      AND filter_lens IS NULL
      AND (filter_types IS NULL OR 'briefing' = ANY(filter_types))

    UNION ALL

    -- Dispatches
    SELECT
      d.id, d.title, d.slug,
      d.excerpt,
      d.lens::text,
      'free'::text AS access_tier,
      d.published_at,
      'dispatch'::text AS content_type,
      ts_rank(d.search_vector, tsq) AS relevance
    FROM public.dispatches d
    WHERE d.search_vector @@ tsq
      AND d.status IN ('published', 'scheduled')
      AND d.published_at <= now()
      AND (filter_lens IS NULL OR d.lens::text = ANY(filter_lens))
      AND (filter_types IS NULL OR 'dispatch' = ANY(filter_types))

    UNION ALL

    -- Handbooks
    SELECT
      h.id, h.title, h.slug,
      h.description AS excerpt,
      h.lens::text,
      h.access_tier::text,
      h.published_at,
      'handbook'::text AS content_type,
      ts_rank(h.search_vector, tsq) AS relevance
    FROM public.handbooks h
    WHERE h.search_vector @@ tsq
      AND h.status IN ('published', 'scheduled')
      AND h.published_at <= now()
      AND (filter_lens IS NULL OR h.lens::text = ANY(filter_lens))
      AND (filter_types IS NULL OR 'handbook' = ANY(filter_types))
  )
  SELECT * FROM combined
  ORDER BY
    CASE WHEN sort_by = 'date' THEN NULL ELSE combined.relevance END DESC NULLS LAST,
    CASE WHEN sort_by = 'date' THEN combined.published_at ELSE NULL END DESC NULLS LAST
  LIMIT result_limit;
END;
$$;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260327000000_add-fts-search.sql
git commit -m "feat: add FTS migration with search_vector columns, GIN indexes, and search_content RPC"
```

---

### Task 2: Update Types and Constants

**Files:**
- Modify: `src/lib/supabase/types.ts:179-186`
- Modify: `src/lib/content/search-constants.ts`

- [ ] **Step 1: Update SearchResult type**

In `src/lib/supabase/types.ts`, replace the `SearchResult` type:

```typescript
export type SearchContentType = 'article' | 'briefing' | 'handbook' | 'dispatch';

export type SearchResult = {
  type: SearchContentType;
  title: string;
  slug: string;
  excerpt: string;
  lens?: Lens;
  accessTier?: AccessTier;
  publishedAt: string;
  relevance?: number;
};
```

- [ ] **Step 2: Update search constants**

In `src/lib/content/search-constants.ts`, add sort options and content type labels:

```typescript
import { FileText, BookOpen, Newspaper, Send } from 'lucide-react';
import type { SearchContentType } from '@/lib/supabase/types';

export const SEARCH_TYPE_ICONS = {
  article: FileText,
  briefing: Newspaper,
  handbook: BookOpen,
  dispatch: Send,
} as const;

export const SEARCH_TYPE_PATHS = {
  article: '/articles',
  briefing: '/briefings',
  handbook: '/handbooks',
  dispatch: '/blog',
} as const;

export const SEARCH_TYPE_LABELS: Record<SearchContentType, string> = {
  article: 'Article',
  briefing: 'Briefing',
  handbook: 'Handbook',
  dispatch: 'Dispatch',
};

export const SEARCH_SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Newest first' },
] as const;

export type SearchSortValue = (typeof SEARCH_SORT_OPTIONS)[number]['value'];
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: Clean (no errors). Fix any downstream type issues from the `SearchResult` change — the `publishedAt` field name is unchanged, but `accessTier` and `relevance` are new optional fields so existing consumers should be fine.

- [ ] **Step 4: Fix any broken tests from the type change**

Run: `npx jest --no-coverage`
Expected: All pass. If `tests/lib/search.test.ts` fails, update the test fixture to match the new type shape.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/types.ts src/lib/content/search-constants.ts
git commit -m "feat: add SearchContentType, search sort options, and type labels"
```

---

### Task 3: Add FTS Query Function

**Files:**
- Modify: `src/lib/supabase/queries.ts`
- Test: `tests/lib/search.test.ts`

- [ ] **Step 1: Write the failing test**

Replace `tests/lib/search.test.ts` with:

```typescript
import type { SearchResult } from '@/lib/supabase/types';

const mockRpc = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ rpc: mockRpc })),
}));

jest.mock('@/lib/supabase/queries', () => {
  const actual = jest.requireActual('@/lib/supabase/queries');
  return actual;
});

import { searchContentFTS } from '@/lib/supabase/queries';

jest.spyOn(console, 'error').mockImplementation(() => {});

describe('searchContentFTS', () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  test('calls RPC with correct params', async () => {
    mockRpc.mockResolvedValue({
      data: [{
        id: '1', title: 'Test', slug: 'test', excerpt: 'Ex',
        lens: 'health', access_tier: 'free', published_at: '2026-01-01T00:00:00Z',
        content_type: 'article', relevance: 0.5,
      }],
      error: null,
    });

    const results = await searchContentFTS('test', {
      lens: ['health'],
      types: ['article'],
      sort: 'relevance',
      limit: 10,
    });

    expect(mockRpc).toHaveBeenCalledWith('search_content', {
      query: 'test',
      filter_lens: ['health'],
      filter_types: ['article'],
      sort_by: 'relevance',
      result_limit: 10,
    });
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('article');
    expect(results[0].relevance).toBe(0.5);
  });

  test('returns empty array on RPC error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'function not found' } });

    const results = await searchContentFTS('test');
    expect(results).toEqual([]);
  });

  test('passes null for omitted filters', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    await searchContentFTS('test');

    expect(mockRpc).toHaveBeenCalledWith('search_content', {
      query: 'test',
      filter_lens: null,
      filter_types: null,
      sort_by: 'relevance',
      result_limit: 30,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/lib/search.test.ts --no-coverage`
Expected: FAIL — `searchContentFTS` is not exported from queries.ts

- [ ] **Step 3: Write the implementation**

Add to the bottom of `src/lib/supabase/queries.ts`:

```typescript
export type SearchFTSOptions = {
  lens?: string[];
  types?: string[];
  sort?: 'relevance' | 'date';
  limit?: number;
};

export async function searchContentFTS(
  query: string,
  options: SearchFTSOptions = {},
): Promise<SearchResult[]> {
  const { lens, types, sort = 'relevance', limit = 30 } = options;
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('search_content', {
    query: query.trim(),
    filter_lens: lens ?? null,
    filter_types: types ?? null,
    sort_by: sort,
    result_limit: limit,
  });

  if (error) {
    console.error('[searchContentFTS]', error.message);
    return [];
  }

  return ((data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    lens: string | null;
    access_tier: string;
    published_at: string;
    content_type: string;
    relevance: number;
  }>).map((row) => ({
    type: row.content_type as SearchResult['type'],
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? '',
    lens: (row.lens as Lens) ?? undefined,
    accessTier: (row.access_tier as AccessTier) ?? undefined,
    publishedAt: row.published_at,
    relevance: row.relevance,
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/lib/search.test.ts --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/queries.ts tests/lib/search.test.ts
git commit -m "feat: add searchContentFTS query function wrapping Supabase RPC"
```

---

### Task 4: Update API Route with Filters and Fallback

**Files:**
- Modify: `src/app/api/search/route.ts`
- Modify: `tests/api/search.test.ts`

- [ ] **Step 1: Write the failing tests**

Replace `tests/api/search.test.ts`:

```typescript
/** @jest-environment node */
let _ipCounter = 0;
jest.mock('next/headers', () => ({
  headers: () => Promise.resolve(new Map([['x-forwarded-for', `10.0.0.${++_ipCounter}`]])),
}));

const mockSearchFTS = jest.fn().mockResolvedValue([
  { type: 'article', title: 'Test', slug: 'test', excerpt: 'Ex', lens: 'health', accessTier: 'free', publishedAt: '2026-01-01', relevance: 0.5 },
]);
const mockSearchContent = jest.fn().mockResolvedValue([
  { type: 'article', title: 'Test', slug: 'test', excerpt: 'Ex', lens: 'health', publishedAt: '2026-01-01' },
]);

jest.mock('@/lib/supabase/queries', () => ({
  searchContentFTS: (...args: unknown[]) => mockSearchFTS(...args),
  searchContent: (...args: unknown[]) => mockSearchContent(...args),
}));

import { GET } from '@/app/api/search/route';

describe('GET /api/search', () => {
  beforeEach(() => {
    mockSearchFTS.mockClear();
    mockSearchContent.mockClear();
  });

  test('returns 400 for missing query param', async () => {
    const req = new Request('http://localhost:3000/api/search');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('returns 400 for query shorter than 2 chars', async () => {
    const req = new Request('http://localhost:3000/api/search?q=a');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('returns results for valid query', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.results).toHaveLength(1);
    expect(data.query).toBe('test');
  });

  test('passes lens filter to FTS', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&lens=health,politics');
    await GET(req);
    expect(mockSearchFTS).toHaveBeenCalledWith('test', expect.objectContaining({
      lens: ['health', 'politics'],
    }));
  });

  test('passes type filter to FTS', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&type=article,briefing');
    await GET(req);
    expect(mockSearchFTS).toHaveBeenCalledWith('test', expect.objectContaining({
      types: ['article', 'briefing'],
    }));
  });

  test('passes sort param to FTS', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&sort=date');
    await GET(req);
    expect(mockSearchFTS).toHaveBeenCalledWith('test', expect.objectContaining({
      sort: 'date',
    }));
  });

  test('strips invalid lens values', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&lens=health,INVALID');
    await GET(req);
    expect(mockSearchFTS).toHaveBeenCalledWith('test', expect.objectContaining({
      lens: ['health'],
    }));
  });

  test('falls back to searchContent when FTS returns empty on error', async () => {
    mockSearchFTS.mockResolvedValueOnce([]);
    const req = new Request('http://localhost:3000/api/search?q=test');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/api/search.test.ts --no-coverage`
Expected: FAIL — route doesn't accept filter params yet

- [ ] **Step 3: Rewrite the API route**

Replace `src/app/api/search/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { searchContentFTS, searchContent } from '@/lib/supabase/queries';
import { rateLimit } from '@/lib/rate-limit';
import type { Lens } from '@/lib/supabase/types';

const VALID_LENSES: Set<string> = new Set<string>([
  'health', 'politics', 'culture', 'entertainment', 'business',
]);
const VALID_TYPES: Set<string> = new Set([
  'article', 'briefing', 'dispatch', 'handbook',
]);
const VALID_SORTS: Set<string> = new Set(['relevance', 'date']);

const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

export async function GET(request: Request) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success } = limiter.check(30, ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters.' },
      { status: 400 },
    );
  }

  const lensParam = searchParams.get('lens');
  const typeParam = searchParams.get('type');
  const sortParam = searchParams.get('sort') ?? 'relevance';
  const limitParam = Math.min(Number(searchParams.get('limit')) || 30, 50);

  const lens = lensParam
    ? lensParam.split(',').filter((v) => VALID_LENSES.has(v))
    : undefined;
  const types = typeParam
    ? typeParam.split(',').filter((v) => VALID_TYPES.has(v))
    : undefined;
  const sort = VALID_SORTS.has(sortParam) ? (sortParam as 'relevance' | 'date') : 'relevance';

  const results = await searchContentFTS(query.trim(), {
    lens: lens?.length ? lens : undefined,
    types: types?.length ? types : undefined,
    sort,
    limit: limitParam,
  });

  return NextResponse.json({ results, query: query.trim() });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/api/search.test.ts --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/search/route.ts" tests/api/search.test.ts
git commit -m "feat: add filter/sort params to search API route with validation"
```

---

### Task 5: Build SearchFilters Component

**Files:**
- Create: `src/components/search/SearchFilters.tsx`
- Create: `tests/components/SearchFilters.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/components/SearchFilters.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SearchFilters } from '@/components/search/SearchFilters';

describe('SearchFilters', () => {
  const baseProps = {
    query: 'test',
    activeLenses: [] as string[],
    activeTypes: [] as string[],
    activeSort: 'relevance' as const,
  };

  test('renders all lens pills', () => {
    render(<SearchFilters {...baseProps} />);
    expect(screen.getByRole('button', { name: /health/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /politics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /culture/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entertainment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /business/i })).toBeInTheDocument();
  });

  test('renders all content type chips', () => {
    render(<SearchFilters {...baseProps} />);
    expect(screen.getByRole('button', { name: /article/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /briefing/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dispatch/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /handbook/i })).toBeInTheDocument();
  });

  test('renders sort dropdown', () => {
    render(<SearchFilters {...baseProps} />);
    expect(screen.getByRole('combobox', { name: /sort/i })).toBeInTheDocument();
  });

  test('highlights active lens pills', () => {
    render(<SearchFilters {...baseProps} activeLenses={['health']} />);
    const healthBtn = screen.getByRole('button', { name: /health/i });
    expect(healthBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('shows clear-all only when filters are active', () => {
    const { rerender } = render(<SearchFilters {...baseProps} />);
    expect(screen.queryByText(/clear all/i)).not.toBeInTheDocument();

    rerender(<SearchFilters {...baseProps} activeLenses={['health']} />);
    expect(screen.getByText(/clear all/i)).toBeInTheDocument();
  });

  test('lens pill links include correct query params', () => {
    render(<SearchFilters {...baseProps} />);
    const healthBtn = screen.getByRole('button', { name: /health/i });
    const link = healthBtn.closest('a');
    expect(link).toHaveAttribute('href', expect.stringContaining('lens=health'));
    expect(link).toHaveAttribute('href', expect.stringContaining('q=test'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/components/SearchFilters.test.tsx --no-coverage`
Expected: FAIL — module not found

- [ ] **Step 3: Write the component**

Create `src/components/search/SearchFilters.tsx`:

```tsx
import Link from 'next/link';
import { LENS_THEMES } from '@/lib/lens-theme';
import type { Lens } from '@/lib/supabase/types';
import { SEARCH_TYPE_LABELS, SEARCH_SORT_OPTIONS, type SearchSortValue } from '@/lib/content/search-constants';

type SearchFiltersProps = {
  query: string;
  activeLenses: string[];
  activeTypes: string[];
  activeSort: SearchSortValue;
};

const LENSES: { value: Lens; label: string }[] = [
  { value: 'health', label: 'Health' },
  { value: 'politics', label: 'Politics' },
  { value: 'culture', label: 'Culture' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'business', label: 'Business' },
];

const CONTENT_TYPES = (
  Object.entries(SEARCH_TYPE_LABELS) as [string, string][]
).map(([value, label]) => ({ value, label }));

function buildHref(
  query: string,
  lenses: string[],
  types: string[],
  sort: string,
): string {
  const params = new URLSearchParams();
  params.set('q', query);
  if (lenses.length) params.set('lens', lenses.join(','));
  if (types.length) params.set('type', types.join(','));
  if (sort !== 'relevance') params.set('sort', sort);
  return `/search?${params.toString()}`;
}

function toggleValue(arr: string[], value: string): string[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}

export function SearchFilters({
  query,
  activeLenses,
  activeTypes,
  activeSort,
}: SearchFiltersProps) {
  const hasFilters = activeLenses.length > 0 || activeTypes.length > 0 || activeSort !== 'relevance';

  return (
    <div className="mb-8 space-y-4">
      {/* Lens pills */}
      <div className="flex flex-wrap gap-2">
        <span className="mr-1 self-center font-label text-micro uppercase tracking-widest text-bmj-tan">
          Lens
        </span>
        {LENSES.map((lens) => {
          const isActive = activeLenses.includes(lens.value);
          const nextLenses = toggleValue(activeLenses, lens.value);
          return (
            <Link
              key={lens.value}
              href={buildHref(query, nextLenses, activeTypes, activeSort)}
              scroll={false}
            >
              <button
                type="button"
                role="button"
                aria-pressed={isActive}
                className={`px-3 py-1.5 font-label text-xs uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'bg-bmj-red text-bmj-white'
                    : 'border border-bmj-tan/30 text-bmj-cream hover:border-bmj-tan/60'
                }`}
              >
                {lens.label}
              </button>
            </Link>
          );
        })}
      </div>

      {/* Content type chips */}
      <div className="flex flex-wrap gap-2">
        <span className="mr-1 self-center font-label text-micro uppercase tracking-widest text-bmj-tan">
          Type
        </span>
        {CONTENT_TYPES.map((ct) => {
          const isActive = activeTypes.includes(ct.value);
          const nextTypes = toggleValue(activeTypes, ct.value);
          return (
            <Link
              key={ct.value}
              href={buildHref(query, activeLenses, nextTypes, activeSort)}
              scroll={false}
            >
              <button
                type="button"
                role="button"
                aria-pressed={isActive}
                className={`px-3 py-1.5 font-label text-xs uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'bg-bmj-red text-bmj-white'
                    : 'border border-bmj-tan/30 text-bmj-cream hover:border-bmj-tan/60'
                }`}
              >
                {ct.label}
              </button>
            </Link>
          );
        })}
      </div>

      {/* Sort + clear row */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="font-label text-micro uppercase tracking-widest text-bmj-tan">
            Sort
          </span>
          <select
            aria-label="Sort"
            defaultValue={activeSort}
            onChange={(e) => {
              window.location.href = buildHref(query, activeLenses, activeTypes, e.target.value);
            }}
            className="border border-bmj-tan/30 bg-bmj-black px-3 py-1.5 font-label text-xs uppercase tracking-widest text-bmj-cream outline-none focus:border-bmj-red"
          >
            {SEARCH_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {hasFilters && (
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
          >
            Clear all
          </Link>
        )}
      </div>
    </div>
  );
}
```

Note: The `select` uses `onChange` with `window.location.href` since this is a Server Component page — the select needs a small client interaction to navigate. Alternatively this could be wrapped in a thin client component, but `onChange` with navigation is simpler for a single `<select>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/components/SearchFilters.test.tsx --no-coverage`
Expected: PASS (some tests may need adjustment based on actual rendering — the link wrapping pattern may need tweaks to pass the aria-pressed assertions)

- [ ] **Step 5: Commit**

```bash
git add src/components/search/SearchFilters.tsx tests/components/SearchFilters.test.tsx
git commit -m "feat: add SearchFilters component with lens, type, and sort controls"
```

---

### Task 6: Update Search Page with Filters and Enhanced Results

**Files:**
- Modify: `src/app/(public)/search/page.tsx`

- [ ] **Step 1: Rewrite the search page**

Replace `src/app/(public)/search/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { searchContentFTS } from '@/lib/supabase/queries';
import { LensBadge } from '@/components/brand/LensBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SEARCH_TYPE_ICONS, SEARCH_TYPE_PATHS } from '@/lib/content/search-constants';
import type { Lens, SearchResult } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Search — The Black Male Journal',
};

const VALID_LENSES = new Set(['health', 'politics', 'culture', 'entertainment', 'business']);
const VALID_TYPES = new Set(['article', 'briefing', 'dispatch', 'handbook']);
const VALID_SORTS = new Set(['relevance', 'date']);

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    lens?: string;
    type?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const activeLenses = params.lens?.split(',').filter((v) => VALID_LENSES.has(v)) ?? [];
  const activeTypes = params.type?.split(',').filter((v) => VALID_TYPES.has(v)) ?? [];
  const activeSort = VALID_SORTS.has(params.sort ?? '') ? (params.sort as 'relevance' | 'date') : 'relevance';

  const results = query.length >= 2
    ? await searchContentFTS(query, {
        lens: activeLenses.length ? activeLenses : undefined,
        types: activeTypes.length ? activeTypes : undefined,
        sort: activeSort,
      })
    : [];

  const hasFilters = activeLenses.length > 0 || activeTypes.length > 0 || activeSort !== 'relevance';

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <h1 className="font-display text-5xl text-bmj-white">Search</h1>
      <StarDivider />

      <form action="/search" method="GET" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search articles, briefings, handbooks..."
            className="flex-1 border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder-bmj-tan/50 outline-none focus:border-bmj-red"
            aria-label="Search"
          />
          <button
            type="submit"
            className="bg-bmj-red px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <SearchFilters
          query={query}
          activeLenses={activeLenses}
          activeTypes={activeTypes}
          activeSort={activeSort}
        />
      )}

      {query && (
        <p className="mb-8 font-mono text-xs text-bmj-tan">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          {activeSort === 'relevance' ? ' by relevance' : ' by date'}
        </p>
      )}

      <div className="space-y-1">
        {results.map((result: SearchResult) => {
          const Icon = SEARCH_TYPE_ICONS[result.type] ?? SEARCH_TYPE_ICONS.article;
          const href = `${SEARCH_TYPE_PATHS[result.type] ?? '/articles'}/${result.slug}`;
          return (
            <Link
              key={`${result.type}-${result.slug}`}
              href={href}
              className="flex items-start gap-4 border-b border-bmj-tan/10 py-6 no-underline transition-colors hover:bg-bmj-brown/50"
            >
              <Icon size={18} className="mt-1 shrink-0 text-bmj-tan" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-micro uppercase tracking-widest text-bmj-tan">
                    {result.type}
                  </span>
                  {result.lens && <LensBadge lens={result.lens as Lens} />}
                  {result.accessTier && result.accessTier !== 'free' && (
                    <span className="border border-bmj-amber/40 px-1.5 py-0.5 font-label text-micro uppercase tracking-widest text-bmj-amber">
                      {result.accessTier}
                    </span>
                  )}
                </div>
                <h2 className="mt-1 font-display text-xl text-bmj-white">{result.title}</h2>
                {result.excerpt && (
                  <p className="mt-1 line-clamp-2 font-body text-sm text-bmj-cream/70">
                    {result.excerpt}
                  </p>
                )}
                {result.relevance != null && result.relevance > 0.1 && (
                  <p className="mt-1 font-mono text-xs text-bmj-tan">
                    {result.relevance > 0.3 ? 'Strong match' : 'Partial match'}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {query && results.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-body text-lg text-bmj-cream">No results found.</p>
          <p className="mt-2 font-body text-sm text-bmj-tan">
            {hasFilters
              ? 'Try removing some filters or broadening your search.'
              : 'Try different keywords or browse our '}
            {!hasFilters && (
              <Link href="/articles" className="text-bmj-red">articles</Link>
            )}
            {hasFilters && (
              <>
                {' '}
                <Link href={`/search?q=${encodeURIComponent(query)}`} className="text-bmj-red">
                  Clear filters
                </Link>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: Clean

- [ ] **Step 3: Run full test suite**

Run: `npx jest --no-coverage`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/search/page.tsx"
git commit -m "feat: add filter bar and relevance indicators to search page"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: Clean

- [ ] **Step 2: Full test suite**

Run: `npx jest --no-coverage`
Expected: All 130+ suites pass

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "chore: search enhancement final verification fixes"
```
