import { createAdminClient } from '@/lib/supabase/admin';

// ── Dashboard counts ──────────────────────────────────────────────────────────

/**
 * Aggregate content counts for the admin dashboard overview.
 * Uses head-only queries for efficient counting.
 */
export async function getContentCounts(): Promise<{
  articles: { total: number; published: number; draft: number };
  briefings: { total: number; published: number; draft: number };
  courses: { total: number; published: number; draft: number };
  dispatches: { total: number; published: number; draft: number };
  downloads: { total: number };
  handbooks: { total: number; published: number; draft: number };
  members: { total: number };
  messages: { total: number };
  subscribers: { total: number };
}> {
  const supabase = createAdminClient();

  const [
    articlesTotal,
    articlesPublished,
    articlesDraft,
    briefingsTotal,
    briefingsPublished,
    briefingsDraft,
    coursesTotal,
    coursesPublished,
    coursesDraft,
    dispatchesTotal,
    dispatchesPublished,
    dispatchesDraft,
    downloadsTotal,
    handbooksTotal,
    handbooksPublished,
    handbooksDraft,
    membersTotal,
    messagesTotal,
    subscribersTotal,
  ] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('briefings').select('id', { count: 'exact', head: true }),
    supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', false),
    supabase.from('dispatches').select('id', { count: 'exact', head: true }),
    supabase.from('dispatches').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('dispatches').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('downloads').select('id', { count: 'exact', head: true }),
    supabase.from('handbooks').select('id', { count: 'exact', head: true }),
    supabase.from('handbooks').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('handbooks').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('members').select('id', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).is('unsubscribed_at', null),
  ]);

  return {
    articles: {
      total: articlesTotal.count ?? 0,
      published: articlesPublished.count ?? 0,
      draft: articlesDraft.count ?? 0,
    },
    briefings: {
      total: briefingsTotal.count ?? 0,
      published: briefingsPublished.count ?? 0,
      draft: briefingsDraft.count ?? 0,
    },
    courses: {
      total: coursesTotal.count ?? 0,
      published: coursesPublished.count ?? 0,
      draft: coursesDraft.count ?? 0,
    },
    dispatches: {
      total: dispatchesTotal.count ?? 0,
      published: dispatchesPublished.count ?? 0,
      draft: dispatchesDraft.count ?? 0,
    },
    downloads: {
      total: downloadsTotal.count ?? 0,
    },
    handbooks: {
      total: handbooksTotal.count ?? 0,
      published: handbooksPublished.count ?? 0,
      draft: handbooksDraft.count ?? 0,
    },
    members: {
      total: membersTotal.count ?? 0,
    },
    messages: {
      total: messagesTotal.count ?? 0,
    },
    subscribers: {
      total: subscribersTotal.count ?? 0,
    },
  };
}

