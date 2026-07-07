import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Article,
  ContentStatus,
  Lens,
  AccessTier,
} from '@/lib/supabase/types';
import {
  buildSearchPattern,
  normalizeBulkIds,
  sortRowsByIds,
  type BulkMutationResult,
} from './shared';

// ── Articles ──────────────────────────────────────────────────────────────────

/**
 * List all articles (including drafts). For the admin article list.
 */
export async function getAllArticles(options?: {
  status?: ContentStatus;
  lens?: Lens;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<Article[]> {
  const { status, lens, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) search = search.eq('status', status);
  if (lens) search = search.eq('lens', lens);
  if (searchPattern) {
    search = search.or(
      `title.ilike.${searchPattern},slug.ilike.${searchPattern},excerpt.ilike.${searchPattern}`,
    );
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllArticles]', error.message);
    return [];
  }
  return (data ?? []) as Article[];
}

/**
 * Get a single article by UUID. For the admin edit page.
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getArticleById]', error.message);
    return null;
  }
  return data as Article;
}

export async function getArticlesByIds(ids: string[]): Promise<Article[]> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .in('id', normalizedIds);

  if (error) {
    console.error('[getArticlesByIds]', error.message);
    return [];
  }

  return sortRowsByIds((data ?? []) as Article[], normalizedIds);
}

/**
 * Insert a new article.
 * Auto-sets published_at to now when status is 'published' and no date provided.
 */
export async function createArticle(data: {
  title: string;
  slug: string;
  lens: Lens;
  tags: string[];
  excerpt: string;
  body: string;
  access_tier: AccessTier;
  status: ContentStatus;
  featured: boolean;
  author: string;
  cover_image?: string | null;
  published_at?: string | null;
}): Promise<Article | null> {
  const supabase = createAdminClient();

  const published_at =
    data.status === 'published' && !data.published_at
      ? new Date().toISOString()
      : (data.published_at ?? null);

  const { data: created, error } = await supabase
    .from('articles')
    .insert({
      title: data.title,
      slug: data.slug,
      lens: data.lens,
      tags: data.tags,
      excerpt: data.excerpt,
      body: data.body,
      access_tier: data.access_tier,
      status: data.status,
      featured: data.featured,
      author: data.author,
      cover_image: data.cover_image ?? null,
      published_at: published_at as string,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createArticle]', error.message);
    return null;
  }
  return created as Article;
}

/**
 * Update an existing article by UUID.
 * Auto-sets published_at to now when status changes to 'published' and no date provided.
 */
export async function updateArticle(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    lens: Lens;
    tags: string[];
    excerpt: string;
    body: string;
    access_tier: AccessTier;
    status: ContentStatus;
    featured: boolean;
    author: string;
    cover_image: string | null;
    published_at: string;
  }>,
): Promise<Article | null> {
  const supabase = createAdminClient();

  const payload = { ...data };

  // Auto-set published_at when transitioning to published
  if (payload.status === 'published' && !('published_at' in payload)) {
    payload.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('articles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateArticle]', error.message);
    return null;
  }
  return updated as Article;
}

/**
 * Hard-delete an article by UUID.
 */
export async function deleteArticle(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteArticle]', error.message);
    return false;
  }
  return true;
}

export async function bulkUpdateArticleStatuses(
  ids: string[],
  status: ContentStatus,
): Promise<BulkMutationResult<Article> | null> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) {
    return { previous: [], updated: [] };
  }

  const previous = await getArticlesByIds(normalizedIds);
  if (previous.length === 0) {
    return { previous: [], updated: [] };
  }

  const supabase = createAdminClient();
  const targetIds = previous.map((article) => article.id);
  const { error } = await supabase
    .from('articles')
    .update({ status })
    .in('id', targetIds);

  if (error) {
    console.error('[bulkUpdateArticleStatuses]', error.message);
    return null;
  }

  if (status === 'published') {
    const missingPublishedAt = previous
      .filter((article) => !article.published_at)
      .map((article) => article.id);

    if (missingPublishedAt.length > 0) {
      const { error: publishError } = await supabase
        .from('articles')
        .update({ published_at: new Date().toISOString() })
        .in('id', missingPublishedAt);

      if (publishError) {
        console.error('[bulkUpdateArticleStatuses:published_at]', publishError.message);
        return null;
      }
    }
  }

  const updated = await getArticlesByIds(targetIds);
  return { previous, updated };
}

