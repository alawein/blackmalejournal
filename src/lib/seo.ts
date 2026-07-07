// src/lib/seo.ts

export { SITE_URL } from '@/lib/site-url';
import { PATHS, siteAbsoluteUrl } from '@/lib/paths';

// ── Site constants ──────────────────────────────────────────────────────────
export const SITE_NAME = 'The Black Male Journal';
export const SITE_DESCRIPTION =
  'Independent media house and revolutionary masculinist platform covering five lenses of Black male life.';
export const SITE_AUTHOR = 'The Chairman';
export const SITE_TAGLINE = 'Speak the Truth. Navigate the Consequences.';

export const CONTACT_EMAILS = {
  general: 'chairman@blackmalejournal.org',
  privacy: 'privacy@blackmalejournal.org',
  support: 'contact@blackmalejournal.org',
} as const;

/** CashApp / Venmo / PayPal — contact SupportCard + `/support` AlternativeMethods (single source). */
export const SUPPORT_PAYMENT_METHODS = [
  {
    label: 'CashApp',
    handle: '$BlackMaleJournal',
    href: 'https://cash.app/$BlackMaleJournal',
    description: 'Tap to open CashApp',
  },
  {
    label: 'Venmo',
    handle: '@BlackMaleJournal',
    href: 'https://venmo.com/BlackMaleJournal',
    description: 'Tap to open Venmo',
  },
  {
    label: 'PayPal',
    handle: 'paypal.me/BlackMaleJournal',
    href: 'https://paypal.me/BlackMaleJournal',
    description: 'One-time or recurring',
  },
] as const;

export const SUPPORT_PATREON_URL = 'https://patreon.com/BlackMaleJournal' as const;

// ── JSON-LD: Organization ───────────────────────────────────────────────────
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteAbsoluteUrl(PATHS.HOME),
    logo: siteAbsoluteUrl('/logos/primary-color.png'),
    description: SITE_DESCRIPTION,
    founder: {
      '@type': 'Person',
      name: SITE_AUTHOR,
    },
    sameAs: [],
  };
}

// ── JSON-LD: Article (works for articles, dispatches, briefings) ────────────
export function articleJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  publishedAt: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    ...(opts.imageUrl ? { image: opts.imageUrl } : {}),
    datePublished: opts.publishedAt,
    author: {
      '@type': 'Person',
      name: opts.author ?? SITE_AUTHOR,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: siteAbsoluteUrl('/logos/primary-color.png'),
      },
    },
  };
}

// ── Dynamic OG image URLs ───────────────────────────────────────────────────

/**
 * Build a URL pointing at the dynamic OG image route for a piece of content.
 * Call from `generateMetadata` and spread into `openGraph.images` /
 * `twitter.images`. The endpoint lives at `/api/og` (see route.tsx).
 */
export function dynamicOgImageUrl(opts: {
  title: string;
  type?: 'article' | 'briefing' | 'dispatch' | 'handbook' | 'course';
  lens?: string | null;
  author?: string | null;
}): string {
  const params = new URLSearchParams();
  params.set('title', opts.title);
  if (opts.type) params.set('type', opts.type);
  if (opts.lens) params.set('lens', opts.lens);
  if (opts.author) params.set('author', opts.author);
  return siteAbsoluteUrl(`/api/og?${params.toString()}`);
}

// ── JSON-LD: BreadcrumbList ─────────────────────────────────────────────────
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
