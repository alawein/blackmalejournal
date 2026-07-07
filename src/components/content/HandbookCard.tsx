import Link from 'next/link';
import { handbookPath } from '@/lib/paths';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import { LensBadge } from '@/components/brand/LensBadge';
import { PLACEHOLDERS } from '@/lib/placeholders';
import { IMAGE_SIZES } from '@/lib/images';
import { formatDate } from '@/lib/utils';
import type { AccessTier, Lens } from '@/lib/supabase/types';

interface HandbookCardProps {
  title: string;
  slug: string;
  lens: Lens;
  description: string;
  accessTier: AccessTier;
  publishedAt: string;
  coverImage?: string | null;
}

export function HandbookCard({
  title,
  slug,
  lens,
  description,
  accessTier,
  publishedAt,
  coverImage,
}: HandbookCardProps) {
  const isPremium = accessTier !== 'free';

  return (
    <Link href={handbookPath(slug)} className="group no-underline">
      <article className="card-media flex flex-col border-t-bmj-red sm:flex-row">
        {/* Cover image or icon */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-bmj-black sm:aspect-auto sm:w-48 sm:shrink-0">
          <Image
            src={coverImage || PLACEHOLDERS.handbook}
            alt={title}
            fill
            className="halftone object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={IMAGE_SIZES.card}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-grain-texture opacity-[0.06] mix-blend-overlay"
            aria-hidden="true"
          />
          {isPremium && (
            <div className="absolute right-2 top-2">
              <Lock
                size={14}
                className="text-bmj-amber"
                data-testid="icon-Lock"
              />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-3">
            <LensBadge lens={lens} />
            {isPremium && (
              <span className="font-label text-xs uppercase tracking-label text-bmj-amber">
                {accessTier === 'premium' ? 'Premium' : 'Basic'}
              </span>
            )}
          </div>

          <h3 className="mb-2 font-display text-xl uppercase tracking-display leading-tight text-bmj-white group-hover:text-bmj-cream">
            {title}
          </h3>

          <p className="line-clamp-2 flex-1 font-body text-sm leading-relaxed text-bmj-cream/70">
            {description}
          </p>

          <div className="mt-4 flex items-center border-t border-bmj-tan/20 pt-3">
            <span className="font-mono text-xs text-bmj-cream/80">
              {formatDate(publishedAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
