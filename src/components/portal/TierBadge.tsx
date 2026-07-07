import type { MemberTier } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: MemberTier;
  className?: string;
}

const TIER_STYLES: Record<
  MemberTier,
  { bg: string; text: string; border: string; label: string }
> = {
  free: {
    bg: 'bg-bmj-tan/10',
    text: 'text-bmj-tan',
    border: 'border-bmj-tan/40',
    label: 'FREE',
  },
  basic: {
    bg: 'bg-bmj-amber/10',
    text: 'text-bmj-amber',
    border: 'border-bmj-amber/40',
    label: 'BASIC',
  },
  premium: {
    bg: 'bg-bmj-red/10',
    text: 'text-bmj-red',
    border: 'border-bmj-red/40',
    label: 'PREMIUM',
  },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const style = TIER_STYLES[tier];
  return (
    <span
      className={cn(
        'inline-block border px-4 py-1.5 font-label text-xs tracking-widest',
        style.bg,
        style.text,
        style.border,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
