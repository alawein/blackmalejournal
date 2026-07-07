import {
  createMockSupabaseClient,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import { mockArticle } from '../../helpers/fixtures';
import type { AdminActivityLog } from '@/lib/supabase/types';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  createAdminActivityLogEntry,
  getAdminActivityLogForEntity,
} from '@/lib/supabase/admin-queries/activity-log';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockAdminActivity: AdminActivityLog = {
  id: 'activity-1',
  actor_user_id: 'member-1',
  actor_email: 'operator@blackmalejournal.com',
  actor_role: 'admin',
  entity_type: 'article',
  entity_id: 'art-1',
  entity_title: 'The Discipline of Morning Routines',
  action: 'updated',
  summary: 'Updated article "The Discipline of Morning Routines": status draft -> published.',
  metadata: {
    previous: {
      title: 'The Discipline of Morning Routines',
      status: 'draft',
    },
    next: {
      title: 'The Discipline of Morning Routines',
      status: 'published',
    },
  },
  created_at: '2026-03-25T10:00:00Z',
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

// ── createAdminActivityLogEntry ─────────────────────────────────────────────

describe('createAdminActivityLogEntry', () => {
  it('inserts a log entry and returns it', async () => {
    resetClient({ data: mockAdminActivity });
    mockClient._queryChain.single.mockResolvedValue({ data: mockAdminActivity, error: null });

    const result = await createAdminActivityLogEntry({
      actor_user_id: 'member-1',
      actor_email: 'operator@blackmalejournal.com',
      actor_role: 'admin',
      entity_type: 'article',
      entity_id: 'art-1',
      entity_title: mockArticle.title,
      action: 'updated',
      summary: mockAdminActivity.summary,
      metadata: mockAdminActivity.metadata,
    });

    expect(result).toEqual(mockAdminActivity);
    expect(mockClient.from).toHaveBeenCalledWith('admin_activity_log');
    expect(mockClient._queryChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_email: 'operator@blackmalejournal.com',
        actor_role: 'admin',
        entity_type: 'article',
        entity_id: 'art-1',
        entity_title: mockArticle.title,
        action: 'updated',
        summary: mockAdminActivity.summary,
        metadata: mockAdminActivity.metadata,
      }),
    );
  });

  it('returns null on insert error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'insert failed' } });

    const result = await createAdminActivityLogEntry({
      actor_user_id: null,
      actor_email: 'operator@blackmalejournal.com',
      actor_role: 'editor',
      entity_type: 'dispatch',
      entity_id: 'dispatch-1',
      entity_title: 'Dispatch title',
      action: 'created',
      summary: 'Created dispatch "Dispatch title".',
    });

    expect(result).toBeNull();
  });

  it('defaults metadata to empty object when not provided', async () => {
    resetClient({ data: mockAdminActivity });
    mockClient._queryChain.single.mockResolvedValue({ data: mockAdminActivity, error: null });

    await createAdminActivityLogEntry({
      actor_user_id: 'member-1',
      actor_email: 'operator@blackmalejournal.com',
      actor_role: 'admin',
      entity_type: 'article',
      entity_id: 'art-1',
      entity_title: 'Test',
      action: 'created',
      summary: 'Created article',
    });

    expect(mockClient._queryChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: {} }),
    );
  });
});

// ── getAdminActivityLogForEntity ────────────────────────────────────────────

describe('getAdminActivityLogForEntity', () => {
  it('returns activity ordered by created_at desc for one entity', async () => {
    setData([mockAdminActivity]);

    const result = await getAdminActivityLogForEntity('article', 'art-1', 5);

    expect(result).toEqual([mockAdminActivity]);
    expect(mockClient.from).toHaveBeenCalledWith('admin_activity_log');
    expect(mockClient._queryChain.eq).toHaveBeenNthCalledWith(1, 'entity_type', 'article');
    expect(mockClient._queryChain.eq).toHaveBeenNthCalledWith(2, 'entity_id', 'art-1');
    expect(mockClient._queryChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockClient._queryChain.limit).toHaveBeenCalledWith(5);
  });

  it('uses default limit of 8', async () => {
    setData([]);
    await getAdminActivityLogForEntity('article', 'art-1');
    expect(mockClient._queryChain.limit).toHaveBeenCalledWith(8);
  });

  it('returns empty array on query error', async () => {
    setError('query failed');

    const result = await getAdminActivityLogForEntity('article', 'art-1');

    expect(result).toEqual([]);
  });
});
