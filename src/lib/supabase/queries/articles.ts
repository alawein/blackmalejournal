import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type {
  Article,
  ArticleListItem,
  Lens,
  AccessTier,
} from '@/lib/supabase/types';
import { applyPublicContentVisibility, fetchRows, fetchSingle } from './_shared';

const ARTICLE_LIST_SELECT =
  'id,title,slug,lens,tags,excerpt,featured,access_tier,cover_image,published_at,author';

export async function getArticles(
  options: {
    lens?: Lens;
    tag?: string;
    limit?: number;
    offset?: number;
    tier?: AccessTier;
  } = {},
): Promise<Article[]> {
  const { lens, tag, limit = 20, offset = 0, tier } = options;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = applyPublicContentVisibility(
    supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1),
    nowIso,
  );

  if (lens) query = query.eq('lens', lens);
  if (tag) query = query.contains('tags', [tag]);
  if (tier) query = query.eq('access_tier', tier);

  return fetchRows<Article>(query, 'getArticles');
}

export async function getArticlesForListing(
  options: {
    lens?: Lens;
    tag?: string;
    limit?: number;
    offset?: number;
    tier?: AccessTier;
  } = {},
): Promise<ArticleListItem[]> {
  const { lens, tag, limit = 20, offset = 0, tier } = options;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = applyPublicContentVisibility(
    supabase
      .from('articles')
      .select(ARTICLE_LIST_SELECT)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1),
    nowIso,
  );

  if (lens) query = query.eq('lens', lens);
  if (tag) query = query.contains('tags', [tag]);
  if (tier) query = query.eq('access_tier', tier);

  return fetchRows<ArticleListItem>(query, 'getArticlesForListing');
}

export async function getArticleTagFacets(
  options: { lens?: Lens; limit?: number } = {},
): Promise<Array<{ tags: string[] }>> {
  const { lens, limit = 200 } = options;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = applyPublicContentVisibility(
    supabase
      .from('articles')
      .select('tags')
      .order('published_at', { ascending: false })
      .range(0, limit - 1),
    nowIso,
  );

  if (lens) query = query.eq('lens', lens);

  return fetchRows<{ tags: string[] }>(query, 'getArticleTagFacets');
}

export const getArticleBySlug = cache(async function getArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('articles')
      .select('*')
      .eq('slug', slug),
  );
  return fetchSingle<Article>(query.single(), 'getArticleBySlug');
});

export async function getFeaturedArticles(limit = 3): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('articles')
      .select(ARTICLE_LIST_SELECT)
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit),
  );

  return fetchRows<ArticleListItem>(query, 'getFeaturedArticles');
}

export async function getLatestArticles(limit = 10): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('articles')
      .select(ARTICLE_LIST_SELECT)
      .order('published_at', { ascending: false })
      .limit(limit),
  );

  return fetchRows<ArticleListItem>(query, 'getLatestArticles');
}
