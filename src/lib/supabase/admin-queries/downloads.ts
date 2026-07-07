import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Download,
  AccessTier,
} from '@/lib/supabase/types';
import {
  buildSearchPattern,
  normalizeBulkIds,
  sortRowsByIds,
  type BulkMutationResult,
} from './shared';

// ── Downloads ──────────────────────────────────────────────────────────────────

/**
 * List all downloads. For the admin download list.
 */
export async function getAllDownloads(options?: {
  category?: string;
  accessTier?: AccessTier;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<Download[]> {
  const { category, accessTier, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('downloads')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) search = search.eq('category', category);
  if (accessTier) search = search.eq('access_tier', accessTier);
  if (searchPattern) {
    search = search.or(
      `title.ilike.${searchPattern},slug.ilike.${searchPattern},description.ilike.${searchPattern},category.ilike.${searchPattern},file_type.ilike.${searchPattern}`,
    );
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllDownloads]', error.message);
    return [];
  }
  return (data ?? []) as Download[];
}

/**
 * Get a single download by UUID. For the admin edit page.
 */
export async function getDownloadById(id: string): Promise<Download | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getDownloadById]', error.message);
    return null;
  }
  return data as Download;
}

export async function getDownloadsByIds(ids: string[]): Promise<Download[]> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .in('id', normalizedIds);

  if (error) {
    console.error('[getDownloadsByIds]', error.message);
    return [];
  }

  return sortRowsByIds((data ?? []) as Download[], normalizedIds);
}

/**
 * Insert a new download.
 * Auto-sets published_at to now if not provided.
 */
export async function createDownload(data: {
  title: string;
  slug: string;
  description: string;
  category: string;
  file_url: string;
  file_type: string;
  file_size: number;
  access_tier: AccessTier;
  cover_image?: string | null;
  published_at?: string | null;
}): Promise<Download | null> {
  const supabase = createAdminClient();

  const published_at = data.published_at ?? new Date().toISOString();

  const { data: created, error } = await supabase
    .from('downloads')
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description,
      category: data.category,
      file_url: data.file_url,
      file_type: data.file_type,
      file_size: data.file_size,
      access_tier: data.access_tier,
      cover_image: data.cover_image ?? null,
      published_at,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createDownload]', error.message);
    return null;
  }
  return created as Download;
}

/**
 * Update an existing download by UUID.
 */
export async function updateDownload(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string;
    category: string;
    file_url: string;
    file_type: string;
    file_size: number;
    access_tier: AccessTier;
    cover_image: string | null;
    published_at: string;
  }>,
): Promise<Download | null> {
  const supabase = createAdminClient();

  const { data: updated, error } = await supabase
    .from('downloads')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateDownload]', error.message);
    return null;
  }
  return updated as Download;
}

/**
 * Hard-delete a download by UUID.
 */
export async function deleteDownload(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('downloads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteDownload]', error.message);
    return false;
  }
  return true;
}

export async function bulkUpdateDownloadAccessTiers(
  ids: string[],
  accessTier: AccessTier,
): Promise<BulkMutationResult<Download> | null> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) {
    return { previous: [], updated: [] };
  }

  const previous = await getDownloadsByIds(normalizedIds);
  if (previous.length === 0) {
    return { previous: [], updated: [] };
  }

  const supabase = createAdminClient();
  const targetIds = previous.map((download) => download.id);
  const { error } = await supabase
    .from('downloads')
    .update({ access_tier: accessTier })
    .in('id', targetIds);

  if (error) {
    console.error('[bulkUpdateDownloadAccessTiers]', error.message);
    return null;
  }

  const updated = await getDownloadsByIds(targetIds);
  return { previous, updated };
}

