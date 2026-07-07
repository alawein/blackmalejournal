import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import type { Campaign } from '@/lib/supabase/types';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getAudienceCount,
  getDistinctSubscriberSources,
} from '@/lib/supabase/admin-queries/campaigns';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockCampaign: Campaign = {
  id: 'camp-1',
  title: 'Weekly Update',
  subject: 'This Week in BMJ',
  body: '**Hello** subscribers',
  audience_filter: {},
  recipient_count: 50,
  status: 'draft',
  scheduled_at: null,
  sent_at: null,
  created_at: '2026-03-20T00:00:00Z',
  updated_at: '2026-03-20T00:00:00Z',
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

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

// ── getAllCampaigns ──────────────────────────────────────────────────────────

describe('getAllCampaigns', () => {
  it('returns campaigns on success', async () => {
    setData([mockCampaign]);
    const result = await getAllCampaigns();
    expect(result).toEqual([mockCampaign]);
    expect(mockClient.from).toHaveBeenCalledWith('campaigns');
  });

  it('filters by status when provided', async () => {
    setData([mockCampaign]);
    await getAllCampaigns({ status: 'draft' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'draft');
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllCampaigns();
    expect(result).toEqual([]);
  });
});

// ── getCampaignById ─────────────────────────────────────────────────────────

describe('getCampaignById', () => {
  it('returns a campaign by id', async () => {
    resetClient({ data: mockCampaign });
    mockClient._queryChain.single.mockResolvedValue({ data: mockCampaign, error: null });
    const result = await getCampaignById('camp-1');
    expect(result).toEqual(mockCampaign);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'camp-1');
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await getCampaignById('bad-id');
    expect(result).toBeNull();
  });
});

// ── createCampaign ──────────────────────────────────────────────────────────

describe('createCampaign', () => {
  it('inserts a row and returns the campaign', async () => {
    resetClient({ data: mockCampaign });
    mockClient._queryChain.single.mockResolvedValue({ data: mockCampaign, error: null });
    const result = await createCampaign({ title: 'Weekly Update', subject: 'This Week in BMJ' });
    expect(result).toEqual(mockCampaign);
    expect(mockClient.from).toHaveBeenCalledWith('campaigns');
    expect(mockClient._queryChain.insert).toHaveBeenCalled();
  });
});

// ── updateCampaign ──────────────────────────────────────────────────────────

describe('updateCampaign', () => {
  it('updates and sets updated_at', async () => {
    const updated = { ...mockCampaign, title: 'New Title', updated_at: '2026-03-21T00:00:00Z' };
    resetClient({ data: updated });
    mockClient._queryChain.single.mockResolvedValue({ data: updated, error: null });
    const result = await updateCampaign('camp-1', { title: 'New Title' });
    expect(result).toEqual(updated);
    expect(mockClient._queryChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Title', updated_at: expect.any(String) }),
    );
  });
});

// ── deleteCampaign ──────────────────────────────────────────────────────────

describe('deleteCampaign', () => {
  it('returns true on success', async () => {
    setData(null);
    const result = await deleteCampaign('camp-1');
    expect(result).toBe(true);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('id', 'camp-1');
  });
});

// ── getAudienceCount ────────────────────────────────────────────────────────

describe('getAudienceCount', () => {
  it('returns count from newsletter_subscribers', async () => {
    resetClient();
    mockClient._queryChain.then = jest.fn((resolve) =>
      resolve({ data: null, error: null, count: 42 }),
    );
    const result = await getAudienceCount({});
    expect(result).toBe(42);
    expect(mockClient.from).toHaveBeenCalledWith('newsletter_subscribers');
  });

  it('applies activeOnly filter by default (is null)', async () => {
    resetClient();
    mockClient._queryChain.then = jest.fn((resolve) =>
      resolve({ data: null, error: null, count: 10 }),
    );
    await getAudienceCount({});
    expect(mockClient._queryChain.is).toHaveBeenCalledWith('unsubscribed_at', null);
  });

  it('skips activeOnly when explicitly false', async () => {
    resetClient();
    mockClient._queryChain.then = jest.fn((resolve) =>
      resolve({ data: null, error: null, count: 10 }),
    );
    await getAudienceCount({ activeOnly: false });
    expect(mockClient._queryChain.is).not.toHaveBeenCalled();
  });

  it('returns 0 on error', async () => {
    resetClient();
    mockClient._queryChain.then = jest.fn((resolve) =>
      resolve({ data: null, error: { message: 'fail' }, count: null }),
    );
    const result = await getAudienceCount({});
    expect(result).toBe(0);
  });
});

// ── getDistinctSubscriberSources ────────────────────────────────────────────

describe('getDistinctSubscriberSources', () => {
  it('returns sorted unique sources', async () => {
    setData([{ source: 'homepage' }, { source: 'footer' }, { source: 'homepage' }]);
    const result = await getDistinctSubscriberSources();
    expect(result).toEqual(['footer', 'homepage']);
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getDistinctSubscriberSources();
    expect(result).toEqual([]);
  });
});
