import { createMockSupabaseClient, type MockSupabaseClient } from '../helpers/supabase-mock';
import {
  mockArticle,
  mockArticleCulture,
  mockBriefing,
  mockBriefingListItem,
  mockMember,
  mockMemberPremium,
  mockCourse,
  mockDispatch,
  mockHandbook,
} from '../helpers/fixtures';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => {
    // Return the current mockClient (reassigned per-test when needed)
    return Promise.resolve(mockClient);
  }),
}));

// Suppress console.error noise from expected error paths
jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getArticles,
  getArticlesForListing,
  getArticleTagFacets,
  getArticleBySlug,
  getFeaturedArticles,
  getLatestArticles,
  getBriefings,
  getBriefingsForSitemap,
  getBriefingBySlug,
  getLatestBriefing,
  getBriefingByIssue,
  getMemberById,
  getMemberByEmail,
  updateMemberTier,
  getCourses,
  getCourseBySlug,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  submitContactForm,
  getDispatches,
  getDispatchesForListing,
  getDispatchBySlug,
  getHandbooks,
  getHandbooksForSitemap,
  getHandbookBySlug,
} from '@/lib/supabase/queries';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Reset mock client to a fresh success state before each test */
function resetClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  mockClient = createMockSupabaseClient(overrides);
}

/** Swap the mock chain to return an error for the current client */
function setError(message = 'test error') {
  resetClient({ error: { message } });
}

/** Swap the mock chain to return specific data */
function setData(data: unknown) {
  resetClient({ data });
}

