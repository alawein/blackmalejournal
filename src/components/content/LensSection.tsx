import { cn } from '@/lib/utils';
import { getLensTheme, type LensTheme } from '@/lib/lens-theme';
import type { Lens } from '@/lib/supabase/types';
import type { ReactNode } from 'react';

interface LensSectionProps {
  /** The lens that determines accent colors */
  lens: Lens;
  /** Content to render inside the section */
  children: ReactNode;
  /** Additional className for the wrapper */
  className?: string;
  /** Whether to show a top accent border in the lens color */
  accentBorder?: boolean;
  /** Whether to apply lens-tinted background */
  tintedBackground?: boolean;
}

/**
 * Wrapper that applies lens-specific accent colors to its children
 * via CSS custom properties. Child elements can use:
 *   - var(--lens-accent) for the accent color
 *   - var(--lens-accent-soft) for a soft background tint
 *
 * Also exposes Tailwind-friendly data attribute: data-lens="health" etc.
 */
export function LensSection({
  lens,
  children,
  className,
  accentBorder = true,
  tintedBackground = false,
}: LensSectionProps) {
  const theme = getLensTheme(lens);

  // Map lens to CSS color values for custom properties
  const accentColorMap: Record<Lens, string> = {
    politics: 'var(--bmj-crimson)',
    health: 'var(--bmj-olive)',
    business: 'var(--bmj-gold)',
    culture: 'var(--bmj-medium-brown)',
    entertainment: 'var(--bmj-purple)',
  };

  const accentColor = accentColorMap[lens];

  return (
    <div
      data-lens={lens}
      className={cn(
        'relative',
        accentBorder && 'border-t-[3px]',
        accentBorder && theme.accentBorder,
        tintedBackground && theme.accentSoftBg,
        className,
      )}
      style={{
        '--lens-accent': accentColor,
        '--lens-accent-soft': `color-mix(in srgb, ${accentColor} 10%, transparent)`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Lens-colored kicker label — small uppercase text in the lens accent color
 */
export function LensKicker({
  lens,
  children,
  className,
}: {
  lens: Lens;
  children: ReactNode;
  className?: string;
}) {
  const theme = getLensTheme(lens);

  return (
    <span
      className={cn(
        'font-label text-stamp uppercase tracking-label-xl',
        theme.accentText,
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Utility: get the LensTheme for use outside components
 */
export { getLensTheme, type LensTheme };
