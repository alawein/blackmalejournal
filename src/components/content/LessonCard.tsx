import Image from 'next/image';
import Link from 'next/link';
import { academyLessonPath } from '@/lib/paths';
import { Lock, Play, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  title: string;
  slug: string;
  courseSlug: string;
  orderNumber: number;
  duration: number;
  hasAccess: boolean;
  hasVideo?: boolean;
  /** Parent course cover image — used as a tinted background on the lesson card. */
  courseCoverImage?: string | null;
  /**
   * Accent classes from the parent course's lens theme (e.g. card border classes).
   * When provided, overrides the default red accent.
   */
  accentBorderClass?: string;
}

/** Caps the visual duration bar at 60 minutes. */
const MAX_DURATION_FOR_BAR = 60;

export function LessonCard({
  title,
  slug,
  courseSlug,
  orderNumber,
  duration,
  hasAccess,
  hasVideo = false,
  courseCoverImage,
  accentBorderClass,
}: LessonCardProps) {
  const paddedNumber = String(orderNumber).padStart(2, '0');
  const hasCoverBackground = Boolean(courseCoverImage);
  const durationBarWidth =
    duration > 0
      ? Math.min(100, Math.round((duration / MAX_DURATION_FOR_BAR) * 100))
      : 0;

  const content = (
    <article
      className={cn(
        'group relative overflow-hidden surface-panel-strong transition-colors',
        hasAccess ? 'hover:border-bmj-red/60' : 'opacity-70',
        accentBorderClass,
      )}
    >
      {/* Darkened cover background */}
      {hasCoverBackground && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Image
            src={courseCoverImage!}
            alt=""
            fill
            className="halftone object-cover opacity-20"
            sizes="(max-width: 768px) 100vw, 720px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bmj-brown via-bmj-brown/85 to-bmj-brown/60" />
          <div className="absolute inset-0 bg-grain-texture opacity-[0.05] mix-blend-overlay" />
        </div>
      )}

      <div className="relative flex items-center gap-4 p-4">
        {/* Lesson number — larger when rendered over a cover background */}
        <span
          className={cn(
            'flex shrink-0 items-center justify-center bg-bmj-black font-mono tracking-widest text-bmj-tan',
            hasCoverBackground ? 'h-14 w-14 text-lg text-bmj-cream' : 'h-10 w-10 text-sm',
          )}
        >
          {paddedNumber}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg uppercase tracking-display leading-tight text-bmj-white">{title}</h3>

          <div className="mt-1 flex items-center gap-3">
            {hasVideo && (
              <span className="flex items-center gap-1 font-label text-xs uppercase tracking-widest text-bmj-amber">
                <Play size={10} />
                Video
              </span>
            )}
            {duration > 0 && (
              <span className="flex items-center gap-1 font-mono text-xs text-bmj-cream/80">
                <Clock size={10} />
                {duration} min
              </span>
            )}
          </div>

          {/* Visual duration bar — scales lesson length from 0 to 60min. */}
          {duration > 0 && (
            <div
              className="mt-2 h-1 w-full max-w-xs overflow-hidden bg-bmj-tan/15"
              role="presentation"
              aria-hidden="true"
            >
              <div
                className="h-full bg-gradient-to-r from-bmj-red to-bmj-amber transition-all duration-500"
                style={{ width: `${durationBarWidth}%` }}
              />
            </div>
          )}
        </div>

        {/* Access indicator */}
        <div className="shrink-0">
          {hasAccess ? (
            <span className="font-label text-xs uppercase tracking-widest text-bmj-cream/40">
              &rarr;
            </span>
          ) : (
            <Lock size={16} className="text-bmj-amber" />
          )}
        </div>
      </div>
    </article>
  );

  if (!hasAccess) return content;

  return (
    <Link
      href={academyLessonPath(courseSlug, slug)}
      className="no-underline"
    >
      {content}
    </Link>
  );
}
