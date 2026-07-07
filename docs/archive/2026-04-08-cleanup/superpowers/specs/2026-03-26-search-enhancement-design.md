# Search Enhancement Design

**Date:** 2026-03-26
**Status:** Approved
**Scope:** PostgreSQL full-text search with relevance ranking + UI filters on /search page

## Context

The current search uses PostgreSQL `ILIKE` substring matching on title/excerpt fields across
4 content types (articles, briefings, dispatches, handbooks). Results are sorted by publication
date only. There are no user-facing filters for lens, content type, or sort order. The Cmd+K
dialog and /search page share the same `/api/search` endpoint.

This upgrade adds real relevance ranking via PostgreSQL FTS, plus lens/type/sort filters on the
/search page. The Cmd+K dialog stays as a fast jump-to tool (no filters) but benefits from
relevance-ranked results.

## Design Decisions

- **Show all content, gate on click.** Free users see premium results in search (with tier badge).
  Access enforcement stays on the detail page. This maximizes discovery and conversion.
- **Filters on /search page only.** Cmd+K stays minimal (query + results). Filters would
  overcrowd a modal.
- **Server Component filter model.** Filters are URL query params, page is server-rendered.
  No client-side filter state needed.
- **Fallback to ILIKE.** If the FTS query can't be parsed (too short, special chars) or the
  RPC function doesn't exist yet (pre-migration), fall back to current ILIKE matching. This
  makes deployment safe.

## 1. Database Layer

### Migration: FTS columns and indexes

Add to each of the 4 searchable tables (articles, briefings, dispatches, handbooks):

1. **`search_vector tsvector`** column — `GENERATED ALWAYS AS ... STORED`
   - Articles: `setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')`
   - Briefings: `setweight(to_tsvector('english', coalesce(title, '')), 'A')` (no excerpt column)
   - Dispatches: `setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')`
   - Handbooks: `setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(description, '')), 'B')`

2. **GIN index** on `search_vector` for each table

Auto-populates for existing rows. Stays current on future inserts/updates (no triggers needed
for generated columns).

### RPC function: `search_content`

```sql
search_content(
  query        text,
  filter_lens  text[]   DEFAULT NULL,
  filter_types text[]   DEFAULT NULL,
  sort_by      text     DEFAULT 'relevance',
  result_limit int      DEFAULT 30
)
```

**Logic:**
1. Convert `query` to tsquery via `websearch_to_tsquery('english', query)`
2. Query all 4 tables in a `UNION ALL`:
   - Match: `search_vector @@ tsquery`
   - Visibility: `status IN ('published', 'scheduled') AND published_at <= now()`
   - Lens filter: `lens = ANY(filter_lens)` when provided (briefings have no lens column —
     when a lens filter is active, briefings are excluded from results)
   - Type filter: include/exclude tables based on `filter_types`
3. Score: `ts_rank(search_vector, tsquery)` as `relevance`
4. Sort: by `relevance DESC` (default) or `published_at DESC` (when `sort_by = 'date'`)
5. Limit: `result_limit`

**Returns:** `id, title, slug, excerpt, lens, access_tier, published_at, content_type, relevance`

`websearch_to_tsquery` handles phrases (`"black economics"`), OR terms, and negation natively.

## 2. API Route

**`GET /api/search`** — updated parameters:

| Param   | Type   | Default     | Description |
|---------|--------|-------------|-------------|
| `q`     | string | required    | Search query (min 2 chars) |
| `lens`  | string | —           | Comma-separated lens filter (e.g. `health,politics`) |
| `type`  | string | —           | Comma-separated content type filter (e.g. `article,briefing`) |
| `sort`  | string | `relevance` | `relevance` or `date` |
| `limit` | number | 30          | Max results (capped at 50) |

**Validation:** Zod schema. Invalid lens/type values silently stripped via `.catch()`.
Rate limiting stays at 30 req/min.

**Response shape:**
```typescript
{
  results: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    lens: Lens | null;
    access_tier: AccessTier;
    published_at: string;
    content_type: 'article' | 'briefing' | 'dispatch' | 'handbook';
    relevance: number;
  }>;
  query: string;
}
```

**Fallback:** If `supabase.rpc('search_content', ...)` fails (function missing or tsquery
parse error), fall back to the current `searchContent()` ILIKE function. Log the error
server-side but don't surface it to the user.

The Cmd+K `SearchDialog` continues calling the same endpoint without filter params — it
just gets relevance-ranked results instead of date-sorted.

## 3. Search Page UI

### Filter bar

Horizontal row below the search input, above results:

- **Lens pills:** Health, Politics, Culture, Entertainment, Business. Toggle buttons, multiple
  selectable. Styled like `LensFilterTabs` pattern on `/articles`.
- **Content type chips:** Article, Briefing, Dispatch, Handbook. Same toggle behavior.
- **Sort dropdown:** "Relevance" (default) | "Newest first". `<select>` with BMJ brand styling.
- **Clear all:** Text link, visible only when filters are active.

### Interaction model

- Filters update URL query params: `/search?q=term&lens=health,politics&type=article&sort=relevance`
- Server Component — filter changes trigger page navigation (form action or Link)
- Empty filter params = no restriction (show all)
- Filter state preserved across searches (params persist in URL)

### Result cards

Keep existing card design. Add:
- **Relevance indicator:** `font-mono text-xs text-bmj-tan` — "Strong match" (relevance > 0.3),
  "Partial match" (relevance > 0.1), omitted for lower scores
- **Access tier badge:** Small "BASIC" or "PREMIUM" label when `access_tier !== 'free'`

### No-results state

Existing "No results found" message. If filters are active, add: "Try removing some filters
or broadening your search."

## 4. Files to Create/Modify

### New files
- `supabase/migrations/20260327000000_add-fts-search.sql` — FTS columns, indexes, RPC function
- `src/components/search/SearchFilters.tsx` — Filter bar component (lens pills, type chips, sort, clear)

### Modified files
- `src/app/api/search/route.ts` — Accept filter params, call RPC, add fallback
- `src/app/(public)/search/page.tsx` — Add filter bar, pass params, display enhanced results
- `src/lib/supabase/queries.ts` — Add `searchContentFTS()` function wrapping the RPC call
- `src/lib/content/search-constants.ts` — Add sort options, filter labels

### Test files
- `tests/api/search.test.ts` — API route with filter/sort params, validation, fallback
- `tests/components/SearchFilters.test.tsx` — Filter bar rendering and interaction
- `tests/pages/search.test.tsx` — Full page with filters, results, no-results state

## 5. Verification

1. `npx tsc --noEmit` — no type errors
2. `npm test` — all tests pass (existing + new)
3. `npm run build` — clean production build
4. Manual: search for a known article title, verify it ranks higher than excerpt-only matches
5. Manual: apply lens filter, verify results scoped correctly
6. Manual: toggle sort between relevance and date, verify order changes
7. Manual: Cmd+K still works without filters, results now relevance-ranked
