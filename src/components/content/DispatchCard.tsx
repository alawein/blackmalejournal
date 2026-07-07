import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { LensBadge } from '@/components/brand/LensBadge';
import { getLensTheme } from '@/lib/lens-theme';
import { dispatchPath } from '@/lib/paths';
import { cn } from '@/lib/utils';
import type { Lens } from '@/lib/supabase/types';

interface DispatchCardProps {
  title: string;
  slug: string;
  lens: Lens;
  excerpt: string;
  publishedAt: string;
}

export function DispatchCard({
  title,
  slug,
  lens,
  excerpt,
  publishedAt,
}: DispatchCardProps) {
  const theme = getLensTheme(lens);

  return (
    <article
      className={cn(
        'group card-stripe border border-bmj-tan/15',
        theme.cardBorderLeft,
        theme.hoverBorder,
      )}
    >
      <Link
        href={dispatchPath(slug)}
        className="block p-6 no-underline sm:p-8"
        aria-label={title}
      >
        <div className="mb-3 flex items-center gap-4">
          <LensBadge lens={lens} />
          <span className="font-mono text-xs text-bmj-cream/80">
            {formatDate(publishedAt)}
          </span>
        </div>

        <h3 className="mb-3 font-display text-2xl uppercase tracking-display leading-tight text-bmj-white sm:text-3xl">
          {title}
        </h3>

        <p className="line-clamp-2 font-body text-sm leading-relaxed text-bmj-cream/70">
          {excerpt}
        </p>
      </Link>
    </article>
  );
}
