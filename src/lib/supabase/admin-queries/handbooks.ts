import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Handbook,
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

// ── Handbooks ──────────────────────────────────────────────────────────────────

/**
 * List all handbooks (including drafts). For the admin handbook list.
 */
export async function getAllHandbooks(options?: {
  status?: ContentStatus;
  lens?: Lens;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<Handbook[]> {
  const { status, lens, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('handbooks')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) search = search.eq('status', status);
  if (lens) search = search.eq('lens', lens);
  if (searchPattern) {
    search = search.or(
      `title.ilike.${searchPattern},slug.ilike.${searchPattern},description.ilike.${searchPattern}`,
    );
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllHandbooks]', error.message);
    return [];
  }
  return (data ?? []) as Handbook[];
}

/**
 * Get a single handbook by UUID. For the admin edit page.
 */
export async function getHandbookById(id: string): Promise<Handbook | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('handbooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getHandbookById]', error.message);
    return null;
  }
  return data as Handbook;
}

export async function getHandbooksByIds(ids: string[]): Promise<Handbook[]> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('handbooks')
    .select('*')
    .in('id', normalizedIds);

  if (error) {
    console.error('[getHandbooksByIds]', error.message);
    return [];
  }

  return sortRowsByIds((data ?? []) as Handbook[], normalizedIds);
}

/**
 * Insert a new handbook.
 * Auto-sets published_at to now when status is 'published' and no date provided.
 */
export async function createHandbook(data: {
  title: string;
  slug: string;
  lens: Lens;
  description: string;
  body: string;
  access_tier: AccessTier;
  status: ContentStatus;
  author: string;
  cover_image?: string | null;
  file_url?: string | null;
  published_at?: string | null;
}): Promise<Handbook | null> {
  const supabase = createAdminClient();

  const published_at =
    data.status === 'published' && !data.published_at
      ? new Date().toISOString()
      : (data.published_at ?? null);

  const { data: created, error } = await supabase
    .from('handbooks')
    .insert({
      title: data.title,
      slug: data.slug,
      lens: data.lens,
      description: data.description,
      body: data.body,
      access_tier: data.access_tier,
      status: data.status,
      author: data.author,
      cover_image: data.cover_image ?? null,
      file_url: data.file_url ?? null,
      published_at: published_at as string,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createHandbook]', error.message);
    return null;
  }
  return created as Handbook;
}

/**
 * Update an existing handbook by UUID.
 * Auto-sets published_at to now when status changes to 'published' and no date provided.
 */
export async function updateHandbook(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    lens: Lens;
    description: string;
    body: string;
    access_tier: AccessTier;
    status: ContentStatus;
    author: string;
    cover_image: string | null;
    file_url: string | null;
    published_at: string;
  }>,
): Promise<Handbook | null> {
  const supabase = createAdminClient();

  const payload = { ...data };

  // Auto-set published_at when transitioning to published
  if (payload.status === 'published' && !('published_at' in payload)) {
    payload.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('handbooks')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateHandbook]', error.message);
    return null;
  }
  return updated as Handbook;
}

/**
 * Hard-delete a handbook by UUID.
 */
export async function deleteHandbook(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('handbooks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteHandbook]', error.message);
    return false;
  }
  return true;
}

export async function bulkUpdateHandbookStatuses(
  ids: string[],
  status: ContentStatus,
): Promise<BulkMutationResult<Handbook> | null> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) {
    return { previous: [], updated: [] };
  }

  const previous = await getHandbooksByIds(normalizedIds);
  if (previous.length === 0) {
    return { previous: [], updated: [] };
  }

  const supabase = createAdminClient();
  const targetIds = previous.map((handbook) => handbook.id);
  const { error } = await supabase
    .from('handbooks')
    .update({ status })
    .in('id', targetIds);

  if (error) {
    console.error('[bulkUpdateHandbookStatuses]', error.message);
    return null;
  }

  if (status === 'published') {
    const missingPublishedAt = previous
      .filter((handbook) => !handbook.published_at)
      .map((handbook) => handbook.id);

    if (missingPublishedAt.length > 0) {
      const { error: publishError } = await supabase
        .from('handbooks')
        .update({ published_at: new Date().toISOString() })
        .in('id', missingPublishedAt);

      if (publishError) {
        console.error('[bulkUpdateHandbookStatuses:published_at]', publishError.message);
        return null;
      }
    }
  }

  const updated = await getHandbooksByIds(targetIds);
  return { previous, updated };
}

