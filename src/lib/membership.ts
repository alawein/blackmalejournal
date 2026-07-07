import type { AccessTier, MemberTier, PaidMemberTier } from '@/lib/supabase/types';

const TIER_RANK: Record<MemberTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

export function compareTiers(left: MemberTier, right: AccessTier): number {
  return TIER_RANK[left] - TIER_RANK[right];
}

export function includesTier(currentTier: MemberTier, requiredTier: AccessTier): boolean {
  return compareTiers(currentTier, requiredTier) >= 0;
}

export function isTierUpgrade(
  currentTier: MemberTier,
  requestedTier: PaidMemberTier,
): boolean {
  return compareTiers(requestedTier, currentTier) > 0;
}
