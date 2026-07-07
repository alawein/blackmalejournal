# Member Bookmarks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let members bookmark articles, briefings, dispatches, and handbooks for later reading, with a "Saved" page in the portal.

**Architecture:** New `member_bookmarks` table with RLS policies. Server action toggles bookmarks. Query functions join bookmarks with content tables. Client-side `BookmarkButton` with optimistic UI appears on detail pages. Server-rendered "Saved" page in the portal groups bookmarks by type.

**Tech Stack:** Supabase (PostgreSQL, RLS), Next.js Server Actions, React client components, lucide-react icons, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-27-member-bookmarks-design.md`

---

## File Structure

### New files
| File | Responsibility |
|------|----------------|
| `supabase/migrations/20260327100000_create-member-bookmarks.sql` | Table, unique constraint, index, RLS policies |
| `src/lib/supabase/bookmarks.ts` | Query functions: getBookmarksForMember, isBookmarked, getBookmarkCount |
| `src/components/content/BookmarkButton.tsx` | Client component: toggle bookmark icon with optimistic UI |
| `src/app/(auth)/portal/bookmarks/page.tsx` | Saved page: grouped bookmark list |
| `src/app/(auth)/portal/bookmarks/actions.ts` | Server action: toggleBookmark |
| `tests/lib/bookmarks.test.ts` | Query function tests |
| `tests/components/BookmarkButton.test.tsx` | Component render + interaction tests |
| `tests/pages/portal-bookmarks.test.tsx` | Saved page rendering tests |

### Modified files
| File | Changes |
|------|---------|
| `src/lib/supabase/types.ts` | Add `BookmarkedItem` type |
| `src/app/(auth)/portal/page.tsx` | Add "Saved" quick link with bookmark count |
| `src/app/(public)/articles/[slug]/page.tsx` | Add BookmarkButton next to title |
| `src/app/(public)/briefings/[slug]/page.tsx` | Add BookmarkButton next to title |
| `src/app/(public)/blog/[slug]/page.tsx` | Add BookmarkButton next to title |
| `src/app/(public)/handbooks/[slug]/page.tsx` | Add BookmarkButton next to title |

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260327100000_create-member-bookmarks.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Create member_bookmarks table for saved content feature

CREATE TABLE public.member_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('article', 'briefing', 'dispatch', 'handbook')),
  content_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate bookmarks
ALTER TABLE public.member_bookmarks
  ADD CONSTRAINT member_bookmarks_unique UNIQUE (member_id, content_type, content_id);

-- Fast portal lookups by member
CREATE INDEX member_bookmarks_member_id_idx ON public.member_bookmarks (member_id);

-- RLS: members can only access their own bookmarks
ALTER TABLE public.member_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_bookmarks_select ON public.member_bookmarks
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY member_bookmarks_insert ON public.member_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY member_bookmarks_delete ON public.member_bookmarks
  FOR DELETE USING (auth.uid() = member_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260327100000_create-member-bookmarks.sql
git commit -m "feat: add member_bookmarks table with RLS policies"
```

---

### Task 2: Types and Query Functions

**Files:**
- Modify: `src/lib/supabase/types.ts`
- Create: `src/lib/supabase/bookmarks.ts`
- Create: `tests/lib/bookmarks.test.ts`

- [ ] **Step 1: Add BookmarkedItem type**

Add to `src/lib/supabase/types.ts` after the `SearchResult` type:

```typescript
export type BookmarkedItem = {
  bookmarkId: string;
  contentType: SearchContentType;
  contentId: string;
  title: string;
  slug: string;
  lens?: Lens;
  accessTier?: AccessTier;
  publishedAt: string;
  bookmarkedAt: string;
};
```

- [ ] **Step 2: Write failing tests**

Create `tests/lib/bookmarks.test.ts`:

