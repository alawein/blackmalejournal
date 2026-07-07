import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Member,
  MemberTier,
  MemberRole,
} from '@/lib/supabase/types';
import {
  buildSearchPattern,
} from './shared';

// ── Members ────────────────────────────────────────────────────────────────────

export async function getAllMembers(options?: {
  tier?: MemberTier;
  role?: MemberRole;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<Member[]> {
  const { tier, role, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (tier) search = search.eq('tier', tier);
  if (role) search = search.eq('role', role);
  if (searchPattern) search = search.ilike('email', searchPattern);

  const { data, error } = await search;
  if (error) {
    console.error('[getAllMembers]', error.message);
    return [];
  }
  return (data ?? []) as Member[];
}

export async function getAdminMemberById(id: string): Promise<Member | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getAdminMemberById]', error.message);
    return null;
  }
  return data as Member;
}

export async function updateAdminMember(
  id: string,
  data: Partial<Pick<Member, 'tier' | 'role'>>,
): Promise<Member | null> {
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from('members')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateAdminMember]', error.message);
    return null;
  }
  return updated as Member;
}

export async function countAdminMembers(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin');

  if (error) {
    console.error('[countAdminMembers]', error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getMemberCount(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('[getMemberCount]', error.message);
    return 0;
  }
  return count ?? 0;
}

