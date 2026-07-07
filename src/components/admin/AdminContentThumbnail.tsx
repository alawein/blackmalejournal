import Image from 'next/image';
import { PLACEHOLDERS, type PlaceholderType } from '@/lib/placeholders';
import { cn } from '@/lib/utils';

interface AdminContentThumbnailProps {
  /** Direct image URL, or null/undefined to use the placeholder fallback. */
  src?: string | null;
  /** Accessible alt text — typically the content item title. */
  alt: string;
  /** Content type used to pick the right placeholder when `src` is empty. */
  type?: PlaceholderType;
  className?: string;
  /** Square thumbnail size in pixels. Default: 48. */
  size?: number;
}

/**
 * Tiny square thumbnail for admin listing tables. Uses the BMJ
 * placeholder for the given content type when no cover image is set,
 * and applies the standard halftone treatment used on public cards.
 */
export function AdminContentThumbnail({
  src,
  alt,
  type = 'cover',
  className,
  size = 48,
}: AdminContentThumbnailProps) {
  const resolved = src || PLACEHOLDERS[type] || PLACEHOLDERS.cover;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden border border-bmj-tan/20 bg-bmj-black',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="halftone object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grain-texture opacity-[0.08] mix-blend-overlay"
        aria-hidden="true"
      />
    </div>
  );
}
