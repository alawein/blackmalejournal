import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import type { Lens } from '@/lib/supabase/types';

type ImageEffect = 'halftone' | 'halftone-heavy' | 'duotone' | 'none';

interface StylizedImageProps extends Omit<ImageProps, 'className'> {
  /** Visual treatment applied to the image */
  effect?: ImageEffect;
  /** Show grain noise overlay on top of image */
  grain?: boolean;
  /** Show halftone dot pattern overlay */
  dots?: boolean;
  /** For duotone: the lens determines the color wash */
  lens?: Lens;
  /** Additional className for the image element */
  imageClassName?: string;
  /** Additional className for the container */
  className?: string;
  /** Aspect ratio of the container — uses Tailwind aspect classes */
  aspect?: 'video' | 'square' | 'portrait' | 'auto';
}

const aspectClasses: Record<NonNullable<StylizedImageProps['aspect']>, string> = {
  video: 'aspect-[16/9]',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  auto: '',
};

const duotoneLensColors: Record<Lens, string> = {
  politics: 'bg-bmj-crimson',
  health: 'bg-bmj-olive',
  business: 'bg-bmj-gold',
  culture: 'bg-bmj-medium-brown',
  entertainment: 'bg-bmj-purple',
};

/**
 * Image wrapper that applies BMJ editorial effects:
 * - halftone: subtle contrast + desaturation
 * - halftone-heavy: aggressive newsprint treatment
 * - duotone: grayscale + lens-colored multiply blend
 * - grain: SVG noise overlay
 * - dots: halftone dot pattern overlay
 */
export function StylizedImage({
  effect = 'halftone',
  grain = true,
  dots = false,
  lens,
  imageClassName,
  className,
  aspect = 'video',
  alt,
  ...rest
}: StylizedImageProps) {
  const effectClass = effect !== 'none' ? effect : '';
  const showDuotoneBg = effect === 'duotone' && lens;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-bmj-black',
        aspectClasses[aspect],
        showDuotoneBg && duotoneLensColors[lens],
        className,
      )}
    >
      <Image
        alt={alt}
        className={cn(
          'object-cover',
          effectClass,
          imageClassName,
        )}
        {...rest}
      />

      {/* Grain noise overlay */}
      {grain && (
        <div
          className="pointer-events-none absolute inset-0 bg-grain-texture opacity-[0.06] mix-blend-overlay"
          aria-hidden="true"
        />
      )}

      {/* Halftone dot pattern overlay */}
      {dots && (
        <div
          className="pointer-events-none absolute inset-0 halftone-dots"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
