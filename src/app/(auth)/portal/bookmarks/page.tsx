import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/supabase/access';
import { getBookmarksForMember } from '@/lib/supabase/bookmarks';
import { LensBadge } from '@/components/brand/LensBadge';
import { BookmarkButton } from '@/components/content/BookmarkButton';
import { SEARCH_TYPE_PATHS } from '@/lib/content/search-constants';
import type { BookmarkedItem, Lens, SearchContentType } from '@/lib/supabase/types';
import { PATHS } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Saved — Member Portal',
  robots: { index: false, follow: false },
};

const SECTION_ORDER: { type: SearchContentType; label: string }[] = [
  { type: 'article', label: 'ARTICLES' },
  { type: 'briefing', label: 'BRIEFINGS' },
  { type: 'dispatch', label: 'DISPATCHES' },
  { type: 'handbook', label: 'HANDBOOKS' },
];

function daysAgo(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return 'Saved today';
  if (diff === 1) return 'Saved 1 day ago';
  return `Saved ${diff} days ago`;
}

export default async function SavedPage() {
  const user = await getAuthUser();

  if (!user) redirect(PATHS.LOGIN);

  const bookmarks = await getBookmarksForMember(user.id);

  // Group by content type
  const grouped: Record<string, BookmarkedItem[]> = {};
  for (const bm of bookmarks) {
    if (!grouped[bm.contentType]) grouped[bm.contentType] = [];
    grouped[bm.contentType].push(bm);
  }

  const isEmpty = bookmarks.length === 0;

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
        <Link href={PATHS.PORTAL} className="text-bmj-tan hover:text-bmj-cream">
          Portal
        </Link>{' '}
        / Saved
      </p>

      <h1 className="mb-10 font-display text-4xl text-bmj-white sm:text-5xl">
        SAVED
      </h1>

      {isEmpty ? (
        <div className="border border-bmj-tan/20 bg-bmj-brown p-8 text-center">
          <p className="mb-4 font-body text-sm text-bmj-cream/70">
            No saved content yet. Bookmark articles and handbooks as you read.
          </p>
          <Link
            href={PATHS.ARTICLES}
            className="inline-block bg-bmj-red px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-white no-underline transition-opacity hover:opacity-90"
          >
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {SECTION_ORDER.map(({ type, label }) => {
            const items = grouped[type];
            if (!items || items.length === 0) return null;

            return (
              <section key={type}>
                <h2 className="mb-6 font-display text-2xl text-bmj-white">
                  {label}
                </h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const href = `${SEARCH_TYPE_PATHS[item.contentType]}/${item.slug}`;
                    return (
                      <div
                        key={item.bookmarkId}
                        className="flex items-center justify-between gap-4 border-l-4 border-bmj-red bg-bmj-brown p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            {item.lens && (
                              <LensBadge lens={item.lens as Lens} />
                            )}
                            {item.accessTier &&
                              item.accessTier !== 'free' && (
                                <span className="inline-block rounded-sm bg-bmj-amber/20 px-2 py-0.5 font-label text-xs uppercase tracking-widest text-bmj-amber">
                                  {item.accessTier}
                                </span>
                              )}
                          </div>
                          <Link
                            href={href}
                            className="font-display text-lg text-bmj-white no-underline hover:text-bmj-cream"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-1 font-mono text-xs text-bmj-tan">
                            {daysAgo(item.bookmarkedAt)}
                          </p>
                        </div>
                        <BookmarkButton
                          contentType={item.contentType}
                          contentId={item.contentId}
                          initialBookmarked={true}
                          isLoggedIn={true}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
