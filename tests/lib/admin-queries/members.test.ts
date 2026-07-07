import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import { mockMember } from '../../helpers/fixtures';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllMembers,
  getAdminMemberById,
  updateAdminMember,
  countAdminMembers,
  getMemberCount,
} from '@/lib/supabase/admin-queries/members';

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

// ── getAllMembers ────────────────────────────────────────────────────────────

describe('getAllMembers', () => {
  it('returns members on success', async () => {
    setData([mockMember]);
    const result = await getAllMembers();
    expect(result).toEqual([mockMember]);
    expect(mockClient.from).toHaveBeenCalledWith('members');
  });

  it('applies tier and role filters', async () => {
    setData([mockMember]);
    await getAllMembers({ tier: 'free', role: 'member' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('tier', 'free');
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('role', 'member');
  });

  it('applies email search via ilike', async () => {
    setData([mockMember]);
    await getAllMembers({ query: 'member@' });
    expect(mockClient._queryChain.ilike).toHaveBeenCalledWith('email', '%member@%');
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllMembers();
    expect(result).toEqual([]);
  });
});

// ── getAdminMemberById ──────────────────────────────────────────────────────

describe('getAdminMemberById', () => {
  it('returns member on success', async () => {
    setSingleData(mockMember);
    const result = await getAdminMemberById('mem-1');
    expect(result?.id).toBe('mem-1');
  });

  it('returns null on error', async () => {
    setSingleError('not found');
    const result = await getAdminMemberById('missing');
    expect(result).toBeNull();
  });
});

// ── updateAdminMember ───────────────────────────────────────────────────────

describe('updateAdminMember', () => {
  it('updates member tier', async () => {
    setSingleData(mockMember);
    const result = await updateAdminMember('mem-1', { tier: 'basic' });
    expect(result?.tier).toBe('free'); // returns mock data
    expect(mockClient._queryChain.update).toHaveBeenCalledWith({ tier: 'basic' });
  });

  it('returns null on error', async () => {
    setSingleError('update failed');
    const result = await updateAdminMember('mem-1', { tier: 'premium' });
    expect(result).toBeNull();
  });
});

// ── countAdminMembers ───────────────────────────────────────────────────────

describe('countAdminMembers', () => {
  it('returns count of admin members', async () => {
    resetClient();
    setFromSequence(mockClient, [{ table: 'members', count: 3 }]);
    const result = await countAdminMembers();
    expect(result).toBe(3);
  });

  it('returns 0 on error', async () => {
    resetClient();
    setFromSequence(mockClient, [{ table: 'members', error: { message: 'count failed' }, count: null }]);
    const result = await countAdminMembers();
    expect(result).toBe(0);
  });
});

// ── getMemberCount ──────────────────────────────────────────────────────────

describe('getMemberCount', () => {
  it('returns total member count', async () => {
    resetClient();
    setFromSequence(mockClient, [{ table: 'members', count: 42 }]);
    const result = await getMemberCount();
    expect(result).toBe(42);
  });

  it('returns 0 on error', async () => {
    resetClient();
    setFromSequence(mockClient, [{ table: 'members', error: { message: 'count failed' }, count: null }]);
    const result = await getMemberCount();
    expect(result).toBe(0);
  });
});
