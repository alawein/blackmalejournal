import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Download } from '@/lib/supabase/types';
import { fetchRows, fetchSingle } from './_shared';

export async function getDownloads(
  options: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<Download[]> {
  const { category, limit = 40, offset = 0 } = options;
  const supabase = await createClient();

  let query = supabase
    .from('downloads')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);

  return fetchRows<Download>(query, 'getDownloads');
}

export const getDownloadBySlug = cache(async function getDownloadBySlug(
  slug: string,
): Promise<Download | null> {
  const supabase = await createClient();
  const query = supabase
    .from('downloads')
    .select('*')
    .eq('slug', slug)
    .single();

  return fetchSingle<Download>(query, 'getDownloadBySlug');
});
