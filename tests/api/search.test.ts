/** @jest-environment node */
let _ipCounter = 0;
jest.mock('next/headers', () => ({
  headers: () => Promise.resolve(new Map([['x-forwarded-for', `10.0.0.${++_ipCounter}`]])),
}));

import { GET } from '@/app/api/search/route';

const mockSearchContentFTS = jest.fn().mockResolvedValue([
  { type: 'article', title: 'Test', slug: 'test', excerpt: 'Excerpt', lens: 'health', publishedAt: '2026-01-01' },
]);

jest.mock('@/lib/supabase/queries', () => ({
  searchContentFTS: (...args: unknown[]) => mockSearchContentFTS(...args),
}));

describe('GET /api/search', () => {
  beforeEach(() => {
    mockSearchContentFTS.mockClear();
  });

  test('returns 400 for missing query param', async () => {
    const req = new Request('http://localhost:3000/api/search');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('returns 400 for query shorter than 2 chars', async () => {
    const req = new Request('http://localhost:3000/api/search?q=a');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('returns results for valid query', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.results).toHaveLength(1);
    expect(data.query).toBe('test');
  });

  test('passes lens filter to FTS', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&lens=health,politics');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockSearchContentFTS).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({ lens: ['health', 'politics'] }),
    );
  });

  test('passes type filter to FTS', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&type=article,briefing');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockSearchContentFTS).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({ types: ['article', 'briefing'] }),
    );
  });

  test('passes sort param to FTS', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&sort=date');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockSearchContentFTS).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({ sort: 'date' }),
    );
  });

  test('strips invalid lens values and passes undefined when none remain', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&lens=bogus,fake');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockSearchContentFTS).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({ lens: undefined }),
    );
  });

  test('strips invalid lens values but keeps valid ones', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&lens=health,bogus');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockSearchContentFTS).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({ lens: ['health'] }),
    );
  });

  test('defaults sort to relevance and limit to 30', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test');
    await GET(req);
    expect(mockSearchContentFTS).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({ sort: 'relevance', limit: 30 }),
    );
  });

  test('caps limit at 50', async () => {
    const req = new Request('http://localhost:3000/api/search?q=test&limit=100');
    await GET(req);
    expect(mockSearchContentFTS).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({ limit: 50 }),
    );
  });
});
