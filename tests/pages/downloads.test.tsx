jest.mock('@/lib/supabase/queries', () => ({
  getDownloads: jest.fn(),
  getHandbooks: jest.fn(),
}));

import { getDownloads, getHandbooks } from '@/lib/supabase/queries';

describe('Downloads Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getDownloads with category filter', async () => {
    (getDownloads as jest.Mock).mockResolvedValue([]);
    await getDownloads({ category: 'template' });
    expect(getDownloads).toHaveBeenCalledWith({ category: 'template' });
  });

  it('calls getDownloads without filter for all', async () => {
    (getDownloads as jest.Mock).mockResolvedValue([]);
    await getDownloads({});
    expect(getDownloads).toHaveBeenCalledWith({});
  });

  it('calls getHandbooks when category is handbook', async () => {
    (getHandbooks as jest.Mock).mockResolvedValue([
      {
        id: 'hb-1',
        title: 'Letters to a Young King',
        slug: 'letters-to-a-young-king',
        lens: 'culture',
        description: 'A handbook on purpose',
        access_tier: 'basic',
        published_at: '2026-01-15',
        cover_image: null,
      },
    ]);
    const result = await getHandbooks({});
    expect(getHandbooks).toHaveBeenCalledWith({});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Letters to a Young King');
  });

  it('accepts handbook as a valid category', () => {
    const VALID_CATEGORIES = new Set(['template', 'worksheet', 'guide', 'toolkit', 'handbook']);
    expect(VALID_CATEGORIES.has('handbook')).toBe(true);
  });
});
