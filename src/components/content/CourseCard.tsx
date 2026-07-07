import Link from 'next/link';
import { Lock } from 'lucide-react';
import { PLACEHOLDERS } from '@/lib/placeholders';
import { IMAGE_SIZES } from '@/lib/images';
import { StylizedImage } from '@/components/ui/StylizedImage';
import { academyCoursePath } from '@/lib/paths';
import { getCategoryLabel } from '@/lib/utils';
import type { AccessTier } from '@/lib/supabase/types';

interface CourseCardProps {
  title: string;
  slug: string;
  category: string;
  description: string;
  accessTier: AccessTier;
  published: boolean;
  coverImage?: string | null;
}

export function CourseCard({
  title,
  slug,
  category,
  description,
  accessTier,
  published,
  coverImage,
}: CourseCardProps) {
  const isPremium = accessTier !== 'free';

  const card = (
    <article
      className={[
        'group flex flex-col card-media border-t-bmj-red',
        published
          ? 'hover:border-bmj-red/60'
          : 'opacity-60 cursor-default',
      ].join(' ')}
    >
      {/* Cover image with halftone treatment */}
      <div className="relative">
        <StylizedImage
          src={coverImage || PLACEHOLDERS.course}
          alt={title}
          fill
          effect="halftone"
          grain
          dots
          aspect="video"
          sizes={IMAGE_SIZES.card}
          imageClassName="transition-transform duration-500 group-hover:scale-105"
        />
        {!published && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-bmj-black/70">
            <span className="font-label text-xs uppercase tracking-label text-bmj-cream">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="mb-3 inline-block self-start rounded-sm border border-bmj-tan/40 px-2 py-0.5 font-label text-xs uppercase tracking-label text-bmj-tan">
          {getCategoryLabel(category)}
        </span>

        <h3 className="mb-3 line-clamp-2 font-display text-xl uppercase tracking-display leading-tight text-bmj-white">
          {title}
        </h3>

        <p className="line-clamp-3 flex-1 font-body text-sm leading-relaxed text-bmj-cream/70">
          {description}
        </p>

        <div className="mt-4 flex items-center border-t border-bmj-tan/20 pt-4">
          {isPremium ? (
            <span className="flex items-center gap-1.5 font-label text-xs uppercase tracking-label text-bmj-amber">
              <Lock size={12} />
              Premium
            </span>
          ) : (
            <span className="font-label text-xs uppercase tracking-label text-bmj-cream">
              Free
            </span>
          )}
        </div>
      </div>
    </article>
  );

  if (!published) return card;

  return (
    <Link href={academyCoursePath(slug)} className="no-underline">
      {card}
    </Link>
  );
}
