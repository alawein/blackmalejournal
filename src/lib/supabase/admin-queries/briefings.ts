import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Briefing,
  BriefingSection,
  ContentStatus,
  AccessTier,
} from '@/lib/supabase/types';
import {
  buildSearchPattern,
  normalizeBulkIds,
  sortRowsByIds,
  type BulkMutationResult,
} from './shared';

// ── Briefings ──────────────────────────────────────────────────────────────────

/**
 * List all briefings (including drafts). For the admin briefing list.
 */
export async function getAllBriefings(options?: {
  status?: ContentStatus;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<Briefing[]> {
  const { status, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('briefings')
    .select('*')
    .order('issue_number', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) search = search.eq('status', status);
  if (searchPattern) {
    const trimmed = query?.trim();
    const issueFilter =
      trimmed && /^\d+$/.test(trimmed)
        ? `,issue_number.eq.${Number.parseInt(trimmed, 10)}`
        : '';
    search = search.or(
      `title.ilike.${searchPattern},slug.ilike.${searchPattern}${issueFilter}`,
    );
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllBriefings]', error.message);
    return [];
  }
  return (data ?? []) as Briefing[];
}

/**
 * Get a single briefing by UUID. For the admin edit page.
 */
export async function getBriefingById(id: string): Promise<Briefing | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getBriefingById]', error.message);
    return null;
  }
  return data as Briefing;
}

export async function getBriefingsByIds(ids: string[]): Promise<Briefing[]> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .in('id', normalizedIds);

  if (error) {
    console.error('[getBriefingsByIds]', error.message);
    return [];
  }

  return sortRowsByIds((data ?? []) as Briefing[], normalizedIds);
}

/**
 * Insert a new briefing.
 * Auto-sets published_at to now when status is 'published' and no date provided.
 */
export async function createBriefing(data: {
  issue_number: number;
  title: string;
  slug: string;
  sections: BriefingSection[];
  access_tier: AccessTier;
  status: ContentStatus;
  cover_image?: string | null;
  published_at?: string | null;
}): Promise<Briefing | null> {
  const supabase = createAdminClient();

  const published_at =
    data.status === 'published' && !data.published_at
      ? new Date().toISOString()
      : (data.published_at ?? null);

  const { data: created, error } = await supabase
    .from('briefings')
    .insert({
      issue_number: data.issue_number,
      title: data.title,
      slug: data.slug,
      sections: data.sections,
      access_tier: data.access_tier,
      status: data.status,
      cover_image: data.cover_image ?? null,
      published_at: published_at as string,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createBriefing]', error.message);
    return null;
  }
  return created as Briefing;
}

/**
 * Update an existing briefing by UUID.
 * Auto-sets published_at to now when status changes to 'published' and no date provided.
 */
export async function updateBriefing(
  id: string,
  data: Partial<{
    issue_number: number;
    title: string;
    slug: string;
    sections: BriefingSection[];
    access_tier: AccessTier;
    status: ContentStatus;
    cover_image: string | null;
    published_at: string;
  }>,
): Promise<Briefing | null> {
  const supabase = createAdminClient();

  const payload = { ...data };

  // Auto-set published_at when transitioning to published
  if (payload.status === 'published' && !('published_at' in payload)) {
    payload.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('briefings')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateBriefing]', error.message);
    return null;
  }
  return updated as Briefing;
}

/**
 * Hard-delete a briefing by UUID.
 */
export async function deleteBriefing(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('briefings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteBriefing]', error.message);
    return false;
  }
  return true;
}

export async function bulkUpdateBriefingStatuses(
  ids: string[],
  status: ContentStatus,
): Promise<BulkMutationResult<Briefing> | null> {
  const normalizedIds = normalizeBulkIds(ids);
  if (normalizedIds.length === 0) {
    return { previous: [], updated: [] };
  }

  const previous = await getBriefingsByIds(normalizedIds);
  if (previous.length === 0) {
    return { previous: [], updated: [] };
  }

  const supabase = createAdminClient();
  const targetIds = previous.map((briefing) => briefing.id);
  const { error } = await supabase
    .from('briefings')
    .update({ status })
    .in('id', targetIds);

  if (error) {
    console.error('[bulkUpdateBriefingStatuses]', error.message);
    return null;
  }

  if (status === 'published') {
    const missingPublishedAt = previous
      .filter((briefing) => !briefing.published_at)
      .map((briefing) => briefing.id);

    if (missingPublishedAt.length > 0) {
      const { error: publishError } = await supabase
        .from('briefings')
        .update({ published_at: new Date().toISOString() })
        .in('id', missingPublishedAt);

      if (publishError) {
        console.error('[bulkUpdateBriefingStatuses:published_at]', publishError.message);
        return null;
      }
    }
  }

  const updated = await getBriefingsByIds(targetIds);
  return { previous, updated };
}

