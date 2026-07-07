jest.mock('@/lib/site-url', () => ({
  SITE_URL: 'https://blackmalejournal.com',
  resolveSiteUrl: () => 'https://blackmalejournal.com',
}));

import robots from '@/app/robots';

describe('robots.ts', () => {
  it('returns rules allowing / for all user agents', () => {
    const result = robots();

    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: '*',
          allow: '/',
        }),
      ]),
    );
  });

  it('disallows /portal/ and /api/', () => {
    const result = robots();
    const rule = Array.isArray(result.rules)
      ? result.rules.find((r) => r.userAgent === '*')
      : result.rules;

    expect(rule).toBeDefined();
    expect(rule!.disallow).toEqual(expect.arrayContaining(['/portal/', '/api/']));
  });

  it('includes correct sitemap URL', () => {
    const result = robots();
    expect(result.sitemap).toBe('https://blackmalejournal.com/sitemap.xml');
  });
});
