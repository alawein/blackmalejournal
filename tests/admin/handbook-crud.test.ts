import {
  getAllHandbooks,
  getHandbookById,
  createHandbook,
  updateHandbook,
  deleteHandbook,
} from '@/lib/supabase/admin-queries';

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  })),
}));

describe('admin handbook queries', () => {
  it('getAllHandbooks is exported and callable', () => {
    expect(typeof getAllHandbooks).toBe('function');
  });

  it('getHandbookById is exported and callable', () => {
    expect(typeof getHandbookById).toBe('function');
  });

  it('createHandbook is exported and callable', () => {
    expect(typeof createHandbook).toBe('function');
  });

  it('updateHandbook is exported and callable', () => {
    expect(typeof updateHandbook).toBe('function');
  });

  it('deleteHandbook is exported and callable', () => {
    expect(typeof deleteHandbook).toBe('function');
  });
});
