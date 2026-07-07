import { getAllMembers, getMemberCount } from '@/lib/supabase/admin-queries';

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  })),
}));

describe('admin member queries', () => {
  it('getAllMembers is exported and callable', () => {
    expect(typeof getAllMembers).toBe('function');
  });

  it('getMemberCount is exported and callable', () => {
    expect(typeof getMemberCount).toBe('function');
  });
});
