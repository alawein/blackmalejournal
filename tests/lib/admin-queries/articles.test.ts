import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import { mockArticle } from '../../helpers/fixtures';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

// Import AFTER mocks
import {
  getAllArticles,
  getArticleById,
  getArticlesByIds,
  createArticle,
  updateArticle,
  deleteArticle,
  bulkUpdateArticleStatuses,
} from '@/lib/supabase/admin-queries/articles';

// ── Helpers ──────────────────────────────────────────────────────────────────

function resetClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  mockClient = createMockSupabaseClient(overrides);
}

function setError(message = 'test error') {
  resetClient({ error: { message } });
}

function setData(data: unknown) {
  resetClient({ data });
}

const mockDraftArticle = {
  ...mockArticle,
  status: 'draft' as const,
  published_at: '',
};

const mockPublishedArticle = {
  ...mockArticle,
  status: 'published' as const,
};

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

// ── getAllArticles ────────────────────────────────────────────────────────────

describe('getAllArticles', () => {
  it('returns articles on success', async () => {
    setData([mockArticle]);
    const result = await getAllArticles();
    expect(result).toEqual([mockArticle]);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
  });

  it('orders by created_at DESC', async () => {
    setData([]);
    await getAllArticles();
    expect(mockClient._queryChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applies default limit of 50', async () => {
    setData([]);
    await getAllArticles();
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(0, 49);
  });

  it('applies status filter', async () => {
    setData([mockArticle]);
    await getAllArticles({ status: 'draft' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'draft');
  });

  it('applies lens filter', async () => {
    setData([mockArticle]);
    await getAllArticles({ lens: 'culture' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'culture');
  });

  it('applies search query filter', async () => {
    setData([mockArticle]);
    await getAllArticles({ query: 'discipline' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('title.ilike.%discipline%'),
    );
  });

  it('applies custom limit and offset', async () => {
    setData([]);
    await getAllArticles({ limit: 10, offset: 20 });
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(20, 29);
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllArticles();
    expect(result).toEqual([]);
  });

  it('does not filter by status when none provided', async () => {
    setData([]);
    await getAllArticles();
    expect(mockClient._queryChain.eq).not.toHaveBeenCalled();
  });
});

// ── getArticleById ───────────────────────────────────────────────────────────

describe('getArticleById', () => {
  it('returns article on success', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const result = await getArticleById('art-1');
    expect(result).toEqual(mockArticle);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'art-1');
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getArticleById('nonexistent');
    expect(result).toBeNull();
  });
});

// ── getArticlesByIds ─────────────────────────────────────────────────────────

describe('getArticlesByIds', () => {
  it('normalizes and sorts IDs', async () => {
    const second = { ...mockArticle, id: 'art-2', title: 'Second' };
    setData([mockArticle, second]);

    const result = await getArticlesByIds([' art-2 ', 'art-1', 'art-2', '']);

    expect(mockClient._queryChain.in).toHaveBeenCalledWith('id', ['art-2', 'art-1']);
    expect(result.map((row) => row.id)).toEqual(['art-2', 'art-1']);
  });

  it('returns empty array for empty IDs', async () => {
    const result = await getArticlesByIds([]);
    expect(result).toEqual([]);
  });

  it('returns empty array on error', async () => {
    setError('lookup failed');
    const result = await getArticlesByIds(['art-1']);
    expect(result).toEqual([]);
  });
});

// ── createArticle ────────────────────────────────────────────────────────────

describe('createArticle', () => {
  const baseData = {
    title: 'Test Article',
    slug: 'test-article',
    lens: 'health' as const,
    tags: ['test'],
    excerpt: 'Test excerpt',
    body: 'Test body',
    access_tier: 'free' as const,
    status: 'draft' as const,
    featured: false,
    author: 'The Chairman',
  };

  it('inserts article with correct data', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const result = await createArticle(baseData);
    expect(result).toEqual(mockArticle);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expect(mockClient._queryChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Article',
        slug: 'test-article',
        lens: 'health',
        status: 'draft',
        cover_image: null,
        published_at: null,
      }),
    );
  });

  it('auto-sets published_at when status is published and no date provided', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const before = new Date().toISOString();
    await createArticle({ ...baseData, status: 'published' });
    const insertCall = mockClient._queryChain.insert.mock.calls[0][0];
    expect(insertCall.published_at).toBeDefined();
    expect(new Date(insertCall.published_at).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
  });

  it('uses provided published_at when given', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const date = '2026-06-01T00:00:00Z';
    await createArticle({ ...baseData, status: 'published', published_at: date });
    const insertCall = mockClient._queryChain.insert.mock.calls[0][0];
    expect(insertCall.published_at).toBe(date);
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'insert failed' } });
    const result = await createArticle(baseData);
    expect(result).toBeNull();
  });

  it('chains select and single after insert', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    await createArticle(baseData);
    expect(mockClient._queryChain.insert).toHaveBeenCalled();
    expect(mockClient._queryChain.select).toHaveBeenCalledWith('*');
    expect(mockClient._queryChain.single).toHaveBeenCalled();
  });
});

