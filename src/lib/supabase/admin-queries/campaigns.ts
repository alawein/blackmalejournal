import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Campaign,
  CampaignStatus,
  AudienceFilter,
} from '@/lib/supabase/types';

// ── Campaigns ────────────────────────────────────────────────────────────────

/**
 * List all campaigns, optionally filtered by status.
 */
export async function getAllCampaigns(options?: {
  status?: CampaignStatus;
}): Promise<Campaign[]> {
  const { status } = options ?? {};
  const supabase = createAdminClient();

  let query = supabase
    .from('campaigns')
    .select('*')
    .order('updated_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('[getAllCampaigns]', error.message);
    return [];
  }
  return (data ?? []) as Campaign[];
}

/**
 * Get a single campaign by UUID.
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getCampaignById]', error.message);
    return null;
  }
  return data as Campaign;
}

/**
 * Insert a new campaign.
 */
export async function createCampaign(data: {
  title: string;
  subject: string;
  body?: string;
  audience_filter?: AudienceFilter;
  recipient_count?: number;
  status?: CampaignStatus;
  scheduled_at?: string | null;
}): Promise<Campaign | null> {
  const supabase = createAdminClient();

  const { data: created, error } = await supabase
    .from('campaigns')
    .insert({
      title: data.title,
      subject: data.subject,
      body: data.body ?? '',
      audience_filter: data.audience_filter ?? {},
      recipient_count: data.recipient_count ?? 0,
      status: data.status ?? 'draft',
      scheduled_at: data.scheduled_at ?? null,
      sent_at: null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createCampaign]', error.message);
    return null;
  }
  return created as Campaign;
}

/**
 * Update an existing campaign by UUID. Always bumps updated_at.
 */
export async function updateCampaign(
  id: string,
  data: Partial<{
    title: string;
    subject: string;
    body: string;
    audience_filter: AudienceFilter;
    recipient_count: number;
    status: CampaignStatus;
    scheduled_at: string | null;
    sent_at: string | null;
  }>,
): Promise<Campaign | null> {
  const supabase = createAdminClient();

  const { data: updated, error } = await supabase
    .from('campaigns')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateCampaign]', error.message);
    return null;
  }
  return updated as Campaign;
}

/**
 * Hard-delete a campaign by UUID.
 */
export async function deleteCampaign(id: string): Promise<true | null> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteCampaign]', error.message);
    return null;
  }
  return true;
}

/**
 * Count newsletter subscribers matching the given audience filter.
 */
export async function getAudienceCount(filter: AudienceFilter): Promise<number> {
  const supabase = createAdminClient();

  let query = supabase
    .from('newsletter_subscribers')
    .select('id', { count: 'exact', head: true });

  if (filter.activeOnly !== false) {
    query = query.is('unsubscribed_at', null);
  }
  if (filter.source) {
    query = query.eq('source', filter.source);
  }

  const { count, error } = await query;
  if (error) {
    console.error('[getAudienceCount]', error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Get distinct non-null source values from newsletter_subscribers.
 */
export async function getDistinctSubscriberSources(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('source')
    .not('source', 'is', null);

  if (error) {
    console.error('[getDistinctSubscriberSources]', error.message);
    return [];
  }

  const sources = new Set<string>();
  for (const row of data ?? []) {
    if ((row as { source: string | null }).source) {
      sources.add((row as { source: string }).source);
    }
  }
  return Array.from(sources).sort();
}
