import { getAllSubscribers } from '@/lib/supabase/admin-queries';

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue({ data: [], error: null }),
  })),
}));

describe('admin subscriber queries', () => {
  it('getAllSubscribers is exported and callable', () => {
    expect(typeof getAllSubscribers).toBe('function');
  });
});
