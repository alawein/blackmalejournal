// tests/portal/bookmark-actions.test.ts
// jest.mock must be at the top level (hoisted), so mocks are defined before imports.

const mocks = {
  getUser: jest.fn(),
  select: jest.fn(),
  insert: jest.fn(),
  delete: jest.fn(),
  eq: jest.fn(),
  limit: jest.fn(),
  from: jest.fn(),
};

// Build the chainable select/eq/limit chain that resolves to { data, error }
function makeSelectChain(result: { data: unknown; error: { message: string } | null }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  };
  return chain;
}

function makeDeleteChain(result: { error: { message: string } | null }) {
  const chain = {
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    // The final .eq() resolves
    then: jest.fn((resolve) => resolve(result)),
  };
  // Make each .eq() in the chain return the chain itself and also be thenable
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.delete = jest.fn().mockReturnValue(chain);
  return chain;
}

function makeInsertChain(result: { error: { message: string } | null }) {
  const chain = {
    insert: jest.fn().mockResolvedValue(result),
  };
  return chain;
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mocks.getUser },
      from: mocks.from,
    }),
  ),
}));

import { toggleBookmark } from '@/app/(auth)/portal/bookmarks/actions';

// ── Helpers ──────────────────────────────────────────────────────────────────

const MEMBER_ID = 'mem-uuid-1';
const CONTENT_TYPE = 'article';
const CONTENT_ID = 'art-uuid-1';

function setupAuth(userId: string | null = MEMBER_ID) {
  mocks.getUser.mockResolvedValue({
    data: { user: userId ? { id: userId } : null },
    error: userId ? null : { message: 'Not logged in' },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('toggleBookmark', () => {
  describe('when not authenticated', () => {
    it('returns error when user is null', async () => {
      mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await toggleBookmark(CONTENT_TYPE, CONTENT_ID);

      expect(result).toEqual({ error: 'Not authenticated' });
      expect(mocks.from).not.toHaveBeenCalled();
    });

    it('returns error when getUser returns an auth error', async () => {
      mocks.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Session expired' },
      });

      const result = await toggleBookmark(CONTENT_TYPE, CONTENT_ID);

      expect(result).toEqual({ error: 'Not authenticated' });
    });
  });

  describe('when not already bookmarked', () => {
    it('inserts a bookmark and returns { bookmarked: true }', async () => {
      setupAuth();

      // First from() call: select to check existence → empty
      // Second from() call: insert
      let callIndex = 0;
      mocks.from.mockImplementation((table: string) => {
        callIndex += 1;
        if (callIndex === 1) {
          // select chain
          expect(table).toBe('member_bookmarks');
          return makeSelectChain({ data: [], error: null });
        } else {
          // insert chain
          expect(table).toBe('member_bookmarks');
          return makeInsertChain({ error: null });
        }
      });

      const result = await toggleBookmark(CONTENT_TYPE, CONTENT_ID);

      expect(result).toEqual({ bookmarked: true });
    });
  });

  describe('when already bookmarked', () => {
    it('deletes the bookmark and returns { bookmarked: false }', async () => {
      setupAuth();

      let callIndex = 0;
      mocks.from.mockImplementation((table: string) => {
        callIndex += 1;
        if (callIndex === 1) {
          // select chain — returns existing bookmark
          expect(table).toBe('member_bookmarks');
          return makeSelectChain({ data: [{ id: 'bm-1' }], error: null });
        } else {
          // delete chain
          expect(table).toBe('member_bookmarks');
          return makeDeleteChain({ error: null });
        }
      });

      const result = await toggleBookmark(CONTENT_TYPE, CONTENT_ID);

      expect(result).toEqual({ bookmarked: false });
    });
  });

  describe('error cases', () => {
    it('returns error when the select query fails', async () => {
      setupAuth();

      mocks.from.mockImplementation(() =>
        makeSelectChain({ data: null, error: { message: 'select failed' } }),
      );

      const result = await toggleBookmark(CONTENT_TYPE, CONTENT_ID);

      expect(result).toEqual({ error: 'select failed' });
    });

    it('returns error when insert fails', async () => {
      setupAuth();

      let callIndex = 0;
      mocks.from.mockImplementation(() => {
        callIndex += 1;
        if (callIndex === 1) {
          return makeSelectChain({ data: [], error: null });
        }
        return makeInsertChain({ error: { message: 'insert failed' } });
      });

      const result = await toggleBookmark(CONTENT_TYPE, CONTENT_ID);

      expect(result).toEqual({ error: 'insert failed' });
    });

    it('returns error when delete fails', async () => {
      setupAuth();

      let callIndex = 0;
      mocks.from.mockImplementation(() => {
        callIndex += 1;
        if (callIndex === 1) {
          return makeSelectChain({ data: [{ id: 'bm-1' }], error: null });
        }
        return makeDeleteChain({ error: { message: 'delete failed' } });
      });

      const result = await toggleBookmark(CONTENT_TYPE, CONTENT_ID);

      expect(result).toEqual({ error: 'delete failed' });
    });
  });
});