```typescript
import { createMockSupabaseClient, type MockSupabaseClient } from '../helpers/supabase-mock';

let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockClient)),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getBookmarksForMember,
  isBookmarked,
  getBookmarkCount,
} from '@/lib/supabase/bookmarks';

function resetClient(overrides?: Record<string, unknown>) {
  mockClient = createMockSupabaseClient(overrides);
}

describe('isBookmarked', () => {
  beforeEach(() => resetClient());

  test('returns true when bookmark exists', async () => {
    resetClient({ data: [{ id: 'bk-1' }], error: null });
    const result = await isBookmarked('member-1', 'article', 'art-1');
    expect(result).toBe(true);
  });

  test('returns false when no bookmark', async () => {
    resetClient({ data: [], error: null });
    const result = await isBookmarked('member-1', 'article', 'art-1');
    expect(result).toBe(false);
  });

  test('returns false on error', async () => {
    resetClient({ data: null, error: { message: 'fail' } });
    const result = await isBookmarked('member-1', 'article', 'art-1');
    expect(result).toBe(false);
  });
});

describe('getBookmarkCount', () => {
  beforeEach(() => resetClient());

  test('returns count from data', async () => {
    resetClient({ data: [{ count: 5 }], error: null });
    const result = await getBookmarkCount('member-1');
    expect(result).toBe(5);
  });

  test('returns 0 on error', async () => {
    resetClient({ data: null, error: { message: 'fail' } });
    const result = await getBookmarkCount('member-1');
    expect(result).toBe(0);
  });
});

describe('getBookmarksForMember', () => {
  beforeEach(() => resetClient());

  test('returns empty array when no bookmarks', async () => {
    resetClient({ data: [], error: null });
    const result = await getBookmarksForMember('member-1');
    expect(result).toEqual([]);
  });

  test('returns empty array on error', async () => {
    resetClient({ data: null, error: { message: 'fail' } });
    const result = await getBookmarksForMember('member-1');
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx jest tests/lib/bookmarks.test.ts --no-coverage`
Expected: FAIL — module not found

- [ ] **Step 4: Write the query functions**

Create `src/lib/supabase/bookmarks.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';
import type { BookmarkedItem } from '@/lib/supabase/types';

export async function isBookmarked(
  memberId: string,
  contentType: string,
  contentId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('member_bookmarks')
    .select('id')
    .eq('member_id', memberId)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .limit(1);

  if (error) {
    console.error('[isBookmarked]', error.message);
    return false;
  }

  return (data ?? []).length > 0;
}

export async function getBookmarkCount(memberId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('member_bookmarks')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', memberId);

  if (error) {
    console.error('[getBookmarkCount]', error.message);
    return 0;
  }

  // Supabase returns count in the response when using { count: 'exact' }
  // but through our mock it comes as data array — handle both
  if (Array.isArray(data) && data.length > 0 && typeof data[0]?.count === 'number') {
    return data[0].count;
  }

  return 0;
}

export async function getBookmarksForMember(
  memberId: string,
): Promise<BookmarkedItem[]> {
  const supabase = await createClient();

  const { data: bookmarks, error } = await supabase
    .from('member_bookmarks')
    .select('id, content_type, content_id, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getBookmarksForMember]', error.message);
    return [];
  }

  if (!bookmarks || bookmarks.length === 0) return [];

  // Group bookmark content_ids by type for batch fetching
  const byType: Record<string, { bookmarkId: string; contentId: string; createdAt: string }[]> = {};
  for (const bk of bookmarks as Array<{ id: string; content_type: string; content_id: string; created_at: string }>) {
    if (!byType[bk.content_type]) byType[bk.content_type] = [];
    byType[bk.content_type].push({
      bookmarkId: bk.id,
      contentId: bk.content_id,
      createdAt: bk.created_at,
    });
  }

  const results: BookmarkedItem[] = [];

  // Fetch content for each type in parallel
  const fetches = Object.entries(byType).map(async ([type, items]) => {
    const ids = items.map((i) => i.contentId);
    const table = type === 'article' ? 'articles'
      : type === 'briefing' ? 'briefings'
      : type === 'dispatch' ? 'dispatches'
      : 'handbooks';

    const selectFields = type === 'handbook'
      ? 'id, title, slug, lens, access_tier, published_at'
      : type === 'briefing'
      ? 'id, title, slug, access_tier, published_at'
      : 'id, title, slug, lens, access_tier, published_at';

    // Dispatches have no access_tier column
    const dispatchFields = 'id, title, slug, lens, published_at';
    const fields = type === 'dispatch' ? dispatchFields : selectFields;

    const { data: content } = await supabase
      .from(table)
      .select(fields)
      .in('id', ids);

    if (!content) return;

    const contentMap = new Map(
      (content as Array<Record<string, unknown>>).map((c) => [c.id as string, c]),
    );

    for (const item of items) {
      const c = contentMap.get(item.contentId);
      if (!c) continue; // Content was deleted — skip orphaned bookmark

      results.push({
        bookmarkId: item.bookmarkId,
        contentType: type as BookmarkedItem['contentType'],
        contentId: item.contentId,
        title: c.title as string,
        slug: c.slug as string,
        lens: (c.lens as BookmarkedItem['lens']) ?? undefined,
        accessTier: (c.access_tier as BookmarkedItem['accessTier']) ?? undefined,
        publishedAt: c.published_at as string,
        bookmarkedAt: item.createdAt,
      });
    }
  });

  await Promise.all(fetches);

  // Sort by bookmarked date (newest first)
  results.sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime());

  return results;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest tests/lib/bookmarks.test.ts --no-coverage`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/types.ts src/lib/supabase/bookmarks.ts tests/lib/bookmarks.test.ts
