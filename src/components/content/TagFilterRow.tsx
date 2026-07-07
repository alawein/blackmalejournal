'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface TagFilterRowProps {
  tags: string[];
  activeTag: string | null;
}

export function TagFilterRow({ tags, activeTag }: TagFilterRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (tags.length === 0) return null;

  function handleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag === activeTag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {tags.map((tag) => {
        const isActive = tag === activeTag;
        return (
          <button
            type="button"
            key={tag}
            onClick={() => handleTag(tag)}
            className={[
              'filter-chip',
              isActive
                ? 'filter-chip-active'
                : 'filter-chip-inactive',
            ].join(' ')}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
