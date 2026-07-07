import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import type { Download } from '@/lib/supabase/types';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllDownloads,
  getDownloadById,
  getDownloadsByIds,
  createDownload,
  updateDownload,
  deleteDownload,
  bulkUpdateDownloadAccessTiers,
} from '@/lib/supabase/admin-queries/downloads';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockDownload: Download = {
  id: 'dl-1',
  title: 'Ritual Planner',
  slug: 'ritual-planner',
  description: 'Daily execution planner.',
  category: 'template',
  file_url: 'downloads/ritual-planner.pdf',
  file_type: 'pdf',
  file_size: 2048,
  access_tier: 'basic',
  cover_image: null,
  published_at: '2026-03-01T00:00:00Z',
  created_at: '2026-02-25T00:00:00Z',
};

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

// ── getAllDownloads ──────────────────────────────────────────────────────────

describe('getAllDownloads', () => {
  it('returns downloads on success', async () => {
    setData([mockDownload]);
    const result = await getAllDownloads();
    expect(result).toEqual([mockDownload]);
    expect(mockClient.from).toHaveBeenCalledWith('downloads');
  });

  it('applies category and accessTier filters', async () => {
    setData([mockDownload]);
    await getAllDownloads({ category: 'template', accessTier: 'basic' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('category', 'template');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('access_tier', 'basic');
  });

  it('applies search query filter', async () => {
    setData([mockDownload]);
    await getAllDownloads({ query: 'planner' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('description.ilike.%planner%'),
    );
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllDownloads();
    expect(result).toEqual([]);
  });
});

// ── getDownloadById ─────────────────────────────────────────────────────────

describe('getDownloadById', () => {
  it('returns download on success', async () => {
    setSingleData(mockDownload);
    const result = await getDownloadById('dl-1');
    expect(result?.id).toBe('dl-1');
  });

  it('returns null on error', async () => {
    setSingleError('not found');
    const result = await getDownloadById('missing');
    expect(result).toBeNull();
  });
});

// ── getDownloadsByIds ───────────────────────────────────────────────────────

describe('getDownloadsByIds', () => {
  it('returns downloads sorted by ID order', async () => {
    setData([mockDownload]);
    const result = await getDownloadsByIds(['dl-1']);
    expect(result).toHaveLength(1);
  });

  it('returns empty array on error', async () => {
    setError('lookup failed');
    const result = await getDownloadsByIds(['dl-1']);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty IDs', async () => {
    const result = await getDownloadsByIds([]);
    expect(result).toEqual([]);
  });
});

// ── createDownload ──────────────────────────────────────────────────────────

describe('createDownload', () => {
  const baseData = {
    title: 'Toolkit',
    slug: 'toolkit',
    description: 'Toolkit',
    category: 'guide',
    file_url: 'downloads/toolkit.pdf',
    file_type: 'pdf',
    file_size: 1024,
    access_tier: 'premium' as const,
  };

  it('inserts download with auto-set published_at', async () => {
    setSingleData(mockDownload);
    await createDownload(baseData);
    expect(mockClient._queryChain.insert.mock.calls[0][0].published_at).toEqual(expect.any(String));
  });

  it('returns null on error', async () => {
    setSingleError('insert failed');
    const result = await createDownload(baseData);
    expect(result).toBeNull();
  });
});

// ── updateDownload ──────────────────────────────────────────────────────────

describe('updateDownload', () => {
  it('updates download by id', async () => {
    setSingleData(mockDownload);
    const result = await updateDownload('dl-1', { title: 'Updated' });
    expect(result).toEqual(mockDownload);
  });

  it('returns null on error', async () => {
    setSingleError('update failed');
    const result = await updateDownload('dl-1', { title: 'Updated' });
    expect(result).toBeNull();
  });
});

// ── deleteDownload ──────────────────────────────────────────────────────────

describe('deleteDownload', () => {
  it('deletes download by id and returns true', async () => {
    resetClient();
    const result = await deleteDownload('dl-1');
    expect(result).toBe(true);
  });

  it('returns false on error', async () => {
    setError('delete failed');
    const result = await deleteDownload('dl-1');
    expect(result).toBe(false);
  });
});

// ── bulkUpdateDownloadAccessTiers ───────────────────────────────────────────

describe('bulkUpdateDownloadAccessTiers', () => {
  it('returns empty result for empty IDs array', async () => {
    const result = await bulkUpdateDownloadAccessTiers([], 'premium');
    expect(result).toEqual({ previous: [], updated: [] });
  });

  it('updates access tier across selected downloads', async () => {
    resetClient();

    const previous = [mockDownload];
    const updated = [{ ...mockDownload, access_tier: 'premium' as const }];

    setFromSequence(mockClient, [
      { table: 'downloads', data: previous },
      { table: 'downloads', data: null },
      { table: 'downloads', data: updated },
    ]);

    const result = await bulkUpdateDownloadAccessTiers(['dl-1'], 'premium');
    expect(result).toEqual({ previous, updated });
  });

  it('returns null when update fails', async () => {
    resetClient();

    setFromSequence(mockClient, [
      { table: 'downloads', data: [mockDownload] },
      { table: 'downloads', error: { message: 'update failed' } },
    ]);

    const result = await bulkUpdateDownloadAccessTiers(['dl-1'], 'premium');
    expect(result).toBeNull();
  });
});
