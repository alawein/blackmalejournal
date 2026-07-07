import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type {
  Briefing,
  BriefingListItem,
  BriefingSitemapRow,
} from '@/lib/supabase/types';
import { applyPublicContentVisibility, fetchRows, fetchSingle } from './_shared';

const BRIEFING_LIST_SELECT =
  'id,issue_number,slug,title,lead_kicker,access_tier,status,cover_image,published_at,created_at';

export async function getBriefings(
  options: { limit?: number; offset?: number } = {},
): Promise<BriefingListItem[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('briefings')
      .select(BRIEFING_LIST_SELECT)
      .order('issue_number', { ascending: false })
      .range(offset, offset + limit - 1),
  );

  return fetchRows<BriefingListItem>(query, 'getBriefings');
}

export async function getBriefingsForSitemap(
  options: { limit?: number; offset?: number } = {},
): Promise<BriefingSitemapRow[]> {
  const { limit = 200, offset = 0 } = options;
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('briefings')
      .select('slug,published_at')
      .order('issue_number', { ascending: false })
      .range(offset, offset + limit - 1),
  );

  return fetchRows<BriefingSitemapRow>(query, 'getBriefingsForSitemap');
}

export const getBriefingBySlug = cache(async function getBriefingBySlug(
  slug: string,
): Promise<Briefing | null> {
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('briefings')
      .select('*')
      .eq('slug', slug),
  );
  return fetchSingle<Briefing>(query.single(), 'getBriefingBySlug');
});

export async function getLatestBriefing(): Promise<BriefingListItem | null> {
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('briefings')
      .select(BRIEFING_LIST_SELECT)
      .order('issue_number', { ascending: false })
      .limit(1),
  ).single();

  return fetchSingle<BriefingListItem>(query, 'getLatestBriefing');
}

export async function getBriefingByIssue(
  issueNumber: number,
): Promise<Briefing | null> {
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('briefings')
      .select('*')
      .eq('issue_number', issueNumber),
  ).single();

  return fetchSingle<Briefing>(query, 'getBriefingByIssue');
}
