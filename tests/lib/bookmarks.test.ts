// tests/lib/bookmarks.test.ts
import {
  createMockSupabaseClient,
  setFromSequence,
  setFromByTable,
  type MockSupabaseClient,
} from '../helpers/supabase-mock';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockClient)),
}));

import {
  isBookmarked,
  getBookmarkCount,
  getBookmarksForMember,
} from '@/lib/supabase/bookmarks';

function resetClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  mockClient = createMockSupabaseClient(overrides);
}

beforeEach(() => {
  jest.clearAllMocks();
  resetClient();
});

// ── isBookmarked ──────────────────────────────────────────────────────────────

describe('isBookmarked', () => {
  it('returns true when a matching row exists', async () => {
    resetClient({ data: [{ id: 'bm-1' }] });
    const result = await isBookmarked('mem-1', 'article', 'art-1');
    expect(result).toBe(true);
    expect(mockClient.from).toHaveBeenCalledWith('member_bookmarks');
  });

  it('returns false when no rows are found', async () => {
    resetClient({ data: [] });
    const result = await isBookmarked('mem-1', 'article', 'art-999');
    expect(result).toBe(false);
  });

  it('returns false on error', async () => {
    resetClient({ error: { message: 'DB error' } });
    const result = await isBookmarked('mem-1', 'article', 'art-1');
    expect(result).toBe(false);
  });
});

// ── getBookmarkCount ──────────────────────────────────────────────────────────

describe('getBookmarkCount', () => {
  it('returns the count from the query', async () => {
    // The count query uses { count: 'exact', head: true } and resolves with { count, error }
    mockClient = createMockSupabaseClient();
    mockClient._queryChain.then = jest.fn((resolve) =>
      resolve({ data: null, error: null, count: 7 }),
    );
    const result = await getBookmarkCount('mem-1');
    expect(result).toBe(7);
  });

  it('returns 0 when count is null', async () => {
    mockClient = createMockSupabaseClient();
    mockClient._queryChain.then = jest.fn((resolve) =>
      resolve({ data: null, error: null, count: null }),
    );
    const result = await getBookmarkCount('mem-1');
    expect(result).toBe(0);
  });

  it('returns 0 on error', async () => {
    mockClient = createMockSupabaseClient();
    mockClient._queryChain.then = jest.fn((resolve) =>
      resolve({ data: null, error: { message: 'count failed' }, count: null }),
    );
    const result = await getBookmarkCount('mem-1');
    expect(result).toBe(0);
  });
});

// ── getBookmarksForMember ─────────────────────────────────────────────────────

describe('getBookmarksForMember', () => {
  it('returns empty array when member has no bookmarks', async () => {
    resetClient({ data: [] });
    const result = await getBookmarksForMember('mem-1');
    expect(result).toEqual([]);
  });

  it('returns empty array on error fetching bookmarks', async () => {
    resetClient({ error: { message: 'DB error' } });
    const result = await getBookmarksForMember('mem-1');
    expect(result).toEqual([]);
  });

  it('returns BookmarkedItem records for article bookmarks', async () => {
    const rawBookmarks = [
      { id: 'bm-1', content_type: 'article', content_id: 'art-1', created_at: '2026-03-20T00:00:00Z' },
    ];
    const articles = [
      { id: 'art-1', title: 'Test Article', slug: 'test-article', lens: 'health', access_tier: 'free', published_at: '2026-03-01T00:00:00Z' },
    ];

    setFromSequence(mockClient, [
      { table: 'member_bookmarks', data: rawBookmarks },
      { table: 'articles', data: articles },
    ]);

    const result = await getBookmarksForMember('mem-1');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      bookmarkId: 'bm-1',
      contentType: 'article',
      contentId: 'art-1',
      title: 'Test Article',
      slug: 'test-article',
      lens: 'health',
      accessTier: 'free',
      publishedAt: '2026-03-01T00:00:00Z',
      bookmarkedAt: '2026-03-20T00:00:00Z',
    });
  });

  it('returns BookmarkedItem records for briefing bookmarks (no lens)', async () => {
    const rawBookmarks = [
      { id: 'bm-2', content_type: 'briefing', content_id: 'br-1', created_at: '2026-03-18T00:00:00Z' },
    ];
    const briefings = [
      { id: 'br-1', title: 'Weekend Briefing No. 001', slug: 'weekend-briefing-001', access_tier: 'free', published_at: '2026-03-01T00:00:00Z' },
    ];

    setFromSequence(mockClient, [
      { table: 'member_bookmarks', data: rawBookmarks },
      { table: 'briefings', data: briefings },
    ]);

    const result = await getBookmarksForMember('mem-1');
    expect(result).toHaveLength(1);
    expect(result[0].contentType).toBe('briefing');
    expect(result[0].lens).toBeUndefined();
    expect(result[0].accessTier).toBe('free');
  });

  it('skips orphaned bookmarks where content no longer exists', async () => {
    const rawBookmarks = [
      { id: 'bm-3', content_type: 'article', content_id: 'art-deleted', created_at: '2026-03-10T00:00:00Z' },
    ];
    // articles query returns empty — content was deleted
    setFromSequence(mockClient, [
      { table: 'member_bookmarks', data: rawBookmarks },
      { table: 'articles', data: [] },
    ]);

    const result = await getBookmarksForMember('mem-1');
    expect(result).toEqual([]);
  });

  it('handles mixed content types in a single call', async () => {
    const rawBookmarks = [
      { id: 'bm-10', content_type: 'article', content_id: 'art-1', created_at: '2026-03-20T00:00:00Z' },
      { id: 'bm-11', content_type: 'handbook', content_id: 'hb-1', created_at: '2026-03-15T00:00:00Z' },
    ];
    const articles = [
      { id: 'art-1', title: 'Test Article', slug: 'test-article', lens: 'health', access_tier: 'free', published_at: '2026-03-01T00:00:00Z' },
    ];
    const handbooks = [
      { id: 'hb-1', title: 'The Discipline Handbook', slug: 'discipline-handbook', lens: 'health', access_tier: 'basic', published_at: '2026-03-10T00:00:00Z' },
    ];

    setFromSequence(mockClient, [
      { table: 'member_bookmarks', data: rawBookmarks },
      { table: 'articles', data: articles },
      { table: 'handbooks', data: handbooks },
    ]);

    const result = await getBookmarksForMember('mem-1');
    expect(result).toHaveLength(2);
    expect(result[0].contentType).toBe('article');
    expect(result[1].contentType).toBe('handbook');
  });
});