git commit -m "feat: add bookmark query functions with BookmarkedItem type"
```

---

### Task 3: Toggle Server Action

**Files:**
- Create: `src/app/(auth)/portal/bookmarks/actions.ts`
- Create: `tests/portal/bookmark-actions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/portal/bookmark-actions.test.ts`:

```typescript
/** @jest-environment node */

const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

mockFrom.mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
});

import { toggleBookmark } from '@/app/(auth)/portal/bookmarks/actions';

describe('toggleBookmark', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
  });

  test('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await toggleBookmark('article', 'art-1');
    expect(result).toEqual({ error: 'Not authenticated' });
  });

  test('inserts bookmark when not already bookmarked', async () => {
    // select returns empty (not bookmarked)
    const chain = {
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSelect.mockReturnValue(chain);
    mockInsert.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: [{ id: 'bk-1' }], error: null }),
    });

    const result = await toggleBookmark('article', 'art-1');
    expect(result).toEqual({ bookmarked: true });
  });

  test('deletes bookmark when already bookmarked', async () => {
    // select returns existing bookmark
    const chain = {
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [{ id: 'bk-1' }], error: null }),
    };
    mockSelect.mockReturnValue(chain);

    const deleteChain = {
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ error: null }),
    };
    mockDelete.mockReturnValue(deleteChain);

    const result = await toggleBookmark('article', 'art-1');
    expect(result).toEqual({ bookmarked: false });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/portal/bookmark-actions.test.ts --no-coverage`
Expected: FAIL — module not found

- [ ] **Step 3: Write the server action**

Create `src/app/(auth)/portal/bookmarks/actions.ts`:

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

type ToggleResult =
  | { bookmarked: boolean; error?: never }
  | { bookmarked?: never; error: string };

export async function toggleBookmark(
  contentType: string,
  contentId: string,
): Promise<ToggleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Check if already bookmarked
  const { data: existing, error: checkError } = await supabase
    .from('member_bookmarks')
    .select('id')
    .eq('member_id', user.id)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .limit(1);

  if (checkError) {
    console.error('[toggleBookmark:check]', checkError.message);
    return { error: 'Failed to check bookmark status' };
  }

  if (existing && existing.length > 0) {
    // Remove bookmark
    const { error: deleteError } = await supabase
      .from('member_bookmarks')
      .delete()
      .eq('id', (existing[0] as { id: string }).id);

    if (deleteError) {
      console.error('[toggleBookmark:delete]', deleteError.message);
      return { error: 'Failed to remove bookmark' };
    }

    return { bookmarked: false };
  }

  // Add bookmark
  const { error: insertError } = await supabase
    .from('member_bookmarks')
    .insert({
      member_id: user.id,
      content_type: contentType,
      content_id: contentId,
    });

  if (insertError) {
    console.error('[toggleBookmark:insert]', insertError.message);
    return { error: 'Failed to add bookmark' };
  }

  return { bookmarked: true };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/portal/bookmark-actions.test.ts --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "src/app/(auth)/portal/bookmarks/actions.ts" tests/portal/bookmark-actions.test.ts
git commit -m "feat: add toggleBookmark server action"
```

