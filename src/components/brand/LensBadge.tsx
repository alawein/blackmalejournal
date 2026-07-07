import type { Lens } from '@/lib/supabase/types';
import { getLensTheme } from '@/lib/lens-theme';
import { cn } from '@/lib/utils';

interface LensBadgeProps {
  lens: Lens;
  className?: string;
}

export function LensBadge({ lens, className = '' }: LensBadgeProps) {
  const theme = getLensTheme(lens);

  return (
    <span
      className={cn(
        'inline-block rounded-sm px-2 py-0.5 font-label text-xs uppercase tracking-widest',
        theme.badgeClasses,
        className,
      )}
    >
      {theme.label}
    </span>
  );
}
