import { render, screen } from '@testing-library/react';
import { TierBadge } from '@/components/portal/TierBadge';
import type { MemberTier } from '@/lib/supabase/types';

describe('TierBadge', () => {
  const tiers: { tier: MemberTier; label: string }[] = [
    { tier: 'free', label: 'FREE' },
    { tier: 'basic', label: 'BASIC' },
    { tier: 'premium', label: 'PREMIUM' },
  ];

  it.each(tiers)('renders "$label" for $tier tier', ({ tier, label }) => {
    render(<TierBadge tier={tier} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<TierBadge tier="basic" />);
    expect(screen.getByText('BASIC').tagName).toBe('SPAN');
  });
});