---

### Task 4: BookmarkButton Component

**Files:**
- Create: `src/components/content/BookmarkButton.tsx`
- Create: `tests/components/BookmarkButton.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/components/BookmarkButton.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BookmarkButton } from '@/components/content/BookmarkButton';

jest.mock('@/app/(auth)/portal/bookmarks/actions', () => ({
  toggleBookmark: jest.fn().mockResolvedValue({ bookmarked: true }),
}));

describe('BookmarkButton', () => {
  test('renders nothing when not logged in', () => {
    const { container } = render(
      <BookmarkButton contentType="article" contentId="1" initialBookmarked={false} isLoggedIn={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders bookmark icon when logged in', () => {
    render(
      <BookmarkButton contentType="article" contentId="1" initialBookmarked={false} isLoggedIn={true} />,
    );
    expect(screen.getByRole('button', { name: /save to bookmarks/i })).toBeInTheDocument();
  });

  test('renders filled state when initially bookmarked', () => {
    render(
      <BookmarkButton contentType="article" contentId="1" initialBookmarked={true} isLoggedIn={true} />,
    );
    expect(screen.getByRole('button', { name: /remove bookmark/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test('renders unpressed state when not bookmarked', () => {
    render(
      <BookmarkButton contentType="article" contentId="1" initialBookmarked={false} isLoggedIn={true} />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/components/BookmarkButton.test.tsx --no-coverage`
Expected: FAIL — module not found

- [ ] **Step 3: Write the component**

Create `src/components/content/BookmarkButton.tsx`:

```tsx
'use client';

import { useState, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleBookmark } from '@/app/(auth)/portal/bookmarks/actions';

type BookmarkButtonProps = {
  contentType: string;
  contentId: string;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
};

export function BookmarkButton({
  contentType,
  contentId,
  initialBookmarked,
  isLoggedIn,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) return null;

  function handleClick() {
    const previous = bookmarked;
    setBookmarked(!previous); // optimistic

    startTransition(async () => {
      const result = await toggleBookmark(contentType, contentId);
      if (result.error) {
        setBookmarked(previous); // revert on error
      } else if (result.bookmarked !== undefined) {
        setBookmarked(result.bookmarked); // sync with server
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? 'Remove bookmark' : 'Save to bookmarks'}
      aria-pressed={bookmarked}
      className={`inline-flex items-center gap-1.5 transition-colors ${
        bookmarked
          ? 'text-bmj-red'
          : 'text-bmj-tan hover:text-bmj-red'
      } ${isPending ? 'opacity-50' : ''}`}
    >
      <Bookmark
        size={20}
        fill={bookmarked ? 'currentColor' : 'none'}
      />
      <span className="font-label text-micro uppercase tracking-widest">
        {bookmarked ? 'Saved' : 'Save'}
      </span>
    </button>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/components/BookmarkButton.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/content/BookmarkButton.tsx tests/components/BookmarkButton.test.tsx
git commit -m "feat: add BookmarkButton component with optimistic toggle"
```