function expectPublicVisibilityApplied() {
  expect(mockClient._queryChain.in).toHaveBeenCalledWith('status', [
    'published',
    'scheduled',
  ]);
  expect(mockClient._queryChain.lte).toHaveBeenCalledWith(
    'published_at',
    expect.any(String),
  );
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Re-apply the console.error spy after clearAllMocks wipes it
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

// ── Articles ─────────────────────────────────────────────────────────────────

describe('getArticles', () => {
  it('returns articles on success', async () => {
    setData([mockArticle]);
    const result = await getArticles();
    expect(result).toEqual([mockArticle]);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getArticles();
    expect(result).toEqual([]);
  });

  it('applies lens filter', async () => {
    setData([mockArticleCulture]);
    await getArticles({ lens: 'culture' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'culture');
  });

  it('applies tag filter', async () => {
    setData([mockArticle]);
    await getArticles({ tag: 'discipline' });
    expect(mockClient._queryChain.contains).toHaveBeenCalledWith('tags', ['discipline']);
  });

  it('applies tier filter', async () => {
    setData([mockArticle]);
    await getArticles({ tier: 'free' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('access_tier', 'free');
  });

  it('calls order and range with defaults', async () => {
    setData([]);
    await getArticles();
    expect(mockClient._queryChain.order).toHaveBeenCalledWith('published_at', { ascending: false });
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(0, 19);
  });
});

describe('getArticlesForListing', () => {
  it('returns rows on success', async () => {
    setData([mockArticle]);
    const result = await getArticlesForListing();
    expect(result).toEqual([mockArticle]);
    expect(mockClient.from).toHaveBeenCalledWith('articles');
    expect(mockClient._queryChain.select).toHaveBeenCalledWith(
      'id,title,slug,lens,tags,excerpt,featured,access_tier,cover_image,published_at,author',
    );
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getArticlesForListing();
    expect(result).toEqual([]);
  });
});

describe('getArticleTagFacets', () => {
  it('returns tag rows', async () => {
    setData([{ tags: ['alpha'] }, { tags: ['beta'] }]);
    const result = await getArticleTagFacets({ limit: 50 });
    expect(result).toEqual([{ tags: ['alpha'] }, { tags: ['beta'] }]);
    expect(mockClient._queryChain.select).toHaveBeenCalledWith('tags');
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(0, 49);
    expectPublicVisibilityApplied();
  });

  it('applies lens filter', async () => {
    setData([]);
    await getArticleTagFacets({ lens: 'culture' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'culture');
  });
});

describe('getArticleBySlug', () => {
  it('returns article on success', async () => {
    resetClient({ data: mockArticle });
    mockClient._queryChain.single.mockResolvedValue({ data: mockArticle, error: null });
    const result = await getArticleBySlug('discipline-morning-routines');
    expect(result).toEqual(mockArticle);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('slug', 'discipline-morning-routines');
    expectPublicVisibilityApplied();
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getArticleBySlug('nonexistent');
    expect(result).toBeNull();
  });
});

describe('getFeaturedArticles', () => {
  it('returns featured articles', async () => {
    setData([mockArticle]);
    const result = await getFeaturedArticles();
    expect(result).toEqual([mockArticle]);
    expect(mockClient._queryChain.select).toHaveBeenCalledWith(
      'id,title,slug,lens,tags,excerpt,featured,access_tier,cover_image,published_at,author',
    );
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('featured', true);
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getFeaturedArticles();
    expect(result).toEqual([]);
  });

  it('passes custom limit', async () => {
    setData([]);
    await getFeaturedArticles(5);
    expect(mockClient._queryChain.limit).toHaveBeenCalledWith(5);
  });
});

describe('getLatestArticles', () => {
  it('returns latest articles', async () => {
    setData([mockArticle]);
    const result = await getLatestArticles();
    expect(result).toEqual([mockArticle]);
    expect(mockClient._queryChain.select).toHaveBeenCalledWith(
      'id,title,slug,lens,tags,excerpt,featured,access_tier,cover_image,published_at,author',
    );
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getLatestArticles();
    expect(result).toEqual([]);
  });
});

// ── Briefings ────────────────────────────────────────────────────────────────

describe('getBriefings', () => {
  it('returns briefings on success', async () => {
    setData([mockBriefingListItem]);
    const result = await getBriefings();
    expect(result).toEqual([mockBriefingListItem]);
    expect(mockClient.from).toHaveBeenCalledWith('briefings');
    expect(mockClient._queryChain.select).toHaveBeenCalledWith(
      'id,issue_number,slug,title,lead_kicker,access_tier,status,cover_image,published_at,created_at',
    );
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getBriefings();
    expect(result).toEqual([]);
  });
});

describe('getBriefingsForSitemap', () => {
  it('returns slug rows only', async () => {
    setData([{ slug: 'b-1', published_at: '2026-01-01' }]);
    const result = await getBriefingsForSitemap({ limit: 10 });
    expect(result).toEqual([{ slug: 'b-1', published_at: '2026-01-01' }]);
    expect(mockClient._queryChain.select).toHaveBeenCalledWith('slug,published_at');
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getBriefingsForSitemap();
    expect(result).toEqual([]);
  });
});

describe('getBriefingBySlug', () => {
  it('returns briefing on success', async () => {
    resetClient({ data: mockBriefing });
    mockClient._queryChain.single.mockResolvedValue({ data: mockBriefing, error: null });
    const result = await getBriefingBySlug('weekend-briefing-001');
    expect(result).toEqual(mockBriefing);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('slug', 'weekend-briefing-001');
    expectPublicVisibilityApplied();
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getBriefingBySlug('nonexistent');
    expect(result).toBeNull();
  });
});

describe('getLatestBriefing', () => {
  it('returns latest briefing', async () => {
    resetClient({ data: mockBriefingListItem });
    mockClient._queryChain.single.mockResolvedValue({ data: mockBriefingListItem, error: null });
    const result = await getLatestBriefing();
    expect(result).toEqual(mockBriefingListItem);
    expect(mockClient._queryChain.select).toHaveBeenCalledWith(
      'id,issue_number,slug,title,lead_kicker,access_tier,status,cover_image,published_at,created_at',
    );
    expectPublicVisibilityApplied();
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getLatestBriefing();
    expect(result).toBeNull();
  });
});

describe('getBriefingByIssue', () => {
  it('returns briefing by issue number', async () => {
    resetClient({ data: mockBriefing });
    mockClient._queryChain.single.mockResolvedValue({ data: mockBriefing, error: null });
    const result = await getBriefingByIssue(1);
    expect(result).toEqual(mockBriefing);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('issue_number', 1);
    expectPublicVisibilityApplied();
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getBriefingByIssue(999);
    expect(result).toBeNull();
  });
});

// ── Members ──────────────────────────────────────────────────────────────────

describe('getMemberById', () => {
  it('returns member on success', async () => {
    resetClient({ data: mockMember });
    mockClient._queryChain.single.mockResolvedValue({ data: mockMember, error: null });
    const result = await getMemberById('mem-1');
    expect(result).toEqual(mockMember);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'mem-1');
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getMemberById('nonexistent');
    expect(result).toBeNull();
  });
});

describe('getMemberByEmail', () => {
  it('returns member on success', async () => {
    resetClient({ data: mockMember });
    mockClient._queryChain.single.mockResolvedValue({ data: mockMember, error: null });
    const result = await getMemberByEmail('member@example.com');
    expect(result).toEqual(mockMember);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('email', 'member@example.com');
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getMemberByEmail('nonexistent@example.com');
    expect(result).toBeNull();
  });
});

describe('updateMemberTier', () => {
  it('updates tier without stripe data', async () => {
    resetClient();
    await updateMemberTier('mem-1', 'basic');
    expect(mockClient.from).toHaveBeenCalledWith('members');
    expect(mockClient._queryChain.update).toHaveBeenCalledWith({ tier: 'basic' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'mem-1');
  });

  it('updates tier with stripe data', async () => {
    resetClient();
    await updateMemberTier('mem-1', 'premium', {
      customerId: 'cus_premium456',
      subscriptionId: 'sub_premium456',
    });
    expect(mockClient._queryChain.update).toHaveBeenCalledWith({
      tier: 'premium',
      stripe_customer_id: 'cus_premium456',
      stripe_subscription_id: 'sub_premium456',
    });
  });

  it('logs error on failure', async () => {
    setError('update failed');
    await updateMemberTier('mem-1', 'basic');
    expect(console.error).toHaveBeenCalled();
  });
});

// ── Courses ──────────────────────────────────────────────────────────────────

describe('getCourses', () => {
  it('returns courses on success', async () => {
    setData([mockCourse]);
    const result = await getCourses();
    expect(result).toEqual([mockCourse]);
    expect(mockClient.from).toHaveBeenCalledWith('courses');
    expect(mockClient._queryChain.select).toHaveBeenCalledWith(
      'id,title,slug,description,category,access_tier,published,cover_image,created_at',
    );
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getCourses();
    expect(result).toEqual([]);
  });

  it('applies category filter', async () => {
    setData([mockCourse]);
    await getCourses({ category: 'martial-arts' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('category', 'martial-arts');
  });

  it('applies published filter', async () => {
    setData([mockCourse]);
    await getCourses({ published: true });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('published', true);
  });
});

describe('getCourseBySlug', () => {
  it('returns course on success', async () => {
    resetClient({ data: mockCourse });
    mockClient._queryChain.single.mockResolvedValue({ data: mockCourse, error: null });
    const result = await getCourseBySlug('martial-arts-fundamentals');
    expect(result).toEqual(mockCourse);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('slug', 'martial-arts-fundamentals');
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getCourseBySlug('nonexistent');
    expect(result).toBeNull();
  });
});

// ── Newsletter ───────────────────────────────────────────────────────────────

describe('subscribeToNewsletter', () => {
  it('upserts subscriber successfully', async () => {
    resetClient();
    await subscribeToNewsletter(' Test@Example.com ', ' homepage ');
    expect(mockClient.from).toHaveBeenCalledWith('newsletter_subscribers');
    expect(mockClient._queryChain.upsert).toHaveBeenCalledWith(
      { email: 'test@example.com', source: 'homepage', unsubscribed_at: null },
      { onConflict: 'email' },
    );
  });

  it('defaults source to null', async () => {
    resetClient();
    await subscribeToNewsletter('test@example.com');
    expect(mockClient._queryChain.upsert).toHaveBeenCalledWith(
      { email: 'test@example.com', source: null, unsubscribed_at: null },
      { onConflict: 'email' },
    );
  });

  it('throws on error', async () => {
    setError('subscribe failed');
    await expect(subscribeToNewsletter('test@example.com')).rejects.toEqual({ message: 'subscribe failed' });
  });
});

describe('unsubscribeFromNewsletter', () => {
  it('updates unsubscribed_at', async () => {
    resetClient();
    await unsubscribeFromNewsletter(' Test@Example.com ');
    expect(mockClient.from).toHaveBeenCalledWith('newsletter_subscribers');
    expect(mockClient._queryChain.update).toHaveBeenCalled();
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('email', 'test@example.com');
  });

  it('logs error on failure', async () => {
    setError('unsubscribe failed');
    await unsubscribeFromNewsletter('test@example.com');
    expect(console.error).toHaveBeenCalled();
  });
});

// ── Contact ──────────────────────────────────────────────────────────────────

describe('submitContactForm', () => {
  it('inserts contact form data', async () => {
    resetClient();
    await submitContactForm({
      name: 'John',
      email: 'john@example.com',
      subject: 'Test',
      message: 'Hello',
    });
    expect(mockClient.from).toHaveBeenCalledWith('contact_submissions');
    expect(mockClient._queryChain.insert).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
      subject: 'Test',
      message: 'Hello',
    });
  });

  it('defaults subject to null', async () => {
    resetClient();
    await submitContactForm({
      name: 'John',
      email: 'john@example.com',
      message: 'Hello',
    });
    expect(mockClient._queryChain.insert).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
      subject: null,
      message: 'Hello',
    });
  });

  it('throws on error', async () => {
    setError('insert failed');
    await expect(
      submitContactForm({ name: 'John', email: 'john@example.com', message: 'Hello' }),
    ).rejects.toEqual({ message: 'insert failed' });
  });
});

// ── Dispatches ───────────────────────────────────────────────────────────────

describe('getDispatches', () => {
  it('returns dispatches on success', async () => {
    setData([mockDispatch]);
    const result = await getDispatches();
    expect(result).toEqual([mockDispatch]);
    expect(mockClient.from).toHaveBeenCalledWith('dispatches');
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getDispatches();
    expect(result).toEqual([]);
  });

  it('applies range with defaults', async () => {
    setData([]);
    await getDispatches();
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(0, 19);
  });
});

describe('getDispatchesForListing', () => {
  it('returns dispatches without full row assumption', async () => {
    setData([mockDispatch]);
    const result = await getDispatchesForListing();
    expect(result).toEqual([mockDispatch]);
    expect(mockClient._queryChain.select).toHaveBeenCalledWith(
      'id,title,slug,lens,excerpt,published_at',
    );
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getDispatchesForListing();
    expect(result).toEqual([]);
  });
});

describe('getDispatchBySlug', () => {
  it('returns dispatch on success', async () => {
    resetClient({ data: mockDispatch });
    mockClient._queryChain.single.mockResolvedValue({ data: mockDispatch, error: null });
    const result = await getDispatchBySlug('reclaiming-narrative');
    expect(result).toEqual(mockDispatch);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('slug', 'reclaiming-narrative');
    expectPublicVisibilityApplied();
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getDispatchBySlug('nonexistent');
    expect(result).toBeNull();
  });
});

// ── Handbooks ─────────────────────────────────────────────────────────────────

describe('getHandbooks', () => {
  it('returns handbooks on success', async () => {
    setData([mockHandbook]);
    const result = await getHandbooks();
    expect(result).toEqual([mockHandbook]);
    expect(mockClient.from).toHaveBeenCalledWith('handbooks');
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getHandbooks();
    expect(result).toEqual([]);
  });

  it('applies lens filter', async () => {
    setData([mockHandbook]);
    await getHandbooks({ lens: 'health' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'health');
  });

  it('applies range with defaults', async () => {
    setData([]);
    await getHandbooks();
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(0, 19);
  });
});

describe('getHandbooksForSitemap', () => {
  it('returns slug rows only', async () => {
    setData([{ slug: 'hb-1', published_at: '2026-02-01' }]);
    const result = await getHandbooksForSitemap({ limit: 50 });
    expect(result).toEqual([{ slug: 'hb-1', published_at: '2026-02-01' }]);
    expect(mockClient._queryChain.select).toHaveBeenCalledWith('slug,published_at');
    expectPublicVisibilityApplied();
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getHandbooksForSitemap();
    expect(result).toEqual([]);
  });
});

describe('getHandbookBySlug', () => {
  it('returns handbook on success', async () => {
    resetClient({ data: mockHandbook });
    mockClient._queryChain.single.mockResolvedValue({ data: mockHandbook, error: null });
    const result = await getHandbookBySlug('discipline-handbook');
    expect(result).toEqual(mockHandbook);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('slug', 'discipline-handbook');
    expectPublicVisibilityApplied();
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getHandbookBySlug('nonexistent');
    expect(result).toBeNull();
  });
});
