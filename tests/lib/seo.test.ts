import {
  SITE_URL,
  SITE_NAME,
  SITE_AUTHOR,
  SUPPORT_PAYMENT_METHODS,
  SUPPORT_PATREON_URL,
  organizationJsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
} from '@/lib/seo';

// ── support copy SSOT ────────────────────────────────────────────────────────

describe('SUPPORT_PAYMENT_METHODS', () => {
  it('lists CashApp, Venmo, PayPal with stable handles', () => {
    expect(SUPPORT_PAYMENT_METHODS.map((m) => m.label)).toEqual([
      'CashApp',
      'Venmo',
      'PayPal',
    ]);
    expect(SUPPORT_PAYMENT_METHODS[0].handle).toBe('$BlackMaleJournal');
    expect(SUPPORT_PAYMENT_METHODS[1].handle).toBe('@BlackMaleJournal');
  });
});

describe('SUPPORT_PATREON_URL', () => {
  it('points at org Patreon', () => {
    expect(SUPPORT_PATREON_URL).toMatch(/^https:\/\/patreon\.com\//);
  });
});

// ── organizationJsonLd ───────────────────────────────────────────────────────

describe('organizationJsonLd', () => {
  it('returns valid JSON-LD with Organization type', () => {
    const result = organizationJsonLd();
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Organization');
    expect(result.name).toBe(SITE_NAME);
    expect(result.url).toBe(SITE_URL);
  });

  it('includes logo URL derived from SITE_URL', () => {
    const result = organizationJsonLd();
    expect(result.logo).toBe(`${SITE_URL}/logos/primary-color.png`);
  });

  it('includes founder as The Chairman', () => {
    const result = organizationJsonLd();
    expect(result.founder.name).toBe(SITE_AUTHOR);
  });
});

// ── articleJsonLd ────────────────────────────────────────────────────────────

describe('articleJsonLd', () => {
  const baseOpts = {
    title: 'Test Article',
    description: 'A test description',
    url: 'https://blackmalejournal.com/articles/test',
    publishedAt: '2026-03-15',
  };

  it('returns valid JSON-LD with Article type', () => {
    const result = articleJsonLd(baseOpts);
    expect(result['@type']).toBe('Article');
    expect(result.headline).toBe('Test Article');
    expect(result.datePublished).toBe('2026-03-15');
  });

  it('defaults author to SITE_AUTHOR when not provided', () => {
    const result = articleJsonLd(baseOpts);
    expect(result.author.name).toBe(SITE_AUTHOR);
  });

  it('uses custom author when provided', () => {
    const result = articleJsonLd({ ...baseOpts, author: 'Guest Writer' });
    expect(result.author.name).toBe('Guest Writer');
  });

  it('includes image when imageUrl is provided', () => {
    const result = articleJsonLd({ ...baseOpts, imageUrl: '/img/test.jpg' });
    expect(result.image).toBe('/img/test.jpg');
  });

  it('omits image field when imageUrl is null', () => {
    const result = articleJsonLd({ ...baseOpts, imageUrl: null });
    expect(result).not.toHaveProperty('image');
  });

  it('includes publisher with logo', () => {
    const result = articleJsonLd(baseOpts);
    expect(result.publisher.name).toBe(SITE_NAME);
    expect(result.publisher.logo.url).toBe(`${SITE_URL}/logos/primary-color.png`);
  });
});

// ── breadcrumbJsonLd ─────────────────────────────────────────────────────────

describe('breadcrumbJsonLd', () => {
  it('returns BreadcrumbList with 1-indexed positions', () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Articles', url: '/articles' },
      { name: 'Test', url: '/articles/test' },
    ];
    const result = breadcrumbJsonLd(items);

    expect(result['@type']).toBe('BreadcrumbList');
    expect(result.itemListElement).toHaveLength(3);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[2].position).toBe(3);
  });

  it('handles empty items array', () => {
    const result = breadcrumbJsonLd([]);
    expect(result.itemListElement).toHaveLength(0);
  });
});
