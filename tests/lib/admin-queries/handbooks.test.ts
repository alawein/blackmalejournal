import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import { mockHandbook } from '../../helpers/fixtures';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllHandbooks,
  getHandbookById,
  getHandbooksByIds,
  createHandbook,
  updateHandbook,
  deleteHandbook,
  bulkUpdateHandbookStatuses,
} from '@/lib/supabase/admin-queries/handbooks';

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

// ── getAllHandbooks ──────────────────────────────────────────────────────────

describe('getAllHandbooks', () => {
  it('returns handbooks on success', async () => {
    setData([mockHandbook]);
    const result = await getAllHandbooks();
    expect(result).toEqual([mockHandbook]);
    expect(mockClient.from).toHaveBeenCalledWith('handbooks');
  });

  it('applies status and lens filters', async () => {
    setData([mockHandbook]);
    await getAllHandbooks({ status: 'draft', lens: 'health' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'draft');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('lens', 'health');
  });

  it('applies search query filter', async () => {
    setData([mockHandbook]);
    await getAllHandbooks({ query: 'discipline' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('title.ilike.%discipline%'),
    );
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllHandbooks();
    expect(result).toEqual([]);
  });
});

// ── getHandbookById ─────────────────────────────────────────────────────────

describe('getHandbookById', () => {
  it('returns handbook on success', async () => {
    setSingleData(mockHandbook);
    const result = await getHandbookById('hb-1');
    expect(result).toEqual(mockHandbook);
  });

  it('returns null on error', async () => {
    setSingleError('not found');
    const result = await getHandbookById('missing');
    expect(result).toBeNull();
  });
});

// ── getHandbooksByIds ───────────────────────────────────────────────────────

describe('getHandbooksByIds', () => {
  it('returns handbooks sorted by ID order', async () => {
    setData([mockHandbook]);
    const result = await getHandbooksByIds(['hb-1']);
    expect(result).toHaveLength(1);
  });

  it('returns empty array for empty IDs', async () => {
    const result = await getHandbooksByIds([]);
    expect(result).toEqual([]);
  });

  it('returns empty array on error', async () => {
    setError('lookup failed');
    const result = await getHandbooksByIds(['hb-1']);
    expect(result).toEqual([]);
  });
});

// ── createHandbook ──────────────────────────────────────────────────────────

describe('createHandbook', () => {
  const baseData = {
    title: 'Field Manual',
    slug: 'field-manual',
    lens: 'politics' as const,
    description: 'Desc',
    body: 'Body',
    access_tier: 'basic' as const,
    status: 'draft' as const,
    author: 'The Chairman',
  };

  it('inserts handbook and returns it', async () => {
    setSingleData(mockHandbook);
    const result = await createHandbook(baseData);
    expect(result).toEqual(mockHandbook);
    expect(mockClient.from).toHaveBeenCalledWith('handbooks');
  });

  it('auto-sets published_at when status is published', async () => {
    setSingleData(mockHandbook);
    await createHandbook({ ...baseData, status: 'published' });
    expect(mockClient._queryChain.insert.mock.calls[0][0].published_at).toEqual(expect.any(String));
  });

  it('returns null on error', async () => {
    setSingleError('insert failed');
    const result = await createHandbook(baseData);
    expect(result).toBeNull();
  });
});

// ── updateHandbook ──────────────────────────────────────────────────────────

describe('updateHandbook', () => {
  it('updates handbook and auto-sets published_at', async () => {
    setSingleData(mockHandbook);
    await updateHandbook('hb-1', { status: 'published' });
    expect(mockClient._queryChain.update.mock.calls[0][0].published_at).toEqual(expect.any(String));
  });

  it('returns null on error', async () => {
    setSingleError('update failed');
    const result = await updateHandbook('hb-1', { title: 'x' });
    expect(result).toBeNull();
  });
});

// ── deleteHandbook ──────────────────────────────────────────────────────────

describe('deleteHandbook', () => {
  it('deletes handbook by id and returns true', async () => {
    resetClient();
    const result = await deleteHandbook('hb-1');
    expect(result).toBe(true);
  });

  it('returns false on error', async () => {
    setError('delete failed');
    const result = await deleteHandbook('hb-1');
    expect(result).toBe(false);
  });
});

// ── bulkUpdateHandbookStatuses ──────────────────────────────────────────────

describe('bulkUpdateHandbookStatuses', () => {
  it('returns empty result for empty IDs array', async () => {
    const result = await bulkUpdateHandbookStatuses([], 'published');
    expect(result).toEqual({ previous: [], updated: [] });
  });

  it('updates statuses and patches published_at for items missing it', async () => {
    resetClient();

    const previous = [{ ...mockHandbook, id: 'hb-1', status: 'draft' as const, published_at: '' }];
    const updated = [{ ...mockHandbook, id: 'hb-1', status: 'published' as const }];

    setFromSequence(mockClient, [
      { table: 'handbooks', data: previous },
      { table: 'handbooks', data: null },
      { table: 'handbooks', data: null },
      { table: 'handbooks', data: updated },
    ]);

    const result = await bulkUpdateHandbookStatuses(['hb-1'], 'published');
    expect(result).toEqual({ previous, updated });
  });

  it('returns null when status update fails', async () => {
    resetClient();

    const previous = [{ ...mockHandbook, id: 'hb-1' }];

    setFromSequence(mockClient, [
      { table: 'handbooks', data: previous },
      { table: 'handbooks', error: { message: 'update failed' } },
    ]);

    const result = await bulkUpdateHandbookStatuses(['hb-1'], 'review');
    expect(result).toBeNull();
  });

  it('returns null when published_at patch fails', async () => {
    resetClient();

    const previous = [{ ...mockHandbook, id: 'hb-1', published_at: '' }];

    setFromSequence(mockClient, [
      { table: 'handbooks', data: previous },
      { table: 'handbooks', data: null },
      { table: 'handbooks', error: { message: 'patch failed' } },
    ]);

    const result = await bulkUpdateHandbookStatuses(['hb-1'], 'published');
    expect(result).toBeNull();
  });
});
