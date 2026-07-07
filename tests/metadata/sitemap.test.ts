jest.mock('@/lib/site-url', () => ({
  SITE_URL: 'https://blackmalejournal.com',
  resolveSiteUrl: () => 'https://blackmalejournal.com',
}));

const mockGetArticlesForListing = jest.fn();
const mockGetBriefingsForSitemap = jest.fn();
const mockGetCourses = jest.fn();
const mockGetDispatchesForListing = jest.fn();
const mockGetHandbooksForSitemap = jest.fn();
const mockGetLessonsByCourse = jest.fn();

jest.mock('@/lib/supabase/queries', () => ({
  getArticlesForListing: (...args: unknown[]) => mockGetArticlesForListing(...args),
  getBriefingsForSitemap: (...args: unknown[]) =>
    mockGetBriefingsForSitemap(...args),
  getCourses: (...args: unknown[]) => mockGetCourses(...args),
  getDispatchesForListing: (...args: unknown[]) =>
    mockGetDispatchesForListing(...args),
  getHandbooksForSitemap: (...args: unknown[]) =>
    mockGetHandbooksForSitemap(...args),
  getLessonsByCourse: (...args: unknown[]) => mockGetLessonsByCourse(...args),
}));

import sitemap from '@/app/sitemap';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetArticlesForListing.mockResolvedValue([]);
  mockGetBriefingsForSitemap.mockResolvedValue([]);
  mockGetCourses.mockResolvedValue([]);
  mockGetDispatchesForListing.mockResolvedValue([]);
  mockGetHandbooksForSitemap.mockResolvedValue([]);
  mockGetLessonsByCourse.mockResolvedValue([]);
});

describe('sitemap.ts', () => {
  it('includes all 15 static pages', async () => {
    const result = await sitemap();

    const urls = result.map((entry) => entry.url);
    expect(urls).toContain('https://blackmalejournal.com');
    expect(urls).toContain('https://blackmalejournal.com/articles');
    expect(urls).toContain('https://blackmalejournal.com/briefings');
    expect(urls).toContain('https://blackmalejournal.com/academy');
    expect(urls).toContain('https://blackmalejournal.com/video');
    expect(urls).toContain('https://blackmalejournal.com/blog');
    expect(urls).toContain('https://blackmalejournal.com/about');
    expect(urls).toContain('https://blackmalejournal.com/handbooks');
    expect(urls).toContain('https://blackmalejournal.com/downloads');
    expect(urls).toContain('https://blackmalejournal.com/records');
    expect(urls).toContain('https://blackmalejournal.com/pricing');
    expect(urls).toContain('https://blackmalejournal.com/contact');
    expect(urls).toContain('https://blackmalejournal.com/support');
    expect(urls).toContain('https://blackmalejournal.com/privacy');
    expect(urls).toContain('https://blackmalejournal.com/terms');
  });

  it('includes dynamic article entries with correct URL format', async () => {
    mockGetArticlesForListing.mockResolvedValue([
      { slug: 'first-article', published_at: '2025-01-01' },
      { slug: 'second-article', published_at: '2025-02-01' },
    ]);

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain('https://blackmalejournal.com/articles/first-article');
    expect(urls).toContain('https://blackmalejournal.com/articles/second-article');
  });

  it('includes dynamic briefing entries', async () => {
    mockGetBriefingsForSitemap.mockResolvedValue([
      { slug: 'weekend-briefing-001', published_at: '2025-01-15' },
    ]);

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain('https://blackmalejournal.com/briefings/weekend-briefing-001');
  });

  it('includes dynamic course entries under /academy/', async () => {
    mockGetCourses.mockResolvedValue([
      { slug: 'discipline-101', created_at: '2025-03-01' },
    ]);

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain('https://blackmalejournal.com/academy/discipline-101');
  });

  it('includes dynamic dispatch entries under /blog/', async () => {
    mockGetDispatchesForListing.mockResolvedValue([
      { slug: 'weekly-dispatch-5', published_at: '2025-04-01' },
    ]);

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain('https://blackmalejournal.com/blog/weekly-dispatch-5');
  });

  it('includes dynamic handbook entries under /handbooks/', async () => {
    mockGetHandbooksForSitemap.mockResolvedValue([
      { slug: 'discipline-codex', published_at: '2026-03-01' },
    ]);

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain('https://blackmalejournal.com/handbooks/discipline-codex');
  });

  it('includes dynamic lesson entries under /academy/[course]/[lesson]', async () => {
    mockGetCourses.mockResolvedValue([
      { id: 'c1', slug: 'combat-discipline', created_at: '2026-01-01' },
    ]);
    mockGetLessonsByCourse.mockResolvedValue([
      { slug: 'morning-protocol' },
      { slug: 'bodyweight-mastery' },
    ]);

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain('https://blackmalejournal.com/academy/combat-discipline/morning-protocol');
    expect(urls).toContain('https://blackmalejournal.com/academy/combat-discipline/bodyweight-mastery');
  });

  it('calls queries with correct params', async () => {
    await sitemap();

    expect(mockGetArticlesForListing).toHaveBeenCalledWith({ limit: 500 });
    expect(mockGetBriefingsForSitemap).toHaveBeenCalledWith({ limit: 200 });
    expect(mockGetCourses).toHaveBeenCalledWith({ published: true });
    expect(mockGetDispatchesForListing).toHaveBeenCalledWith({ limit: 500 });
    expect(mockGetHandbooksForSitemap).toHaveBeenCalledWith({ limit: 200 });
  });
});
