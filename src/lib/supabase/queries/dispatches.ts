import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type {
  Dispatch,
  DispatchListItem,
} from '@/lib/supabase/types';
import { applyPublicContentVisibility, fetchRows, fetchSingle } from './_shared';

const DISPATCH_LIST_SELECT = 'id,title,slug,lens,excerpt,published_at';

export async function getDispatchesForListing(
  options: { limit?: number; offset?: number } = {},
): Promise<DispatchListItem[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('dispatches')
      .select(DISPATCH_LIST_SELECT)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1),
  );

  return fetchRows<DispatchListItem>(query, 'getDispatchesForListing');
}

export async function getDispatches(
  options: { limit?: number; offset?: number } = {},
): Promise<Dispatch[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('dispatches')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1),
  );

  return fetchRows<Dispatch>(query, 'getDispatches');
}

export const getDispatchBySlug = cache(async function getDispatchBySlug(
  slug: string,
): Promise<Dispatch | null> {
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('dispatches')
      .select('*')
      .eq('slug', slug),
  );
  return fetchSingle<Dispatch>(query.single(), 'getDispatchBySlug');
});

export async function getLatestDispatches(limit = 3): Promise<DispatchListItem[]> {
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('dispatches')
      .select(DISPATCH_LIST_SELECT)
      .order('published_at', { ascending: false })
      .limit(limit),
  );

  return fetchRows<DispatchListItem>(query, 'getLatestDispatches');
}
