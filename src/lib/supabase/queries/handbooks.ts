import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Handbook, HandbookSitemapRow, Lens } from '@/lib/supabase/types';
import { applyPublicContentVisibility, fetchRows, fetchSingle } from './_shared';

export async function getHandbooks(
  options: {
    lens?: Lens;
    limit?: number;
    offset?: number;
  } = {},
): Promise<Handbook[]> {
  const { lens, limit = 20, offset = 0 } = options;
  const supabase = await createClient();

  let query = applyPublicContentVisibility(
    supabase
      .from('handbooks')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1),
  );

  if (lens) query = query.eq('lens', lens);

  return fetchRows<Handbook>(query, 'getHandbooks');
}

export async function getHandbooksForSitemap(
  options: { limit?: number; offset?: number } = {},
): Promise<HandbookSitemapRow[]> {
  const { limit = 200, offset = 0 } = options;
  const supabase = await createClient();

  const query = applyPublicContentVisibility(
    supabase
      .from('handbooks')
      .select('slug,published_at')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1),
  );

  return fetchRows<HandbookSitemapRow>(query, 'getHandbooksForSitemap');
}

export const getHandbookBySlug = cache(async function getHandbookBySlug(
  slug: string,
): Promise<Handbook | null> {
  const supabase = await createClient();
  const query = applyPublicContentVisibility(
    supabase
      .from('handbooks')
      .select('*')
      .eq('slug', slug),
  );
  return fetchSingle<Handbook>(query.single(), 'getHandbookBySlug');
});
