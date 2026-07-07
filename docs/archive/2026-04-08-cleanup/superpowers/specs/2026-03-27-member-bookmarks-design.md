# Member Bookmarks Design

**Date:** 2026-03-27
**Status:** Approved
**Scope:** Database-backed bookmarks for all logged-in members, with toggle action, portal Saved page, and BookmarkButton on content detail pages

## Context

The member portal (`/portal`) is functional (auth, tier display, Stripe billing, profile) but has
no engagement features. Members cannot save content for later. There are no member-related tables
beyond `members`. This feature adds bookmarks as the first engagement primitive — it persists
across devices, gives the operator engagement signal, and encourages free users to stay active.

## Design Decisions

- **All members can bookmark.** Including free tier. Low friction encourages engagement and
  eventual upgrade. Bookmarked content still respects access tiers on the detail page.
- **Database-backed, not localStorage.** Persists across devices, visible to admin for
  engagement analytics later.
- **Detail pages only.** Bookmark button appears on article/briefing/dispatch/handbook detail
  pages, not on listing cards (too noisy).
- **Optimistic UI.** Toggle state immediately on click, revert on error. No loading spinners.

## 1. Database

### Migration: `member_bookmarks` table

```sql
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

-- Fast portal lookups
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

## 2. Server Actions & Query Functions

### Toggle action

`src/app/(auth)/portal/bookmarks/actions.ts`:
- `toggleBookmark(contentType: SearchContentType, contentId: string)` — server action
- Requires authenticated session (get user from Supabase auth)
- Check if bookmark exists: `SELECT id FROM member_bookmarks WHERE member_id = ? AND content_type = ? AND content_id = ?`
- If exists: `DELETE` → return `{ bookmarked: false }`
- If not: `INSERT` → return `{ bookmarked: true }`
- On error: return `{ error: string }`

### Query functions

Add to `src/lib/supabase/queries.ts`:

**`getBookmarksForMember(memberId: string): Promise<BookmarkedItem[]>`**
- Query `member_bookmarks` for the member, ordered by `created_at DESC`
- For each bookmark, join against the content table to get title, slug, lens, access_tier, published_at
- Implementation: 4 parallel queries (one per content type), merge and sort by bookmark created_at
- Skip bookmarks where the content no longer exists (LEFT JOIN, filter nulls)
- Return type:
  ```typescript
  type BookmarkedItem = {
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

**`isBookmarked(memberId: string, contentType: string, contentId: string): Promise<boolean>`**
- Single query: `SELECT id FROM member_bookmarks WHERE member_id = ? AND content_type = ? AND content_id = ? LIMIT 1`
- Returns true if row exists

**`getBookmarkCount(memberId: string): Promise<number>`**
- `SELECT count(*) FROM member_bookmarks WHERE member_id = ?`
- Used by portal nav for badge count

## 3. UI Components & Pages

### BookmarkButton

`src/components/content/BookmarkButton.tsx`:
- Client component (`'use client'`)
- Props: `contentType: string`, `contentId: string`, `initialBookmarked: boolean`, `isLoggedIn: boolean`
- Renders nothing when `isLoggedIn` is false
- Uses `Bookmark` icon from lucide-react — `fill="none"` when not bookmarked, `fill="currentColor"` when bookmarked
- Styled: `text-bmj-tan hover:text-bmj-red` (inactive), `text-bmj-red` (active)
- On click: optimistically toggle state, call `toggleBookmark` server action, revert on error
- Accessible: `aria-label="Save to bookmarks"` / `aria-label="Remove bookmark"`, `aria-pressed`

### Placement on detail pages

Add `<BookmarkButton>` to these pages, next to the title area:
- `src/app/(public)/articles/[slug]/page.tsx`
- `src/app/(public)/briefings/[slug]/page.tsx`
- `src/app/(public)/blog/[slug]/page.tsx` (dispatches)
- `src/app/(public)/handbooks/[slug]/page.tsx`

Each page passes:
- `contentType` and `contentId` from the fetched content
- `initialBookmarked` from `isBookmarked()` (only called if user is logged in)
- `isLoggedIn` from session check

### Saved page

`src/app/(auth)/portal/bookmarks/page.tsx`:
- Server Component, requires auth (portal route group handles this)
- Calls `getBookmarksForMember(memberId)`
- Groups results by content type with section headers: "Articles", "Briefings", "Dispatches", "Handbooks"
- Each item: title as link (to detail page), lens badge (if applicable), "Saved X days ago" timestamp, remove button
- Remove button calls `toggleBookmark` to delete
- Empty state: "No saved content yet. Bookmark articles and handbooks as you read." with link to `/articles`

### Portal dashboard update

`src/app/(auth)/portal/page.tsx`:
- Add "Saved" to the quick navigation links section
- Show bookmark count badge next to "Saved" if count > 0

## 4. Files to Create/Modify

### New files
- `supabase/migrations/20260327100000_create-member-bookmarks.sql`
- `src/app/(auth)/portal/bookmarks/page.tsx`
- `src/app/(auth)/portal/bookmarks/actions.ts`
- `src/components/content/BookmarkButton.tsx`
- `tests/lib/bookmarks.test.ts`
- `tests/components/BookmarkButton.test.tsx`
- `tests/pages/portal-bookmarks.test.tsx`
- `tests/portal/bookmark-actions.test.ts`

### Modified files
- `src/lib/supabase/queries.ts` — add `getBookmarksForMember`, `isBookmarked`, `getBookmarkCount`
- `src/lib/supabase/types.ts` — add `BookmarkedItem` type
- `src/app/(public)/articles/[slug]/page.tsx` — add BookmarkButton
- `src/app/(public)/briefings/[slug]/page.tsx` — add BookmarkButton
- `src/app/(public)/blog/[slug]/page.tsx` — add BookmarkButton
- `src/app/(public)/handbooks/[slug]/page.tsx` — add BookmarkButton
- `src/app/(auth)/portal/page.tsx` — add "Saved" to quick nav

## 5. Verification

1. `npx tsc --noEmit` — no type errors
2. `npm test` — all tests pass (existing + new)
3. `npm run build` — clean production build
4. Manual: log in, visit an article, click bookmark icon — verify it fills
5. Manual: visit /portal/bookmarks — verify the article appears
6. Manual: click bookmark again — verify it unfills and disappears from saved page
7. Manual: log out — verify bookmark button is hidden
