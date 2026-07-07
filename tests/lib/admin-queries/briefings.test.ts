import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import { mockBriefing } from '../../helpers/fixtures';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllBriefings,
  getBriefingById,
  getBriefingsByIds,
  createBriefing,
  updateBriefing,
  deleteBriefing,
  bulkUpdateBriefingStatuses,
} from '@/lib/supabase/admin-queries/briefings';

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

// ── getAllBriefings ──────────────────────────────────────────────────────────

describe('getAllBriefings', () => {
  it('returns briefings on success', async () => {
    setData([mockBriefing]);
    const result = await getAllBriefings();
    expect(result).toEqual([mockBriefing]);
    expect(mockClient.from).toHaveBeenCalledWith('briefings');
  });

  it('orders by issue_number DESC', async () => {
    setData([]);
    await getAllBriefings();
    expect(mockClient._queryChain.order).toHaveBeenCalledWith('issue_number', { ascending: false });
  });

  it('applies status filter', async () => {
    setData([mockBriefing]);
    await getAllBriefings({ status: 'draft' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'draft');
  });

  it('applies search query filter', async () => {
    setData([mockBriefing]);
    await getAllBriefings({ query: 'weekend' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('title.ilike.%weekend%'),
    );
  });

  it('applies numeric query with issue_number filter', async () => {
    setData([mockBriefing]);
    await getAllBriefings({ query: ' 12 ' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('issue_number.eq.12'),
    );
  });

  it('applies custom limit and offset', async () => {
    setData([]);
    await getAllBriefings({ limit: 10, offset: 5 });
    expect(mockClient._queryChain.range).toHaveBeenCalledWith(5, 14);
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllBriefings();
    expect(result).toEqual([]);
  });
});

// ── getBriefingById ─────────────────────────────────────────────────────────

describe('getBriefingById', () => {
  it('returns briefing on success', async () => {
    setSingleData(mockBriefing);
    const result = await getBriefingById('br-1');
    expect(result).toEqual(mockBriefing);
    expect(mockClient.from).toHaveBeenCalledWith('briefings');
  });

  it('returns null on error', async () => {
    setSingleError('not found');
    const result = await getBriefingById('missing');
    expect(result).toBeNull();
  });
});

// ── getBriefingsByIds ────────────────────────────────────────────────────────

describe('getBriefingsByIds', () => {
  it('normalizes IDs and returns sorted results', async () => {
    setData([mockBriefing]);
    const result = await getBriefingsByIds([' br-1 ', 'br-1']);
    expect(result).toHaveLength(1);
  });

  it('returns empty array for empty IDs', async () => {
    const result = await getBriefingsByIds([]);
    expect(result).toEqual([]);
  });

  it('returns empty array on error', async () => {
    setError('lookup failed');
    const result = await getBriefingsByIds(['br-1']);
    expect(result).toEqual([]);
  });
});

// ── createBriefing ──────────────────────────────────────────────────────────

describe('createBriefing', () => {
  const baseData = {
    issue_number: 4,
    title: 'Weekend Briefing No. 004',
    slug: 'weekend-briefing-004',
    sections: [{ title: 'Lead', body: 'Lead body' }],
    access_tier: 'premium' as const,
    status: 'draft' as const,
  };

  it('inserts briefing and returns it', async () => {
    setSingleData(mockBriefing);
    const result = await createBriefing(baseData);
    expect(result).toEqual(mockBriefing);
    expect(mockClient.from).toHaveBeenCalledWith('briefings');
    expect(mockClient._queryChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        issue_number: 4,
        title: 'Weekend Briefing No. 004',
        published_at: null,
      }),
    );
  });

  it('auto-sets published_at when status is published', async () => {
    setSingleData(mockBriefing);
    await createBriefing({ ...baseData, status: 'published' });
    const insertPayload = mockClient._queryChain.insert.mock.calls[0][0];
    expect(insertPayload.published_at).toEqual(expect.any(String));
  });

  it('returns null on error', async () => {
    setSingleError('insert failed');
    const result = await createBriefing(baseData);
    expect(result).toBeNull();
  });
});

// ── updateBriefing ──────────────────────────────────────────────────────────

describe('updateBriefing', () => {
  it('updates briefing by id', async () => {
    setSingleData(mockBriefing);
    const result = await updateBriefing('br-1', { title: 'Updated' });
    expect(result).toEqual(mockBriefing);
    expect(mockClient._queryChain.update).toHaveBeenCalledWith({ title: 'Updated' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'br-1');
  });

  it('auto-sets published_at when status changes to published', async () => {
    setSingleData(mockBriefing);
    await updateBriefing('br-1', { status: 'published' });
    const updatePayload = mockClient._queryChain.update.mock.calls[0][0];
    expect(updatePayload.published_at).toEqual(expect.any(String));
  });

  it('returns null on error', async () => {
    setSingleError('update failed');
    const result = await updateBriefing('br-1', { title: 'x' });
    expect(result).toBeNull();
  });
});

// ── deleteBriefing ──────────────────────────────────────────────────────────

describe('deleteBriefing', () => {
  it('deletes briefing by id and returns true', async () => {
    resetClient();
    const result = await deleteBriefing('br-1');
    expect(result).toBe(true);
    expect(mockClient.from).toHaveBeenCalledWith('briefings');
  });

  it('returns false on error', async () => {
    setError('delete failed');
    const result = await deleteBriefing('br-1');
    expect(result).toBe(false);
  });
});

// ── bulkUpdateBriefingStatuses ──────────────────────────────────────────────

describe('bulkUpdateBriefingStatuses', () => {
  it('returns empty result for empty IDs array', async () => {
    const result = await bulkUpdateBriefingStatuses([], 'published');
    expect(result).toEqual({ previous: [], updated: [] });
  });

  it('updates statuses and patches published_at for items missing it', async () => {
    resetClient();

    const previous = [{ ...mockBriefing, id: 'br-1', status: 'draft' as const, published_at: '' }];
    const updated = [{ ...mockBriefing, id: 'br-1', status: 'published' as const }];

    setFromSequence(mockClient, [
      { table: 'briefings', data: previous },
      { table: 'briefings', data: null },
      { table: 'briefings', data: null },
      { table: 'briefings', data: updated },
    ]);

    const result = await bulkUpdateBriefingStatuses(['br-1'], 'published');
    expect(result).toEqual({ previous, updated });
  });

  it('returns null when status update fails', async () => {
    resetClient();

    const previous = [{ ...mockBriefing, id: 'br-1' }];

    setFromSequence(mockClient, [
      { table: 'briefings', data: previous },
      { table: 'briefings', error: { message: 'update failed' } },
    ]);

    const result = await bulkUpdateBriefingStatuses(['br-1'], 'review');
    expect(result).toBeNull();
  });

  it('returns null when published_at patch fails', async () => {
    resetClient();

    const previous = [{ ...mockBriefing, id: 'br-1', published_at: '' }];

    setFromSequence(mockClient, [
      { table: 'briefings', data: previous },
      { table: 'briefings', data: null },
      { table: 'briefings', error: { message: 'patch failed' } },
    ]);

    const result = await bulkUpdateBriefingStatuses(['br-1'], 'published');
    expect(result).toBeNull();
  });
});