---

### Task 5: Saved Page in Portal

**Files:**
- Create: `src/app/(auth)/portal/bookmarks/page.tsx`
- Create: `tests/pages/portal-bookmarks.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/pages/portal-bookmarks.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
  })),
}));

jest.mock('@/lib/supabase/bookmarks', () => ({
  getBookmarksForMember: jest.fn().mockResolvedValue([]),
}));

import SavedPage from '@/app/(auth)/portal/bookmarks/page';

describe('Portal Saved Page', () => {
  test('renders empty state when no bookmarks', async () => {
    const page = await SavedPage();
    render(page);
    expect(screen.getByText(/no saved content/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/pages/portal-bookmarks.test.tsx --no-coverage`
Expected: FAIL — module not found

- [ ] **Step 3: Write the saved page**

Create `src/app/(auth)/portal/bookmarks/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getBookmarksForMember } from '@/lib/supabase/bookmarks';
import { LensBadge } from '@/components/brand/LensBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { BookmarkButton } from '@/components/content/BookmarkButton';
import { SEARCH_TYPE_PATHS } from '@/lib/content/search-constants';
import type { Lens, BookmarkedItem } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Saved — Member Portal',
  robots: { index: false, follow: false },
};

const TYPE_LABELS: Record<string, string> = {
  article: 'Articles',
  briefing: 'Briefings',
  dispatch: 'Dispatches',
  handbook: 'Handbooks',
};

function formatBookmarkDate(iso: string): string {
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return 'Saved today';
  if (days === 1) return 'Saved yesterday';
  return `Saved ${days} days ago`;
}

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const bookmarks = await getBookmarksForMember(user.id);

  // Group by content type
  const grouped: Record<string, BookmarkedItem[]> = {};
  for (const bk of bookmarks) {
    if (!grouped[bk.contentType]) grouped[bk.contentType] = [];
    grouped[bk.contentType].push(bk);
  }

  const typeOrder = ['article', 'briefing', 'dispatch', 'handbook'];

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-4">
        <Link
          href="/portal"
          className="font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
        >
          Portal
        </Link>
        <span className="text-bmj-tan/40">/</span>
      </div>

      <h1 className="mb-2 font-display text-4xl text-bmj-white">SAVED</h1>
      <p className="font-body text-sm text-bmj-cream/70">
        Content you bookmarked for later.
      </p>

      <StarDivider className="my-6" />

      {bookmarks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-body text-lg text-bmj-cream">
            No saved content yet.
          </p>
          <p className="mt-2 font-body text-sm text-bmj-tan">
            Bookmark articles and handbooks as you read.{' '}
            <Link href="/articles" className="text-bmj-red">
              Browse articles
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {typeOrder.map((type) => {
            const items = grouped[type];
            if (!items || items.length === 0) return null;
            return (
              <section key={type}>
                <h2 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
                  {TYPE_LABELS[type] ?? type}
                </h2>
                <div className="space-y-1">
                  {items.map((item) => {
                    const href = `${SEARCH_TYPE_PATHS[item.contentType as keyof typeof SEARCH_TYPE_PATHS] ?? '/articles'}/${item.slug}`;
                    return (
                      <div
                        key={item.bookmarkId}
                        className="flex items-start justify-between gap-4 border-b border-bmj-tan/10 py-4"
                      >
                        <Link href={href} className="min-w-0 flex-1 no-underline">
                          <div className="flex items-center gap-2">
                            {item.lens && (
                              <LensBadge lens={item.lens as Lens} />
                            )}
                            {item.accessTier && item.accessTier !== 'free' && (
                              <span className="border border-bmj-amber/40 px-1.5 py-0.5 font-label text-micro uppercase tracking-widest text-bmj-amber">
                                {item.accessTier}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 font-display text-xl text-bmj-white transition-colors hover:text-bmj-red">
                            {item.title}
                          </h3>
                          <p className="mt-1 font-mono text-xs text-bmj-tan">
                            {formatBookmarkDate(item.bookmarkedAt)}
                          </p>
                        </Link>
                        <BookmarkButton
                          contentType={item.contentType}
                          contentId={item.contentId}
                          initialBookmarked={true}
                          isLoggedIn={true}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/pages/portal-bookmarks.test.tsx --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "src/app/(auth)/portal/bookmarks/page.tsx" tests/pages/portal-bookmarks.test.tsx
git commit -m "feat: add Saved page to member portal"
```

