import Image from 'next/image';
import Link from 'next/link';
import { briefingPath } from '@/lib/paths';
import { Lock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PLACEHOLDERS } from '@/lib/placeholders';
import { IMAGE_SIZES } from '@/lib/images';
import type { Briefing, BriefingListItem } from '@/lib/supabase/types';

interface BriefingCardProps {
  briefing: Briefing | BriefingListItem;
}

export function BriefingCard({ briefing }: BriefingCardProps) {
  const issueLabel = `No. ${String(briefing.issue_number).padStart(3, '0')}`;
  const previewText =
    briefing.lead_kicker?.trim() ||
    ('sections' in briefing ? briefing.sections[0]?.title : '') ||
    '';
  const isPremium = briefing.access_tier !== 'free';
  const coverSrc = briefing.cover_image || PLACEHOLDERS.briefing;

  return (
    <article className="group relative card-stripe border border-bmj-border-subtle border-l-bmj-red surface-panel">
      <Link
        href={briefingPath(briefing.slug)}
        className="flex flex-col gap-0 no-underline sm:flex-row"
        aria-label={briefing.title}
      >
        {/* Cover image — top on mobile, left on desktop */}
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-bmj-black sm:aspect-auto sm:h-auto sm:w-48 sm:self-stretch md:w-56">
          <Image
            src={coverSrc}
            alt={briefing.title}
            fill
            className="halftone object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={IMAGE_SIZES.thumbnail}
          />
          {/* Grain overlay */}
          <div
            className="pointer-events-none absolute inset-0 bg-grain-texture opacity-[0.06] mix-blend-overlay"
            aria-hidden="true"
          />
          {isPremium && (
            <div className="absolute right-2 top-2 rounded-sm bg-bmj-black/80 p-1">
              <Lock size={12} className="text-bmj-amber" />
            </div>
          )}
        </div>

        {/* Text column */}
        <div className="flex-1 p-6 sm:p-8">
          {/* Issue + date row */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-bmj-cream/80">
              {issueLabel}
            </span>
            <span className="font-mono text-xs text-bmj-cream/80">
              {formatDate(briefing.published_at)}
            </span>
            {isPremium && (
              <span className="ml-auto flex items-center gap-1 font-label text-xs uppercase tracking-widest text-bmj-amber">
                <Lock size={10} />
                Premium
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-3 font-display text-3xl uppercase tracking-display leading-tight text-bmj-white sm:text-4xl">
            {briefing.title}
          </h3>

          {/* First section title as preview */}
          {previewText && (
            <p className="font-label text-sm uppercase tracking-label text-bmj-cream/78">
              {previewText}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
