import {
  createMockSupabaseClient,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import { getContentCounts } from '@/lib/supabase/admin-queries/counts';

// ── Helpers ──────────────────────────────────────────────────────────────────

function resetClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  mockClient = createMockSupabaseClient(overrides);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

// ── getContentCounts ────────────────────────────────────────────────────────

describe('getContentCounts', () => {
  it('returns structured counts from all tables', async () => {
    resetClient();

    let callIndex = 0;
    const counts = [10, 5, 3, 8, 4, 2, 6, 4, 2, 15, 7, 5, 12, 7, 5, 2, 42, 9, 99];
    mockClient.from = jest.fn().mockImplementation(() => {
      const idx = callIndex++;
      const chain = { ...mockClient._queryChain };
      chain.then = jest.fn((resolve) => resolve({ data: null, error: null, count: counts[idx] }));
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.is = jest.fn().mockReturnValue(chain);
      chain.select = jest.fn().mockReturnValue(chain);
      return chain;
    });

    const result = await getContentCounts();
    expect(result).toEqual({
      articles: { total: 10, published: 5, draft: 3 },
      briefings: { total: 8, published: 4, draft: 2 },
      courses: { total: 6, published: 4, draft: 2 },
      dispatches: { total: 15, published: 7, draft: 5 },
      downloads: { total: 12 },
      handbooks: { total: 7, published: 5, draft: 2 },
      members: { total: 42 },
      messages: { total: 9 },
      subscribers: { total: 99 },
    });
  });

  it('returns zeros when counts are null', async () => {
    resetClient();

    mockClient.from = jest.fn().mockImplementation(() => {
      const chain = { ...mockClient._queryChain };
      chain.then = jest.fn((resolve) => resolve({ data: null, error: null, count: null }));
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.is = jest.fn().mockReturnValue(chain);
      chain.select = jest.fn().mockReturnValue(chain);
      return chain;
    });

    const result = await getContentCounts();
    expect(result).toEqual({
      articles: { total: 0, published: 0, draft: 0 },
      briefings: { total: 0, published: 0, draft: 0 },
      courses: { total: 0, published: 0, draft: 0 },
      dispatches: { total: 0, published: 0, draft: 0 },
      downloads: { total: 0 },
      handbooks: { total: 0, published: 0, draft: 0 },
      members: { total: 0 },
      messages: { total: 0 },
      subscribers: { total: 0 },
    });
  });

  it('queries correct tables', async () => {
    resetClient();

    const tablesCalled: string[] = [];
    mockClient.from = jest.fn().mockImplementation((table: string) => {
      tablesCalled.push(table);
      const chain = { ...mockClient._queryChain };
      chain.then = jest.fn((resolve) => resolve({ data: null, error: null, count: 0 }));
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.is = jest.fn().mockReturnValue(chain);
      chain.select = jest.fn().mockReturnValue(chain);
      return chain;
    });

    await getContentCounts();
    expect(tablesCalled).toContain('articles');
    expect(tablesCalled).toContain('briefings');
    expect(tablesCalled).toContain('courses');
    expect(tablesCalled).toContain('dispatches');
    expect(tablesCalled).toContain('downloads');
    expect(tablesCalled).toContain('handbooks');
    expect(tablesCalled).toContain('members');
    expect(tablesCalled).toContain('contact_submissions');
    expect(tablesCalled).toContain('newsletter_subscribers');
  });

  it('produces zeros when queries return errors', async () => {
    resetClient();

    mockClient.from = jest.fn().mockImplementation(() => {
      const chain = { ...mockClient._queryChain };
      chain.then = jest.fn((resolve) => resolve({ data: null, error: { message: 'err' }, count: null }));
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.is = jest.fn().mockReturnValue(chain);
      chain.select = jest.fn().mockReturnValue(chain);
      return chain;
    });

    const result = await getContentCounts();
    // Even with errors, count ?? 0 produces zeros
    expect(result.articles.total).toBe(0);
    expect(result.briefings.total).toBe(0);
    expect(result.members.total).toBe(0);
  });
});
