import { createClient } from '@/lib/supabase/server';
import { applyPublicContentVisibility } from './_shared';
import type { AccessTier, Lens, SearchResult } from '@/lib/supabase/types';

const FTS_SORT: { relevance: 'relevance'; date: 'date' } = {
  relevance: 'relevance',
  date: 'date',
};

export type SearchFTSOptions = {
  lens?: string[];
  types?: string[];
  sort?: keyof typeof FTS_SORT;
  limit?: number;
};

type SearchRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  lens: string | null;
  access_tier: string;
  published_at: string;
  content_type: string;
  relevance: number;
};

export async function searchContent(
  query: string,
  options: {
    limit?: number;
  } = {},
): Promise<SearchResult[]> {
  const { limit = 20 } = options;
  const supabase = await createClient();

  if (!query || query.trim().length < 2) return [];

  const escaped = query.trim().replace(/[%_\\]/g, '\\$&');
  const term = `%${escaped}%`;

  const [articles, briefings, handbooks, dispatches] = await Promise.all([
    applyPublicContentVisibility(
      supabase
      .from('articles')
      .select('title, slug, excerpt, lens, published_at')
      .or(`title.ilike.${term},excerpt.ilike.${term}`)
      .order('published_at', { ascending: false })
      .limit(limit)),
    applyPublicContentVisibility(
      supabase
      .from('briefings')
      .select('title, slug, published_at')
      .ilike('title', term)
      .order('published_at', { ascending: false })
      .limit(limit)),
    applyPublicContentVisibility(
      supabase
      .from('handbooks')
      .select('title, slug, description, lens, published_at')
      .or(`title.ilike.${term},description.ilike.${term}`)
      .order('published_at', { ascending: false })
      .limit(limit)),
    applyPublicContentVisibility(
      supabase
      .from('dispatches')
      .select('title, slug, excerpt, lens, published_at')
      .or(`title.ilike.${term},excerpt.ilike.${term}`)
      .order('published_at', { ascending: false })
      .limit(limit),
    ),
  ]);

  const results: SearchResult[] = [];

  for (const row of ((articles.data ?? []) as Array<{
    title: string;
    slug: string;
    excerpt: string;
    lens: Lens;
    published_at: string;
  }>)) {
    results.push({
      type: 'article',
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      lens: row.lens,
      publishedAt: row.published_at,
    });
  }

  for (const row of ((briefings.data ?? []) as Array<{
    title: string;
    slug: string;
    published_at: string;
  }>)) {
    results.push({
      type: 'briefing',
      title: row.title,
      slug: row.slug,
      excerpt: '',
      publishedAt: row.published_at,
    });
  }

  for (const row of ((handbooks.data ?? []) as Array<{
    title: string;
    slug: string;
    description: string;
    lens: Lens;
    published_at: string;
  }>)) {
    results.push({
      type: 'handbook',
      title: row.title,
      slug: row.slug,
      excerpt: row.description,
      lens: row.lens,
      publishedAt: row.published_at,
    });
  }

  for (const row of ((dispatches.data ?? []) as Array<{
    title: string;
    slug: string;
    excerpt: string;
    lens: Lens;
    published_at: string;
  }>)) {
    results.push({
      type: 'dispatch',
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      lens: row.lens,
      publishedAt: row.published_at,
    });
  }

  results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return results.slice(0, limit);
}

export async function searchContentFTS(
  query: string,
  options: SearchFTSOptions = {},
): Promise<SearchResult[]> {
  const { lens, types, sort = 'relevance', limit = 30 } = options;
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const { data, error } = await (supabase as unknown as {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  }).rpc('search_content', {
    query: query.trim(),
    filter_lens: lens ?? null,
    filter_types: types ?? null,
    sort_by: sort,
    result_limit: limit,
  });

  if (error) {
    console.error('[searchContentFTS]', error.message);
    return [];
  }

  return ((data ?? []) as SearchRow[]).map((row) => ({
    type: row.content_type as SearchResult['type'],
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? '',
    lens: (row.lens as Lens) ?? undefined,
    accessTier: (row.access_tier as AccessTier) ?? undefined,
    publishedAt: row.published_at,
    relevance: row.relevance,
  }));
}
