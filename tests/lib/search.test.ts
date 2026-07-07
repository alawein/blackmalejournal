import type { SearchResult } from '@/lib/supabase/types';

// ── SearchResult type ─────────────────────────────────────────────────────────

describe('SearchResult type', () => {
  test('search result has required fields', () => {
    const result: SearchResult = {
      type: 'article',
      title: 'Test Article',
      slug: 'test-article',
      excerpt: 'A test excerpt',
      lens: 'health',
      publishedAt: '2026-01-01',
    };
    expect(result.type).toBe('article');
    expect(result.title).toBeDefined();
    expect(result.slug).toBeDefined();
  });

  test('search result accepts optional accessTier and relevance', () => {
    const result: SearchResult = {
      type: 'briefing',
      title: 'Test Briefing',
      slug: 'test-briefing',
      excerpt: '',
      publishedAt: '2026-01-01',
      accessTier: 'premium',
      relevance: 0.95,
    };
    expect(result.accessTier).toBe('premium');
    expect(result.relevance).toBe(0.95);
  });
});

// ── searchContentFTS ──────────────────────────────────────────────────────────

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { searchContentFTS } from '@/lib/supabase/queries';

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

function makeMockSupabase(rpcResult: { data: unknown; error: { message: string } | null }) {
  return {
    rpc: jest.fn().mockResolvedValue(rpcResult),
  };
}

describe('searchContentFTS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns empty array for query shorter than 2 chars', async () => {
    const result = await searchContentFTS('a');
    expect(result).toEqual([]);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  test('returns empty array for empty query', async () => {
    const result = await searchContentFTS('');
    expect(result).toEqual([]);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  test('calls RPC with correct params and default options', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    await searchContentFTS('masculinity');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('search_content', {
      query: 'masculinity',
      filter_lens: null,
      filter_types: null,
      sort_by: 'relevance',
      result_limit: 30,
    });
  });

  test('passes null for omitted lens and types filters', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    await searchContentFTS('discipline', { sort: 'date', limit: 10 });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('search_content', {
      query: 'discipline',
      filter_lens: null,
      filter_types: null,
      sort_by: 'date',
      result_limit: 10,
    });
  });

  test('passes provided lens and types filters', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    await searchContentFTS('health', { lens: ['health', 'culture'], types: ['article'] });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('search_content', {
      query: 'health',
      filter_lens: ['health', 'culture'],
      filter_types: ['article'],
      sort_by: 'relevance',
      result_limit: 30,
    });
  });

  test('returns empty array on RPC error', async () => {
    const mockSupabase = makeMockSupabase({ data: null, error: { message: 'RPC failed' } });
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await searchContentFTS('discipline');
    expect(result).toEqual([]);
  });

  test('maps RPC rows to SearchResult shape', async () => {
    const rows = [
      {
        id: 'abc',
        title: 'Discipline',
        slug: 'discipline',
        excerpt: 'An excerpt',
        lens: 'health',
        access_tier: 'free',
        published_at: '2026-01-01',
        content_type: 'article',
        relevance: 0.88,
      },
    ];
    const mockSupabase = makeMockSupabase({ data: rows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    const results = await searchContentFTS('discipline');
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      type: 'article',
      title: 'Discipline',
      slug: 'discipline',
      excerpt: 'An excerpt',
      lens: 'health',
      accessTier: 'free',
      publishedAt: '2026-01-01',
      relevance: 0.88,
    });
  });
});
