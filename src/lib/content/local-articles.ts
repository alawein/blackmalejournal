import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type {
  AccessTier,
  Article,
  ArticleListItem,
  ContentStatus,
  Lens,
} from '@/lib/supabase/types';

/**
 * Articles stored as Markdown files in `content/articles/`, one file per post.
 * Each file starts with a `---` frontmatter block; the rest is the body.
 * Files whose names start with `_` are ignored (use `_template.md` as a guide).
 */

const LENSES: readonly Lens[] = [
  'health',
  'politics',
  'culture',
  'entertainment',
  'business',
];
const TIERS: readonly AccessTier[] = ['free', 'basic', 'premium'];
const STATUSES: readonly ContentStatus[] = [
  'draft',
  'review',
  'scheduled',
  'published',
  'archived',
  'withdrawn',
];
const PUBLIC_STATUSES: readonly ContentStatus[] = ['published', 'scheduled'];

type ListOptions = {
  lens?: Lens;
  tag?: string;
  limit?: number;
  offset?: number;
  tier?: AccessTier;
};

/** Local files are the default. Set ARTICLES_SOURCE=supabase to read the database instead. */
export function usesLocalArticles(): boolean {
  return process.env.ARTICLES_SOURCE !== 'supabase';
}

export function localArticlesDir(): string {
  return (
    process.env.ARTICLES_DIR ?? path.join(process.cwd(), 'content', 'articles')
  );
}

function unquote(value: string): string {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if (
    trimmed.length >= 2 &&
    (quote === '"' || quote === "'") &&
    trimmed.endsWith(quote)
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return null;

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon <= 0) continue;
    data[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { data, body: match[2].trim() };
}

function parseTags(value: string | undefined): string[] {
  if (!value) return [];
  const inner = value.trim().replace(/^\[/, '').replace(/\]$/, '');
  return inner
    .split(',')
    .map((tag) => unquote(tag))
    .filter(Boolean);
}

function pick<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  return allowed.find((candidate) => candidate === value);
}

function toArticle(file: string, raw: string): Article | null {
  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    console.error(`[local-articles] ${file}: missing frontmatter, skipped`);
    return null;
  }
  const { data, body } = parsed;

  const title = data.title ? unquote(data.title) : '';
  const lens = pick(data.lens ? unquote(data.lens) : undefined, LENSES);
  const publishedAt = data.published_at ? unquote(data.published_at) : '';
  if (!title || !lens || Number.isNaN(Date.parse(publishedAt))) {
    console.error(
      `[local-articles] ${file}: needs a title, a valid lens, and a published_at date, skipped`,
    );
    return null;
  }

  const slug = data.slug ? unquote(data.slug) : path.basename(file, '.md');
  const status =
    pick(data.status ? unquote(data.status) : undefined, STATUSES) ??
    'published';
  const publishedIso = new Date(publishedAt).toISOString();

  return {
    id: `local-${slug}`,
    title,
    slug,
    lens,
    tags: parseTags(data.tags),
    excerpt: data.excerpt ? unquote(data.excerpt) : '',
    body,
    featured: data.featured === 'true',
    access_tier:
      pick(data.access_tier ? unquote(data.access_tier) : undefined, TIERS) ??
      'free',
    status,
    author: data.author ? unquote(data.author) : 'The Chairman',
    cover_image: data.cover_image ? unquote(data.cover_image) : null,
    published_at: publishedIso,
    created_at: publishedIso,
  } as Article;
}

function readAll(): Article[] {
  const dir = localArticlesDir();
  if (!existsSync(dir)) return [];

  const articles: Article[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const article = toArticle(file, readFileSync(path.join(dir, file), 'utf8'));
    if (article) articles.push(article);
  }
  return articles;
}

function visible(now = new Date()): Article[] {
  return readAll()
    .filter(
      (article) =>
        PUBLIC_STATUSES.includes(article.status) &&
        Date.parse(article.published_at) <= now.getTime(),
    )
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
}

function toListItem(article: Article): ArticleListItem {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    lens: article.lens,
    tags: article.tags,
    excerpt: article.excerpt,
    featured: article.featured,
    access_tier: article.access_tier,
    cover_image: article.cover_image,
    published_at: article.published_at,
    author: article.author,
  };
}

function filtered(options: ListOptions): Article[] {
  const { lens, tag, limit = 20, offset = 0, tier } = options;
  return visible()
    .filter((article) => !lens || article.lens === lens)
    .filter((article) => !tag || article.tags.includes(tag))
    .filter((article) => !tier || article.access_tier === tier)
    .slice(offset, offset + limit);
}

export async function getLocalArticles(
  options: ListOptions = {},
): Promise<Article[]> {
  return filtered(options);
}

export async function getLocalArticlesForListing(
  options: ListOptions = {},
): Promise<ArticleListItem[]> {
  return filtered(options).map(toListItem);
}

export async function getLocalArticleTagFacets(
  options: { lens?: Lens; limit?: number } = {},
): Promise<Array<{ tags: string[] }>> {
  const { lens, limit = 200 } = options;
  return visible()
    .filter((article) => !lens || article.lens === lens)
    .slice(0, limit)
    .map((article) => ({ tags: article.tags }));
}

export async function getLocalArticleBySlug(
  slug: string,
): Promise<Article | null> {
  return visible().find((article) => article.slug === slug) ?? null;
}

export async function getLocalFeaturedArticles(
  limit = 3,
): Promise<ArticleListItem[]> {
  return visible()
    .filter((article) => article.featured)
    .slice(0, limit)
    .map(toListItem);
}

export async function getLocalLatestArticles(
  limit = 10,
): Promise<ArticleListItem[]> {
  return visible().slice(0, limit).map(toListItem);
}
