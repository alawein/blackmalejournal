jest.mock('@/lib/site-url', () => ({
  SITE_URL: 'https://bmj.test',
  resolveSiteUrl: () => 'https://bmj.test',
}));

import {
  PATHS,
  articlePath,
  briefingPath,
  dispatchPath,
  handbookPath,
  academyCoursePath,
  academyLessonPath,
  siteAbsoluteUrl,
} from '@/lib/paths';

describe('content path helpers', () => {
  it('builds stable public detail URLs', () => {
    expect(articlePath('a-b')).toBe(`${PATHS.ARTICLES}/a-b`);
    expect(briefingPath('wk-1')).toBe(`${PATHS.BRIEFINGS}/wk-1`);
    expect(dispatchPath('d-1')).toBe(`${PATHS.BLOG}/d-1`);
    expect(handbookPath('h-1')).toBe(`${PATHS.HANDBOOKS}/h-1`);
    expect(academyCoursePath('c-1')).toBe(`${PATHS.ACADEMY}/c-1`);
    expect(academyLessonPath('c-1', 'l-1')).toBe(`${PATHS.ACADEMY}/c-1/l-1`);
  });
});

describe('siteAbsoluteUrl', () => {
  it('returns SITE_URL for root without double slash', () => {
    expect(siteAbsoluteUrl('/')).toBe('https://bmj.test');
  });

  it('joins SITE_URL with internal paths', () => {
    expect(siteAbsoluteUrl(PATHS.ARTICLES)).toBe('https://bmj.test/articles');
    expect(siteAbsoluteUrl(articlePath('x'))).toBe('https://bmj.test/articles/x');
  });

  it('throws when path does not start with /', () => {
    expect(() => siteAbsoluteUrl('articles')).toThrow(/expected path starting with \//);
  });
});
