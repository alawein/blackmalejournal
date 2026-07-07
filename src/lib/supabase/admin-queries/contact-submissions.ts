import { createAdminClient } from '@/lib/supabase/admin';
import type {
  ContactSubmission,
  ContactSubmissionStatus,
} from '@/lib/supabase/types';
import {
  buildSearchPattern,
} from './shared';

// ── Contact Submissions ───────────────────────────────────────────────────────

export async function getAllContactSubmissions(options?: {
  status?: ContactSubmissionStatus;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<ContactSubmission[]> {
  const { status, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('contact_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) search = search.eq('status', status);
  if (searchPattern) {
    search = search.or(
      `name.ilike.${searchPattern},email.ilike.${searchPattern},subject.ilike.${searchPattern},message.ilike.${searchPattern},internal_notes.ilike.${searchPattern}`,
    );
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllContactSubmissions]', error.message);
    return [];
  }
  return (data ?? []) as ContactSubmission[];
}

export async function updateContactSubmission(
  id: string,
  data: {
    status: ContactSubmissionStatus;
    internal_notes?: string | null;
    handled_by?: string | null;
  },
): Promise<ContactSubmission | null> {
  const supabase = createAdminClient();
  const payload = {
    status: data.status,
    internal_notes: data.internal_notes?.trim() || null,
    handled_by: data.handled_by ?? null,
    handled_at: data.status === 'new' ? null : new Date().toISOString(),
  };

  const { data: updated, error } = await supabase
    .from('contact_submissions')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateContactSubmission]', error.message);
    return null;
  }
  return updated as ContactSubmission;
}

export async function getContactSubmissionCounts(): Promise<Record<ContactSubmissionStatus, number> & { total: number }> {
  const supabase = createAdminClient();
  const [total, nextNew, inProgress, resolved, spam] = await Promise.all([
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'spam'),
  ]);

  return {
    total: total.count ?? 0,
    new: nextNew.count ?? 0,
    in_progress: inProgress.count ?? 0,
    resolved: resolved.count ?? 0,
    spam: spam.count ?? 0,
  };
}