// ── updateArticle ────────────────────────────────────────────────────────────

describe('updateArticle', () => {
  it('updates article by id', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const result = await updateArticle('art-1', { title: 'Updated Title' });
    expect(result).toEqual(mockArticle);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expect(mockClient._queryChain.update).toHaveBeenCalledWith({ title: 'Updated Title' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'art-1');
  });

  it('auto-sets published_at when status changes to published', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const before = new Date().toISOString();
    await updateArticle('art-1', { status: 'published' });
    const updateCall = mockClient._queryChain.update.mock.calls[0][0];
    expect(updateCall.published_at).toBeDefined();
    expect(new Date(updateCall.published_at).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
  });

  it('does not override explicit published_at', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const date = '2026-06-01T00:00:00Z';
    await updateArticle('art-1', { status: 'published', published_at: date });
    const updateCall = mockClient._queryChain.update.mock.calls[0][0];
    expect(updateCall.published_at).toBe(date);
  });

  it('does not set published_at for non-publish status changes', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    await updateArticle('art-1', { status: 'draft' });
    const updateCall = mockClient._queryChain.update.mock.calls[0][0];
    expect(updateCall.published_at).toBeUndefined();
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'update failed' } });
    const result = await updateArticle('art-1', { title: 'x' });
    expect(result).toBeNull();
  });
});

// ── deleteArticle ────────────────────────────────────────────────────────────

describe('deleteArticle', () => {
  it('deletes article by id and returns true', async () => {
    resetClient();
    const result = await deleteArticle('art-1');
    expect(result).toBe(true);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expect(mockClient._queryChain.delete).toHaveBeenCalled();
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'art-1');
  });

  it('returns false on error', async () => {
    setError('delete failed');
    const result = await deleteArticle('art-1');
    expect(result).toBe(false);
  });
});

// ── bulkUpdateArticleStatuses ────────────────────────────────────────────────

describe('bulkUpdateArticleStatuses', () => {
  it('returns empty result for empty IDs array', async () => {
    const result = await bulkUpdateArticleStatuses([], 'published');
    expect(result).toEqual({ previous: [], updated: [] });
  });

  it('updates selected article statuses and preserves per-row publish timestamps', async () => {
    resetClient();

    const previous = [
      { ...mockDraftArticle, id: 'art-1', title: 'Draft One' },
      { ...mockPublishedArticle, id: 'art-2', title: 'Draft Two' },
    ];
    const updated = [
      { ...mockPublishedArticle, id: 'art-1', title: 'Draft One' },
      { ...mockPublishedArticle, id: 'art-2', title: 'Draft Two' },
    ];

    setFromSequence(mockClient, [
      { table: 'articles', data: previous },
      { table: 'articles', data: null },
      { table: 'articles', data: null },
      { table: 'articles', data: updated },
    ]);

    const result = await bulkUpdateArticleStatuses(['art-1', 'art-2'], 'published');

    expect(result).toEqual({ previous, updated });
  });

  it('returns null when status update fails', async () => {
    resetClient();

    const previous = [{ ...mockDraftArticle, id: 'art-1' }];

    setFromSequence(mockClient, [
      { table: 'articles', data: previous },
      { table: 'articles', error: { message: 'update failed' } },
    ]);

    const result = await bulkUpdateArticleStatuses(['art-1'], 'review');
    expect(result).toBeNull();
  });

  it('returns null when published_at patch fails', async () => {
    resetClient();

    const previous = [{ ...mockDraftArticle, id: 'art-1', published_at: '' }];

    setFromSequence(mockClient, [
      { table: 'articles', data: previous },
      { table: 'articles', data: null },
      { table: 'articles', error: { message: 'patch failed' } },
    ]);

    const result = await bulkUpdateArticleStatuses(['art-1'], 'published');
    expect(result).toBeNull();
  });

  it('skips published_at patch when all rows already have published_at', async () => {
    resetClient();

    const previous = [{ ...mockPublishedArticle, id: 'art-1', published_at: '2026-03-01T00:00:00Z' }];
    const updated = [{ ...mockPublishedArticle, id: 'art-1' }];

    // Only 3 from() calls: fetch previous, update status, fetch updated
    // (no published_at patch needed)
    setFromSequence(mockClient, [
      { table: 'articles', data: previous },
      { table: 'articles', data: null },
      { table: 'articles', data: updated },
    ]);

    const result = await bulkUpdateArticleStatuses(['art-1'], 'published');
    expect(result).toEqual({ previous, updated });
  });
});
