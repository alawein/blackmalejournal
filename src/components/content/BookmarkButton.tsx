'use client';

import { useState, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleBookmark } from '@/app/(auth)/portal/bookmarks/actions';

interface BookmarkButtonProps {
  contentType: string;
  contentId: string;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
}

export function BookmarkButton({
  contentType,
  contentId,
  initialBookmarked,
  isLoggedIn,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) return null;

  const label = bookmarked ? 'Remove bookmark' : 'Save to bookmarks';

  function handleClick() {
    const prev = bookmarked;
    setBookmarked(!prev);

    startTransition(async () => {
      const result = await toggleBookmark(contentType, contentId);
      if (result.error) {
        // Revert on failure
        setBookmarked(prev);
      } else if (typeof result.bookmarked === 'boolean') {
        // Sync with server truth
        setBookmarked(result.bookmarked);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={label}
      aria-pressed={bookmarked}
      className={`inline-flex items-center gap-1.5 font-label text-xs uppercase tracking-widest transition-colors disabled:opacity-50 ${
        bookmarked
          ? 'text-bmj-red'
          : 'text-bmj-tan hover:text-bmj-red'
      }`}
    >
      <Bookmark
        size={16}
        fill={bookmarked ? 'currentColor' : 'none'}
      />
      {bookmarked ? 'Saved' : 'Save'}
    </button>
  );
}
