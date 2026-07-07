import {
  createMockSupabaseClient,
  setFromByTable,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAdminContentPipelineInsights,
  getMemberAdminInsights,
  getMessageAdminInsights,
  getSubscriberAdminInsights,
  getAdminCommandCenterSnapshot,
} from '@/lib/supabase/admin-queries/insights';

// ── Helpers ──────────────────────────────────────────────────────────────────

function resetClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  mockClient = createMockSupabaseClient(overrides);
}

function setupAllTables() {
  resetClient();
  setFromByTable(mockClient, {
    articles: {
      data: [
        {
          id: 'art-1',
          title: 'Discipline',
          status: 'draft',
          published_at: null,
          created_at: '2026-03-20T00:00:00Z',
          lens: 'health',
          access_tier: 'free',
        },
      ],
      count: 1,
    },
    briefings: {
      data: [
        {
          id: 'br-1',
          title: 'Weekend Briefing',
          status: 'scheduled',
          published_at: '2026-03-27T00:00:00Z',
          created_at: '2026-03-21T00:00:00Z',
          issue_number: 4,
          access_tier: 'premium',
        },
      ],
      count: 1,
    },
    dispatches: {
      data: [
        {
          id: 'dsp-1',
          title: 'Dispatch',
          status: 'published',
          published_at: '2026-03-24T00:00:00Z',
          created_at: '2026-03-22T00:00:00Z',
          lens: 'culture',
        },
      ],
      count: 1,
    },
    handbooks: {
      data: [
        {
          id: 'hb-1',
          title: 'Handbook',
          status: 'review',
          published_at: null,
          created_at: '2026-03-19T00:00:00Z',
          lens: 'politics',
          access_tier: 'basic',
        },
      ],
      count: 1,
    },
    members: {
      data: [
        {
          id: 'mem-1',
          tier: 'premium',
          role: 'admin',
          stripe_customer_id: 'cus_1',
          stripe_subscription_id: null,
          created_at: '2026-03-01T00:00:00Z',
        },
      ],
      count: 1,
    },
    contact_submissions: {
      data: [
        {
          id: 'msg-1',
          name: 'Marcus',
          email: 'marcus@example.com',
          subject: 'Question',
          status: 'new',
          submitted_at: '2026-03-22T00:00:00Z',
          handled_at: null,
        },
      ],
      count: 1,
    },
    newsletter_subscribers: {
      data: [
        {
          id: 'sub-1',
          source: 'homepage',
          subscribed_at: '2026-03-10T00:00:00Z',
          unsubscribed_at: null,
        },
      ],
      count: 1,
    },
    courses: { data: [{ id: 'crs-1' }], count: 1 },
    downloads: { data: [{ id: 'dl-1' }], count: 1 },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

// ── getAdminContentPipelineInsights ─────────────────────────────────────────

describe('getAdminContentPipelineInsights', () => {
  it('returns pipeline summary', async () => {
    setupAllTables();
    const result = await getAdminContentPipelineInsights();
    expect(result.total).toBeGreaterThanOrEqual(1);
  });
});

// ── getMemberAdminInsights ──────────────────────────────────────────────────

describe('getMemberAdminInsights', () => {
  it('returns member insights', async () => {
    setupAllTables();
    const result = await getMemberAdminInsights();
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  it('returns empty insights on error', async () => {
    resetClient({ error: { message: 'query failed' } });
    const result = await getMemberAdminInsights();
    expect(result.total).toBe(0);
  });
});

// ── getMessageAdminInsights ─────────────────────────────────────────────────

describe('getMessageAdminInsights', () => {
  it('returns message insights', async () => {
    setupAllTables();
    const result = await getMessageAdminInsights();
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  it('returns empty insights on error', async () => {
    resetClient({ error: { message: 'query failed' } });
    const result = await getMessageAdminInsights();
    expect(result.total).toBe(0);
  });
});

// ── getSubscriberAdminInsights ──────────────────────────────────────────────

describe('getSubscriberAdminInsights', () => {
  it('returns subscriber insights', async () => {
    setupAllTables();
    const result = await getSubscriberAdminInsights();
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  it('returns empty insights on error', async () => {
    resetClient({ error: { message: 'query failed' } });
    const result = await getSubscriberAdminInsights();
    expect(result.total).toBe(0);
  });
});

// ── getAdminCommandCenterSnapshot ───────────────────────────────────────────

describe('getAdminCommandCenterSnapshot', () => {
  it('returns full snapshot with counts, pipeline, activity, members, messages, subscribers', async () => {
    setupAllTables();
    const result = await getAdminCommandCenterSnapshot();
    expect(result.counts.articles.total).toBeGreaterThanOrEqual(0);
    expect(result.pipeline.total).toBeGreaterThanOrEqual(1);
    expect(result.activity.length).toBeGreaterThanOrEqual(1);
    expect(result.members.total).toBeGreaterThanOrEqual(1);
  });
});
