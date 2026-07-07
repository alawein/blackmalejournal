import { createAdminClient } from '@/lib/supabase/admin';
import type {
  NewsletterSubscriber,
} from '@/lib/supabase/types';
import {
  buildSearchPattern,
} from './shared';

// ── Newsletter Subscribers ─────────────────────────────────────────────────────

export async function getAllSubscribers(options?: {
  active?: boolean;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<NewsletterSubscriber[]> {
  const { active, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (active === true) search = search.is('unsubscribed_at', null);
  if (active === false) search = search.not('unsubscribed_at', 'is', null);
  if (searchPattern) {
    search = search.or(`email.ilike.${searchPattern},source.ilike.${searchPattern}`);
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllSubscribers]', error.message);
    return [];
  }
  return (data ?? []) as NewsletterSubscriber[];
}

export async function getSubscriberCounts(): Promise<{
  total: number;
  active: number;
  unsubscribed: number;
}> {
  const supabase = createAdminClient();
  const [total, active, unsubscribed] = await Promise.all([
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).is('unsubscribed_at', null),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).not('unsubscribed_at', 'is', null),
  ]);

  return {
    total: total.count ?? 0,
    active: active.count ?? 0,
    unsubscribed: unsubscribed.count ?? 0,
  };
}

