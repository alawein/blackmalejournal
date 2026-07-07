import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import { mockDispatch } from '../../helpers/fixtures';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllDispatches,
  getDispatchById,
  getDispatchesByIds,
  createDispatch,
  updateDispatch,
  deleteDispatch,
  bulkUpdateDispatchStatuses,
} from '@/lib/supabase/admin-queries/dispatches';

// ── Helpers ──────────────────────────────────────────────────────────────────

function resetClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  mockClient = createMockSupabaseClient(overrides);
}

function setData(data: unknown) {
  resetClient({ data });
}

function setError(message = 'test error') {
  resetClient({ error: { message } });
}

function setSingleData(data: unknown) {
  resetClient({ data });
  mockClient._queryChain.single.mockResolvedValue({ data, error: null });
}

function setSingleError(message = 'single failed') {
  resetClient();
  mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message } });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

// ── getAllDispatches ─────────────────────────────────────────────────────────

describe('getAllDispatches', () => {
  it('returns dispatches on success', async () => {
    setData([mockDispatch]);
    const result = await getAllDispatches();
    expect(result).toEqual([mockDispatch]);
    expect(mockClient.from).toHaveBeenCalledWith('dispatches');
  });

  it('applies status and lens filters', async () => {
    setData([mockDispatch]);
    await getAllDispatches({ status: 'draft', lens: 'culture' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'draft');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'culture');
  });

  it('applies search query filter', async () => {
    setData([mockDispatch]);
    await getAllDispatches({ query: 'narrative' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('title.ilike.%narrative%'),
    );
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllDispatches();
    expect(result).toEqual([]);
  });
});

// ── getDispatchById ─────────────────────────────────────────────────────────

describe('getDispatchById', () => {
  it('returns dispatch on success', async () => {
    setSingleData(mockDispatch);
    const result = await getDispatchById('dsp-1');
    expect(result).toEqual(mockDispatch);
  });

  it('returns null on error', async () => {
    setSingleError('missing');
    const result = await getDispatchById('missing');
    expect(result).toBeNull();
  });
});

// ── getDispatchesByIds ──────────────────────────────────────────────────────

describe('getDispatchesByIds', () => {
  it('returns dispatches sorted by ID order', async () => {
    setData([mockDispatch]);
    const result = await getDispatchesByIds(['dsp-1']);
    expect(result).toHaveLength(1);
  });

  it('returns empty array on error', async () => {
    setError('lookup failed');
    const result = await getDispatchesByIds(['dsp-1']);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty IDs', async () => {
    const result = await getDispatchesByIds([]);
    expect(result).toEqual([]);
  });
});

// ── createDispatch ──────────────────────────────────────────────────────────

describe('createDispatch', () => {
  const baseData = {
    title: 'New Dispatch',
    slug: 'new-dispatch',
    lens: 'politics' as const,
    excerpt: 'Excerpt',
    body: 'Body',
    status: 'draft' as const,
    author: 'The Chairman',
  };

  it('inserts dispatch and returns it', async () => {
    setSingleData(mockDispatch);
    const result = await createDispatch(baseData);
    expect(result).toEqual(mockDispatch);
    expect(mockClient.from).toHaveBeenCalledWith('dispatches');
  });

  it('auto-sets published_at when status is published', async () => {
    setSingleData(mockDispatch);
    await createDispatch({ ...baseData, status: 'published' });
    expect(mockClient._queryChain.insert.mock.calls[0][0].published_at).toEqual(expect.any(String));
  });

  it('returns null on error', async () => {
    setSingleError('insert failed');
    const result = await createDispatch(baseData);
    expect(result).toBeNull();
  });
});

// ── updateDispatch ──────────────────────────────────────────────────────────

describe('updateDispatch', () => {
  it('updates dispatch and auto-sets published_at', async () => {
    setSingleData(mockDispatch);
    await updateDispatch('dsp-1', { status: 'published' });
    expect(mockClient._queryChain.update.mock.calls[0][0].published_at).toEqual(expect.any(String));
  });

  it('returns null on error', async () => {
    setSingleError('update failed');
    const result = await updateDispatch('dsp-1', { title: 'x' });
    expect(result).toBeNull();
  });
});

// ── deleteDispatch ──────────────────────────────────────────────────────────

describe('deleteDispatch', () => {
  it('deletes dispatch by id and returns true', async () => {
    resetClient();
    const result = await deleteDispatch('dsp-1');
    expect(result).toBe(true);
  });

  it('returns false on error', async () => {
    setError('delete failed');
    const result = await deleteDispatch('dsp-1');
    expect(result).toBe(false);
  });
});

// ── bulkUpdateDispatchStatuses ──────────────────────────────────────────────

describe('bulkUpdateDispatchStatuses', () => {
  it('returns empty result for empty IDs array', async () => {
    const result = await bulkUpdateDispatchStatuses([], 'published');
    expect(result).toEqual({ previous: [], updated: [] });
  });

  it('updates statuses and patches published_at for items missing it', async () => {
    resetClient();

    const previous = [{ ...mockDispatch, id: 'dsp-1', status: 'draft' as const, published_at: '' }];
    const updated = [{ ...mockDispatch, id: 'dsp-1', status: 'published' as const }];

    setFromSequence(mockClient, [
      { table: 'dispatches', data: previous },
      { table: 'dispatches', data: null },
      { table: 'dispatches', data: null },
      { table: 'dispatches', data: updated },
    ]);

    const result = await bulkUpdateDispatchStatuses(['dsp-1'], 'published');
    expect(result).toEqual({ previous, updated });
  });

  it('returns null when status update fails', async () => {
    resetClient();

    const previous = [{ ...mockDispatch, id: 'dsp-1' }];

    setFromSequence(mockClient, [
      { table: 'dispatches', data: previous },
      { table: 'dispatches', error: { message: 'update failed' } },
    ]);

    const result = await bulkUpdateDispatchStatuses(['dsp-1'], 'review');
    expect(result).toBeNull();
  });

  it('returns null when published_at patch fails', async () => {
    resetClient();

    const previous = [{ ...mockDispatch, id: 'dsp-1', published_at: '' }];

    setFromSequence(mockClient, [
      { table: 'dispatches', data: previous },
      { table: 'dispatches', data: null },
      { table: 'dispatches', error: { message: 'patch failed' } },
    ]);

    const result = await bulkUpdateDispatchStatuses(['dsp-1'], 'published');
    expect(result).toBeNull();
  });
});
