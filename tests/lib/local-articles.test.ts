/** @jest-environment node */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  getLocalArticleBySlug,
  getLocalArticleTagFacets,
  getLocalArticles,
  getLocalArticlesForListing,
  getLocalFeaturedArticles,
  getLocalLatestArticles,
} from '@/lib/content/local-articles';

function post(
  fields: Record<string, string>,
  body = 'Body text.',
): string {
  const head = Object.entries(fields)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  return `---\n${head}\n---\n${body}\n`;
}

describe('local articles', () => {
  let dir: string;
  const originalDir = process.env.ARTICLES_DIR;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'bmj-articles-'));
    process.env.ARTICLES_DIR = dir;
    jest.spyOn(console, 'error').mockImplementation(() => {});

    writeFileSync(
      path.join(dir, 'older.md'),
      post({
        title: 'Older piece',
        lens: 'health',
        tags: '[sleep, habits]',
        excerpt: 'An older excerpt.',
        published_at: '2026-01-10T00:00:00Z',
      }),
    );
    writeFileSync(
      path.join(dir, 'newer.md'),
      post(
        {
          title: '"Newer: piece"',
          slug: 'newer-custom',
          lens: 'politics',
          tags: '[voting]',
          featured: 'true',
          access_tier: 'premium',
          author: 'A. Writer',
          published_at: '2026-02-01T00:00:00Z',
        },
        'First paragraph.\n\nSecond paragraph.',
      ),
    );
    writeFileSync(
      path.join(dir, 'draft.md'),
      post({
        title: 'Draft piece',
        lens: 'health',
        status: 'draft',
        published_at: '2026-01-20T00:00:00Z',
      }),
    );
    writeFileSync(
      path.join(dir, 'future.md'),
      post({
        title: 'Future piece',
        lens: 'health',
        published_at: '2999-01-01T00:00:00Z',
      }),
    );
    writeFileSync(path.join(dir, '_template.md'), post({ title: 'Template' }));
    writeFileSync(path.join(dir, 'broken.md'), 'no frontmatter here');
    writeFileSync(
      path.join(dir, 'bad-lens.md'),
      post({
        title: 'Bad lens',
        lens: 'cooking',
        published_at: '2026-01-05T00:00:00Z',
      }),
    );
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    if (originalDir === undefined) delete process.env.ARTICLES_DIR;
    else process.env.ARTICLES_DIR = originalDir;
    jest.restoreAllMocks();
  });

  it('lists only published, past-dated, valid posts, newest first', async () => {
    const list = await getLocalArticles();
    expect(list.map((article) => article.slug)).toEqual([
      'newer-custom',
      'older',
    ]);
  });

  it('fills defaults and parses quoted titles, tags, and booleans', async () => {
    const [newer, older] = await getLocalArticles();
    expect(newer).toMatchObject({
      title: 'Newer: piece',
      lens: 'politics',
      tags: ['voting'],
      featured: true,
      access_tier: 'premium',
      author: 'A. Writer',
      status: 'published',
      body: 'First paragraph.\n\nSecond paragraph.',
    });
    expect(older).toMatchObject({
      featured: false,
      access_tier: 'free',
      cover_image: null,
      excerpt: 'An older excerpt.',
    });
    expect(older.id).toBe('local-older');
  });

  it('filters by lens, tag, and tier and paginates', async () => {
    expect(
      (await getLocalArticles({ lens: 'health' })).map((a) => a.slug),
    ).toEqual(['older']);
    expect(
      (await getLocalArticles({ tag: 'voting' })).map((a) => a.slug),
    ).toEqual(['newer-custom']);
    expect(
      (await getLocalArticles({ tier: 'free' })).map((a) => a.slug),
    ).toEqual(['older']);
    expect(
      (await getLocalArticles({ limit: 1, offset: 1 })).map((a) => a.slug),
    ).toEqual(['older']);
  });

  it('returns list items without the body', async () => {
    const [first] = await getLocalArticlesForListing();
    expect(first).not.toHaveProperty('body');
    expect(first.slug).toBe('newer-custom');
  });

  it('finds a post by slug and returns null for hidden or unknown slugs', async () => {
    expect((await getLocalArticleBySlug('older'))?.title).toBe('Older piece');
    expect(await getLocalArticleBySlug('draft')).toBeNull();
    expect(await getLocalArticleBySlug('future')).toBeNull();
    expect(await getLocalArticleBySlug('missing')).toBeNull();
  });

  it('returns featured, latest, and tag facets', async () => {
    expect((await getLocalFeaturedArticles(3)).map((a) => a.slug)).toEqual([
      'newer-custom',
    ]);
    expect((await getLocalLatestArticles(1)).map((a) => a.slug)).toEqual([
      'newer-custom',
    ]);
    expect(await getLocalArticleTagFacets({ lens: 'health' })).toEqual([
      { tags: ['sleep', 'habits'] },
    ]);
  });

  it('returns an empty list when the folder is missing', async () => {
    process.env.ARTICLES_DIR = path.join(dir, 'does-not-exist');
    expect(await getLocalArticles()).toEqual([]);
  });
});
