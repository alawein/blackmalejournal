import { render, screen } from '@testing-library/react';
import { BriefingCard } from '@/components/content/BriefingCard';
import type { Briefing } from '@/lib/supabase/types';

const baseBriefing: Briefing = {
  id: '1',
  issue_number: 1,
  title: 'Weekend Briefing No. 1',
  slug: 'weekend-briefing-001',
  sections: [{ title: 'First Section', body: 'Body text' }],
  lead_kicker: 'First Section',
  access_tier: 'free',
  status: 'published',
  cover_image: null,
  published_at: '2026-03-01T00:00:00Z',
  created_at: '2026-03-01T00:00:00Z',
};

describe('BriefingCard', () => {
  it('renders issue number as "No. 001"', () => {
    render(<BriefingCard briefing={baseBriefing} />);
    expect(screen.getByText('No. 001')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<BriefingCard briefing={baseBriefing} />);
    expect(screen.getByText('Weekend Briefing No. 1')).toBeInTheDocument();
  });

  it('shows first section title as preview', () => {
    render(<BriefingCard briefing={baseBriefing} />);
    expect(screen.getByText('First Section')).toBeInTheDocument();
  });

  it('shows premium badge when access_tier is not free', () => {
    const premiumBriefing = { ...baseBriefing, access_tier: 'premium' as const };
    render(<BriefingCard briefing={premiumBriefing} />);
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });
});
