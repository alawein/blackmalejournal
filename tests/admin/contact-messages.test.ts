import { getAllContactSubmissions } from '@/lib/supabase/admin-queries';

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue({ data: [], error: null }),
  })),
}));

describe('admin contact queries', () => {
  it('getAllContactSubmissions is exported and callable', () => {
    expect(typeof getAllContactSubmissions).toBe('function');
  });
});
