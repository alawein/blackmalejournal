// src/lib/supabase/bookmarks.ts
// Query functions for the member_bookmarks table.
import { createClient } from '@/lib/supabase/server';
import type { BookmarkedItem, SearchContentType } from '@/lib/supabase/types';

// ── isBookmarked ──────────────────────────────────────────────────────────────

export async function isBookmarked(
  memberId: string,
  contentType: string,
  contentId: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('member_bookmarks')
      .select('id')
      .eq('member_id', memberId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .limit(1);

    if (error) {
      console.error('[bookmarks] isBookmarked error:', error.message);
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    console.error('[bookmarks] isBookmarked threw:', err);
    return false;
  }
}

// ── getBookmarkCount ──────────────────────────────────────────────────────────

export async function getBookmarkCount(memberId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('member_bookmarks')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', memberId);

    if (error) {
      console.error('[bookmarks] getBookmarkCount error:', error.message);
      return 0;
    }

    return count ?? 0;
  } catch (err) {
    console.error('[bookmarks] getBookmarkCount threw:', err);
    return 0;
  }
}

// ── getBookmarksForMember ─────────────────────────────────────────────────────

type RawBookmark = {
  id: string;
  content_type: string;
  content_id: string;
  created_at: string;
};

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  lens: string;
  access_tier: string;
  published_at: string;
};

type BriefingRow = {
  id: string;
  title: string;
  slug: string;
  published_at: string;
  access_tier: string;
};

type DispatchRow = {
  id: string;
  title: string;
  slug: string;
  lens: string;
  published_at: string;
};

type HandbookRow = {
  id: string;
  title: string;
  slug: string;
  lens: string;
  access_tier: string;
  published_at: string;
};

const SUPPORTED_TYPES = new Set<string>(['article', 'briefing', 'dispatch', 'handbook']);

export async function getBookmarksForMember(memberId: string): Promise<BookmarkedItem[]> {
  try {
    const supabase = await createClient();

    // 1. Fetch all bookmarks for this member, newest first
    const { data: rawBookmarks, error: bookmarksError } = await supabase
      .from('member_bookmarks')
      .select('id, content_type, content_id, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (bookmarksError) {
      console.error('[bookmarks] getBookmarksForMember error:', bookmarksError.message);
      return [];
    }

    if (!rawBookmarks || rawBookmarks.length === 0) return [];

    const bookmarks = rawBookmarks as RawBookmark[];

    // 2. Group content IDs by type (filter unsupported types defensively)
    const byType: Record<string, string[]> = {};
    for (const bm of bookmarks) {
      if (!SUPPORTED_TYPES.has(bm.content_type)) continue;
      if (!byType[bm.content_type]) byType[bm.content_type] = [];
      byType[bm.content_type].push(bm.content_id);
    }

    // 3. Batch-fetch content rows per type
    const contentMaps: Record<string, Map<string, { title: string; slug: string; lens?: string; access_tier?: string; published_at: string }>> = {};

    if (byType['article']?.length) {
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, lens, access_tier, published_at')
        .in('id', byType['article']);
      const rows = (data ?? []) as ArticleRow[];
      contentMaps['article'] = new Map(rows.map((r) => [r.id, { title: r.title, slug: r.slug, lens: r.lens, access_tier: r.access_tier, published_at: r.published_at }]));
    }

    if (byType['briefing']?.length) {
      const { data } = await supabase
        .from('briefings')
        .select('id, title, slug, access_tier, published_at')
        .in('id', byType['briefing']);
      const rows = (data ?? []) as BriefingRow[];
      contentMaps['briefing'] = new Map(rows.map((r) => [r.id, { title: r.title, slug: r.slug, access_tier: r.access_tier, published_at: r.published_at }]));
    }

    if (byType['dispatch']?.length) {
      const { data } = await supabase
        .from('dispatches')
        .select('id, title, slug, lens, published_at')
        .in('id', byType['dispatch']);
      const rows = (data ?? []) as DispatchRow[];
      contentMaps['dispatch'] = new Map(rows.map((r) => [r.id, { title: r.title, slug: r.slug, lens: r.lens, published_at: r.published_at }]));
    }

    if (byType['handbook']?.length) {
      const { data } = await supabase
        .from('handbooks')
        .select('id, title, slug, lens, access_tier, published_at')
        .in('id', byType['handbook']);
      const rows = (data ?? []) as HandbookRow[];
      contentMaps['handbook'] = new Map(rows.map((r) => [r.id, { title: r.title, slug: r.slug, lens: r.lens, access_tier: r.access_tier, published_at: r.published_at }]));
    }

    // 4. Join bookmarks with content, skip orphans (content deleted)
    const results: BookmarkedItem[] = [];
    for (const bm of bookmarks) {
      const map = contentMaps[bm.content_type];
      if (!map) continue;
      const content = map.get(bm.content_id);
      if (!content) continue; // orphaned bookmark — skip

      results.push({
        bookmarkId: bm.id,
        contentType: bm.content_type as SearchContentType,
        contentId: bm.content_id,
        title: content.title,
        slug: content.slug,
        lens: content.lens as BookmarkedItem['lens'],
        accessTier: content.access_tier as BookmarkedItem['accessTier'],
        publishedAt: content.published_at,
        bookmarkedAt: bm.created_at,
      });
    }

    // Already ordered by bookmarkedAt DESC (from the initial query order)
    return results;
  } catch (err) {
    console.error('[bookmarks] getBookmarksForMember threw:', err);
    return [];
  }
}
