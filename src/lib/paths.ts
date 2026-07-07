import { SITE_URL } from '@/lib/site-url';

export const PATHS = {
  HOME: '/',
  ABOUT: '/about',
  ABOUT_ETHICS: '/about/ethics',
  ACADEMY: '/academy',
  VIDEO: '/video',
  BLOG: '/blog',
  ARTICLES: '/articles',
  BRIEFINGS: '/briefings',
  HANDBOOKS: '/handbooks',
  DOWNLOADS: '/downloads',
  RECORDS: '/records',
  PRICING: '/pricing',
  CONTACT: '/contact',
  SUPPORT: '/support',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SEARCH: '/search',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PORTAL: '/portal',
  PORTAL_BOOKMARKS: '/portal/bookmarks',
  PORTAL_SETTINGS: '/portal/settings',
  ADMIN: '/admin',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_BRIEFINGS: '/admin/briefings',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_DISPATCHES: '/admin/dispatches',
  ADMIN_DOWNLOADS: '/admin/downloads',
  ADMIN_HANDBOOKS: '/admin/handbooks',
  ADMIN_MEMBERS: '/admin/members',
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_SUBSCRIBERS: '/admin/subscribers',
  ADMIN_ARTICLES_NEW: '/admin/articles/new',
  ADMIN_BRIEFINGS_NEW: '/admin/briefings/new',
  ADMIN_COURSES_NEW: '/admin/courses/new',
  ADMIN_DISPATCHES_NEW: '/admin/dispatches/new',
  ADMIN_DOWNLOADS_NEW: '/admin/downloads/new',
  ADMIN_HANDBOOKS_NEW: '/admin/handbooks/new',
  ADMIN_CAMPAIGNS: '/admin/campaigns',
  ADMIN_CAMPAIGNS_NEW: '/admin/campaigns/new',
  AUTH_CALLBACK: '/auth/callback',
} as const;

export function adminEditPath(section: string, id: string): string {
  return `${PATHS.ADMIN}/${section}/${id}/edit`;
}

/** Public detail URLs — keep in sync with App Router segments under `(public)/`. */
export function articlePath(slug: string): string {
  return `${PATHS.ARTICLES}/${slug}`;
}

export function briefingPath(slug: string): string {
  return `${PATHS.BRIEFINGS}/${slug}`;
}

/** Dispatches (blog route). */
export function dispatchPath(slug: string): string {
  return `${PATHS.BLOG}/${slug}`;
}

export function handbookPath(slug: string): string {
  return `${PATHS.HANDBOOKS}/${slug}`;
}

export function academyCoursePath(slug: string): string {
  return `${PATHS.ACADEMY}/${slug}`;
}

export function academyLessonPath(courseSlug: string, lessonSlug: string): string {
  return `${PATHS.ACADEMY}/${courseSlug}/${lessonSlug}`;
}

/** Canonical absolute URL for an internal path (`/` → `SITE_URL` without double slash). */
export function siteAbsoluteUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`siteAbsoluteUrl: expected path starting with /, got "${path}"`);
  }
  if (path === '/') {
    return SITE_URL;
  }
  return `${SITE_URL}${path}`;
}

export function normalizeInternalPath(
  value: FormDataEntryValue | string | undefined | null,
  fallback: string = PATHS.PORTAL,
): string {
  if (typeof value !== 'string') return fallback;

  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, 'http://bmj.local');
    if (parsed.origin !== 'http://bmj.local') return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function withQuery(
  pathname: string,
  params: Record<string, string | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value);
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function appendQuery(
  pathname: string,
  params: Record<string, string | undefined>,
): string {
  const normalized = normalizeInternalPath(pathname, pathname);

  try {
    const parsed = new URL(normalized, 'http://bmj.local');

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        parsed.searchParams.set(key, value);
      } else {
        parsed.searchParams.delete(key);
      }
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return withQuery(normalized, params);
  }
}

export function withOptionalNext(pathname: string, nextHref?: string): string {
  return withQuery(pathname, { next: nextHref });
}