---

### Task 6: Add BookmarkButton to Content Detail Pages + Portal Nav

**Files:**
- Modify: `src/app/(public)/articles/[slug]/page.tsx`
- Modify: `src/app/(public)/briefings/[slug]/page.tsx`
- Modify: `src/app/(public)/blog/[slug]/page.tsx`
- Modify: `src/app/(public)/handbooks/[slug]/page.tsx`
- Modify: `src/app/(auth)/portal/page.tsx`

- [ ] **Step 1: Add BookmarkButton to article detail page**

In `src/app/(public)/articles/[slug]/page.tsx`:
- Import `BookmarkButton` from `@/components/content/BookmarkButton`
- Import `isBookmarked` from `@/lib/supabase/bookmarks`
- After `const { hasAccess, user } = await checkContentAccess(article.access_tier);` add:
  ```typescript
  const bookmarked = user ? await isBookmarked(user.id, 'article', article.id) : false;
  ```
- In the header metadata row (the `<div>` with author and date, around line 102), add the BookmarkButton:
  ```tsx
  <BookmarkButton
    contentType="article"
    contentId={article.id}
    initialBookmarked={bookmarked}
    isLoggedIn={!!user}
  />
  ```

- [ ] **Step 2: Add BookmarkButton to briefing, dispatch, and handbook detail pages**

Apply the same pattern to each file:
- `src/app/(public)/briefings/[slug]/page.tsx`: contentType `'briefing'`, use briefing.id
- `src/app/(public)/blog/[slug]/page.tsx`: contentType `'dispatch'`, use dispatch.id
- `src/app/(public)/handbooks/[slug]/page.tsx`: contentType `'handbook'`, use handbook.id

Each page already calls `checkContentAccess` which returns `user`. Add `isBookmarked` check and `<BookmarkButton>` in the header area.

- [ ] **Step 3: Add "Saved" link to portal dashboard**

In `src/app/(auth)/portal/page.tsx`:
- Import `getBookmarkCount` from `@/lib/supabase/bookmarks`
- After `const latestArticles = await getLatestArticles(5);` add:
  ```typescript
  const bookmarkCount = await getBookmarkCount(user.id);
  ```
- In the quick links section (line 186), add before the "Settings" link:
  ```tsx
  <Link
    href="/portal/bookmarks"
    className="border border-bmj-tan/30 px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream no-underline transition-colors hover:border-bmj-red hover:text-bmj-white"
  >
    Saved{bookmarkCount > 0 ? ` (${bookmarkCount})` : ''}
  </Link>
  ```

- [ ] **Step 4: Run type check and tests**

Run: `npx tsc --noEmit`
Expected: Clean

Run: `npx jest --no-coverage`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add "src/app/(public)/articles/[slug]/page.tsx" "src/app/(public)/briefings/[slug]/page.tsx" "src/app/(public)/blog/[slug]/page.tsx" "src/app/(public)/handbooks/[slug]/page.tsx" "src/app/(auth)/portal/page.tsx"
git commit -m "feat: add BookmarkButton to detail pages and Saved link to portal"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: Clean

- [ ] **Step 2: Full test suite**

Run: `npx jest --no-coverage`
Expected: All pass

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: No errors
