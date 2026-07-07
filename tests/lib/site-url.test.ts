describe('resolveSiteUrl', () => {
  const originalEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  beforeEach(() => {
    jest.resetModules();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL =
      originalEnv.VERCEL_PROJECT_PRODUCTION_URL;
    process.env.VERCEL_URL = originalEnv.VERCEL_URL;
  });

  it('prefers NEXT_PUBLIC_SITE_URL when present', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://configured.example.com/';

    const { resolveSiteUrl } = await import('@/lib/site-url');

    expect(resolveSiteUrl()).toBe('https://configured.example.com');
  });

  it('falls back to VERCEL_PROJECT_PRODUCTION_URL', async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'blackmalejournal.vercel.app';

    const { resolveSiteUrl } = await import('@/lib/site-url');

    expect(resolveSiteUrl()).toBe('https://blackmalejournal.vercel.app');
  });

  it('falls back to VERCEL_URL when no explicit site URL is set', async () => {
    process.env.VERCEL_URL = 'blackmalejournal-preview.vercel.app';

    const { resolveSiteUrl } = await import('@/lib/site-url');

    expect(resolveSiteUrl()).toBe('https://blackmalejournal-preview.vercel.app');
  });

  it('uses localhost when no environment variables are set', async () => {
    const { resolveSiteUrl } = await import('@/lib/site-url');

    expect(resolveSiteUrl()).toBe('http://localhost:3000');
  });
});
