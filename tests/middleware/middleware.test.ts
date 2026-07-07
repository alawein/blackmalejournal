/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { PATHS } from '@/lib/paths';

const mockGetUser = jest.fn();
const mockSingle = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn().mockImplementation(
    (
      _url: string,
      _key: string,
      options: {
        cookies: {
          setAll: (
            cookies: Array<{
              name: string;
              value: string;
              options?: Record<string, unknown>;
            }>
          ) => void;
        };
      }
    ) => {
      // Simulate Supabase refreshing cookies by calling setAll
      if (options?.cookies?.setAll) {
        options.cookies.setAll([
          {
            name: 'sb-access-token',
            value: 'refreshed-token',
            options: { path: '/' },
          },
        ]);
      }
      return {
        auth: { getUser: mockGetUser },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: mockSingle,
            }),
          }),
        }),
      };
    }
  ),
}));

// Set required env vars before importing proxy
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

import { proxy, config } from '@/proxy';

function createNextRequest(pathname: string): NextRequest {
  const url = new URL(pathname, 'http://localhost:3000');
  return new NextRequest(url);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('proxy', () => {
  describe('protected routes (unauthenticated)', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
    });

    it('redirects unauthenticated user from /portal to /login?redirect=/portal', async () => {
      const response = await proxy(createNextRequest('/portal'));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=%2Fportal');
    });

    it('redirects unauthenticated user from /portal/settings to /login?redirect=/portal/settings', async () => {
      const response = await proxy(createNextRequest('/portal/settings'));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=%2Fportal%2Fsettings');
    });
  });

  describe('protected routes (authenticated)', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
    });

    it('allows authenticated user to access /portal', async () => {
      const response = await proxy(createNextRequest('/portal'));

      // NextResponse.next() returns a 200
      expect(response.status).toBe(200);
    });
  });

  describe('admin routes (unauthenticated)', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
    });

    it('redirects unauthenticated user from /admin to /login?redirect=/admin', async () => {
      const response = await proxy(createNextRequest(PATHS.ADMIN));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=%2Fadmin');
    });
  });

  describe('admin routes (authenticated)', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
    });

    it('allows authenticated user with admin role to access /admin', async () => {
      mockSingle.mockResolvedValue({ data: { role: 'admin' } });

      const response = await proxy(createNextRequest(PATHS.ADMIN));
      expect(response.status).toBe(200);
    });

    it('allows authenticated user with editor role to access /admin', async () => {
      mockSingle.mockResolvedValue({ data: { role: 'editor' } });

      const response = await proxy(createNextRequest(PATHS.ADMIN));
      expect(response.status).toBe(200);
    });

    it('redirects authenticated user with member role from /admin to /portal?error=unauthorized', async () => {
      mockSingle.mockResolvedValue({ data: { role: 'member' } });

      const response = await proxy(createNextRequest(PATHS.ADMIN));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/portal');
      expect(location).toContain('error=unauthorized');
    });

    it('redirects when member query returns no data (null)', async () => {
      mockSingle.mockResolvedValue({ data: null });

      const response = await proxy(createNextRequest(PATHS.ADMIN));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/portal');
      expect(location).toContain('error=unauthorized');
    });

    it('allows admin to access nested /admin/articles route', async () => {
      mockSingle.mockResolvedValue({ data: { role: 'admin' } });

      const response = await proxy(createNextRequest(PATHS.ADMIN_ARTICLES));
      expect(response.status).toBe(200);
    });

    it('redirects member from nested /admin/articles route', async () => {
      mockSingle.mockResolvedValue({ data: { role: 'member' } });

      const response = await proxy(createNextRequest(PATHS.ADMIN_ARTICLES));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/portal');
      expect(location).toContain('error=unauthorized');
    });
  });

  describe('auth pages (authenticated)', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
    });

    it('redirects authenticated user from /login to /portal', async () => {
      const response = await proxy(createNextRequest('/login'));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/portal');
    });

    it('redirects authenticated user from /signup to /portal', async () => {
      const response = await proxy(createNextRequest('/signup'));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/portal');
    });
  });

  describe('public routes (unauthenticated)', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
    });

    it('passes through for / (home page)', async () => {
      const response = await proxy(createNextRequest('/'));
      expect(response.status).toBe(200);
    });

    it('passes through for /articles', async () => {
      const response = await proxy(createNextRequest('/articles'));
      expect(response.status).toBe(200);
    });
  });

  describe('cookie propagation', () => {
    it('response contains updated cookies set by Supabase client', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const response = await proxy(createNextRequest('/'));
      const setCookie = response.headers.get('set-cookie');

      expect(setCookie).toContain('sb-access-token');
      expect(setCookie).toContain('refreshed-token');
    });
  });
});

describe('config.matcher', () => {
  const matcherRegex = new RegExp(config.matcher[0]);

  it('matches /portal path', () => {
    expect(matcherRegex.test('/portal')).toBe(true);
  });

  it('matches /login path', () => {
    expect(matcherRegex.test('/login')).toBe(true);
  });

  it('does NOT match static asset paths', () => {
    expect(matcherRegex.test('/logo.svg')).toBe(false);
    expect(matcherRegex.test('/icon.svg')).toBe(false);
    expect(matcherRegex.test('/photo.jpg')).toBe(false);
    expect(matcherRegex.test('/image.webp')).toBe(false);
  });
});
