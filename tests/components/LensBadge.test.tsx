import { render, screen } from '@testing-library/react';
import { LensBadge } from '@/components/brand/LensBadge';
import type { Lens } from '@/lib/supabase/types';

describe('LensBadge', () => {
  const lenses: { lens: Lens; label: string }[] = [
    { lens: 'health', label: 'Health/Wellness' },
    { lens: 'politics', label: 'Politics/Law' },
    { lens: 'culture', label: 'Culture/Ideology' },
    { lens: 'entertainment', label: 'Entertainment/Technology' },
    { lens: 'business', label: 'Business/Finance' },
  ];

  it.each(lenses)('renders "$label" for $lens lens', ({ lens, label }) => {
    render(<LensBadge lens={lens} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LensBadge lens="health" className="mt-2" />);
    const el = screen.getByText('Health/Wellness');
    expect(el.className).toContain('mt-2');
  });

  it('renders as an inline span', () => {
    render(<LensBadge lens="politics" />);
    const el = screen.getByText('Politics/Law');
    expect(el.tagName).toBe('SPAN');
  });
});
