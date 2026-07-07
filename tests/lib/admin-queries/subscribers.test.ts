import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import type { NewsletterSubscriber } from '@/lib/supabase/types';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllSubscribers,
  getSubscriberCounts,
} from '@/lib/supabase/admin-queries/subscribers';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockSubscriber: NewsletterSubscriber = {
  id: 'sub-1',
  email: 'subscriber@example.com',
  source: 'homepage',
  subscribed_at: '2026-03-10T00:00:00Z',
  unsubscribed_at: null,
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

// ── getAllSubscribers ────────────────────────────────────────────────────────

describe('getAllSubscribers', () => {
  it('returns subscribers on success', async () => {
    setData([mockSubscriber]);
    const result = await getAllSubscribers();
    expect(result).toEqual([mockSubscriber]);
    expect(mockClient.from).toHaveBeenCalledWith('newsletter_subscribers');
  });

  it('filters active subscribers with is null', async () => {
    setData([mockSubscriber]);
    await getAllSubscribers({ active: true });
    expect(mockClient._queryChain.is).toHaveBeenCalledWith('unsubscribed_at', null);
  });

  it('filters inactive subscribers with not is null', async () => {
    setData([mockSubscriber]);
    await getAllSubscribers({ active: false });
    expect(mockClient._queryChain.not).toHaveBeenCalledWith('unsubscribed_at', 'is', null);
  });

  it('applies search query filter', async () => {
    setData([mockSubscriber]);
    await getAllSubscribers({ query: 'home' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('source.ilike.%home%'),
    );
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllSubscribers();
    expect(result).toEqual([]);
  });
});

// ── getSubscriberCounts ─────────────────────────────────────────────────────

describe('getSubscriberCounts', () => {
  it('returns total, active, and unsubscribed counts', async () => {
    resetClient();
    setFromSequence(mockClient, [
      { table: 'newsletter_subscribers', count: 20 },
      { table: 'newsletter_subscribers', count: 16 },
      { table: 'newsletter_subscribers', count: 4 },
    ]);
    const result = await getSubscriberCounts();
    expect(result).toEqual({ total: 20, active: 16, unsubscribed: 4 });
  });

  it('returns zeros when counts are null', async () => {
    resetClient();
    setFromSequence(mockClient, [
      { table: 'newsletter_subscribers', count: null },
      { table: 'newsletter_subscribers', count: null },
      { table: 'newsletter_subscribers', count: null },
    ]);
    const result = await getSubscriberCounts();
    expect(result).toEqual({ total: 0, active: 0, unsubscribed: 0 });
  });
});
