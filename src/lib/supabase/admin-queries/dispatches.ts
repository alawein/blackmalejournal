import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Dispatch,
  ContentStatus,
  Lens,
} from '@/lib/supabase/types';
import {
  buildSearchPattern,
  normalizeBulkIds,
  sortRowsByIds,
  type BulkMutationResult,
} from './shared';

// ── Dispatches ─────────────────────────────────────────────────────────────────

/**
 * List all dispatches (including drafts). For the admin dispatch list.
 */
export async function getAllDispatches(options?: {
  status?: ContentStatus;
  lens?: Lens;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<Dispatch[]> {
  const { status, lens, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('dispatches')
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
    console.error('[getAllDispatches]', error.message);
    return [];
  }
  return (data ?? []) as Dispatch[];
}

/**
 * Get a single dispatch by UUID. For the admin edit page.
 */
export async function getDispatchById(id: string): Promise<Dispatch | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('dispatches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getDispatchById]', error.message);
    return null;
  }
  return data as Dispatch;
}

export async function getDispatchesByIds(ids: string[]): Promise<Dispatch[]> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('dispatches')
    .select('*')
    .in('id', normalizedIds);

  if (error) {
    console.error('[getDispatchesByIds]', error.message);
    return [];
  }

  return sortRowsByIds((data ?? []) as Dispatch[], normalizedIds);
}

/**
 * Insert a new dispatch.
 * Auto-sets published_at to now when status is 'published' and no date provided.
 */
export async function createDispatch(data: {
  title: string;
  slug: string;
  lens: Lens;
  excerpt: string;
  body: string;
  status: ContentStatus;
  author: string;
  cover_image?: string | null;
  published_at?: string | null;
}): Promise<Dispatch | null> {
  const supabase = createAdminClient();

  const published_at =
    data.status === 'published' && !data.published_at
      ? new Date().toISOString()
      : (data.published_at ?? null);

  const { data: created, error } = await supabase
    .from('dispatches')
    .insert({
      title: data.title,
      slug: data.slug,
      lens: data.lens,
      excerpt: data.excerpt,
      body: data.body,
      status: data.status,
      author: data.author,
      cover_image: data.cover_image ?? null,
      published_at: published_at as string,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createDispatch]', error.message);
    return null;
  }
  return created as Dispatch;
}

/**
 * Update an existing dispatch by UUID.
 * Auto-sets published_at to now when status changes to 'published' and no date provided.
 */
export async function updateDispatch(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    lens: Lens;
    excerpt: string;
    body: string;
    status: ContentStatus;
    author: string;
    cover_image: string | null;
    published_at: string;
  }>,
): Promise<Dispatch | null> {
  const supabase = createAdminClient();

  const payload = { ...data };

  // Auto-set published_at when transitioning to published
  if (payload.status === 'published' && !('published_at' in payload)) {
    payload.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('dispatches')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateDispatch]', error.message);
    return null;
  }
  return updated as Dispatch;
}

/**
 * Hard-delete a dispatch by UUID.
 */
export async function deleteDispatch(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('dispatches')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteDispatch]', error.message);
    return false;
  }
  return true;
}

export async function bulkUpdateDispatchStatuses(
  ids: string[],
  status: ContentStatus,
): Promise<BulkMutationResult<Dispatch> | null> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) {
    return { previous: [], updated: [] };
  }

  const previous = await getDispatchesByIds(normalizedIds);
  if (previous.length === 0) {
    return { previous: [], updated: [] };
  }

  const supabase = createAdminClient();
  const targetIds = previous.map((dispatch) => dispatch.id);
  const { error } = await supabase
    .from('dispatches')
    .update({ status })
    .in('id', targetIds);

  if (error) {
    console.error('[bulkUpdateDispatchStatuses]', error.message);
    return null;
  }

  if (status === 'published') {
    const missingPublishedAt = previous
      .filter((dispatch) => !dispatch.published_at)
      .map((dispatch) => dispatch.id);

    if (missingPublishedAt.length > 0) {
      const { error: publishError } = await supabase
        .from('dispatches')
        .update({ published_at: new Date().toISOString() })
        .in('id', missingPublishedAt);

      if (publishError) {
        console.error('[bulkUpdateDispatchStatuses:published_at]', publishError.message);
        return null;
      }
    }
  }

  const updated = await getDispatchesByIds(targetIds);
  return { previous, updated };
}

