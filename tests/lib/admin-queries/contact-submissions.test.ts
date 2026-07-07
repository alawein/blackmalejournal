import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import type { ContactSubmission } from '@/lib/supabase/types';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllContactSubmissions,
  updateContactSubmission,
  getContactSubmissionCounts,
} from '@/lib/supabase/admin-queries/contact-submissions';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockSubmission: ContactSubmission = {
  id: 'msg-1',
  name: 'Marcus',
  email: 'marcus@example.com',
  subject: 'Question',
  message: 'Need support details.',
  status: 'new',
  internal_notes: null,
  handled_at: null,
  handled_by: null,
  submitted_at: '2026-03-21T00:00:00Z',
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

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

// ── getAllContactSubmissions ─────────────────────────────────────────────────

describe('getAllContactSubmissions', () => {
  it('returns submissions on success', async () => {
    setData([mockSubmission]);
    const result = await getAllContactSubmissions();
    expect(result).toEqual([mockSubmission]);
    expect(mockClient.from).toHaveBeenCalledWith('contact_submissions');
  });

  it('applies status filter', async () => {
    setData([mockSubmission]);
    await getAllContactSubmissions({ status: 'new' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('status', 'new');
  });

  it('applies search query filter across multiple fields', async () => {
    setData([mockSubmission]);
    await getAllContactSubmissions({ query: 'support' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('internal_notes.ilike.%support%'),
    );
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllContactSubmissions();
    expect(result).toEqual([]);
  });
});

// ── updateContactSubmission ─────────────────────────────────────────────────

describe('updateContactSubmission', () => {
  it('sets handled_at when status transitions from new to in_progress', async () => {
    setSingleData(mockSubmission);
    await updateContactSubmission('msg-1', {
      status: 'in_progress',
      handled_by: 'admin-1',
    });
    const payload = mockClient._queryChain.update.mock.calls[0][0];
    expect(payload.handled_at).toEqual(expect.any(String));
    expect(payload.handled_by).toBe('admin-1');
  });

  it('sets handled_at when status transitions to resolved', async () => {
    setSingleData(mockSubmission);
    await updateContactSubmission('msg-1', {
      status: 'resolved',
      internal_notes: '  handled  ',
      handled_by: 'admin-1',
    });
    const payload = mockClient._queryChain.update.mock.calls[0][0];
    expect(payload.internal_notes).toBe('handled');
    expect(payload.handled_at).toEqual(expect.any(String));
  });

  it('clears handled_at when status reverts to new', async () => {
    setSingleData(mockSubmission);
    await updateContactSubmission('msg-1', {
      status: 'new',
      internal_notes: '   ',
    });
    const payload = mockClient._queryChain.update.mock.calls[0][0];
    expect(payload.internal_notes).toBeNull();
    expect(payload.handled_at).toBeNull();
  });

  it('returns null on error', async () => {
    resetClient();
    mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message: 'update failed' } });
    const result = await updateContactSubmission('msg-1', { status: 'resolved' });
    expect(result).toBeNull();
  });
});

// ── getContactSubmissionCounts ──────────────────────────────────────────────

describe('getContactSubmissionCounts', () => {
  it('returns status counts', async () => {
    resetClient();
    setFromSequence(mockClient, [
      { table: 'contact_submissions', count: 10 },
      { table: 'contact_submissions', count: 4 },
      { table: 'contact_submissions', count: 3 },
      { table: 'contact_submissions', count: 2 },
      { table: 'contact_submissions', count: 1 },
    ]);
    const result = await getContactSubmissionCounts();
    expect(result).toEqual({
      total: 10,
      new: 4,
      in_progress: 3,
      resolved: 2,
      spam: 1,
    });
  });

  it('returns zeros when counts are null', async () => {
    resetClient();
    setFromSequence(mockClient, [
      { table: 'contact_submissions', count: null },
      { table: 'contact_submissions', count: null },
      { table: 'contact_submissions', count: null },
      { table: 'contact_submissions', count: null },
      { table: 'contact_submissions', count: null },
    ]);
    const result = await getContactSubmissionCounts();
    expect(result).toEqual({
      total: 0,
      new: 0,
      in_progress: 0,
      resolved: 0,
      spam: 0,
    });
  });
});
