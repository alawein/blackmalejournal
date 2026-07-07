import { getLatestDispatches } from '@/lib/supabase/queries';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

const mockSelect = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();
const mockIn = jest.fn();
const mockLte = jest.fn();

function setupChain(data: unknown[] | null, error: { message: string } | null = null) {
  const chain = {
    order: mockOrder,
    limit: mockLimit,
    in: mockIn,
    lte: mockLte,
  };

  mockLte.mockImplementation(() => Promise.resolve({ data, error }));
  mockIn.mockReturnValue(chain);
  mockLimit.mockReturnValue(chain);
  mockOrder.mockReturnValue(chain);
  mockSelect.mockReturnValue(chain);
  (createClient as jest.Mock).mockResolvedValue({
    from: jest.fn(() => ({ select: mockSelect })),
  });
}

describe('getLatestDispatches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns dispatches with default limit of 3', async () => {
    const mockData = [
      {
        id: '1',
        title: 'D1',
        slug: 'd1',
        lens: 'health',
        excerpt: '',
        published_at: '2026-03-18',
      },
    ];
    setupChain(mockData);

    const result = await getLatestDispatches();
    expect(result).toEqual(mockData);
    expect(mockLimit).toHaveBeenCalledWith(3);
    expect(mockIn).toHaveBeenCalledWith('status', ['published', 'scheduled']);
    expect(mockLte).toHaveBeenCalledWith('published_at', expect.any(String));
  });

  it('respects custom limit', async () => {
    setupChain([]);
    await getLatestDispatches(5);
    expect(mockLimit).toHaveBeenCalledWith(5);
  });

  it('returns empty array on error', async () => {
    setupChain(null, { message: 'fail' });
    const result = await getLatestDispatches();
    expect(result).toEqual([]);
  });
});
