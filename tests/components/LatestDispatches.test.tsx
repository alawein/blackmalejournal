import { render, screen } from '@testing-library/react';
import { LatestDispatches } from '@/components/home/LatestDispatches';

// No framer-motion mock needed — LatestDispatches is a server component
// that does not import framer-motion.

const mockDispatches = [
  {
    id: '1', title: 'Dispatch Alpha', slug: 'dispatch-alpha',
    lens: 'health' as const, excerpt: 'First excerpt', body: 'body',
    status: 'published' as const, author: 'The Chairman',
    cover_image: null, published_at: '2026-03-18T00:00:00Z', created_at: '2026-03-18T00:00:00Z',
  },
  {
    id: '2', title: 'Dispatch Beta', slug: 'dispatch-beta',
    lens: 'politics' as const, excerpt: 'Second excerpt', body: 'body',
    status: 'published' as const, author: 'The Chairman',
    cover_image: null, published_at: '2026-03-17T00:00:00Z', created_at: '2026-03-17T00:00:00Z',
  },
];

describe('LatestDispatches', () => {
  it('renders section heading', () => {
    render(<LatestDispatches dispatches={mockDispatches} />);
    expect(screen.getByText('Latest Dispatches')).toBeInTheDocument();
  });

  it('renders dispatch titles', () => {
    render(<LatestDispatches dispatches={mockDispatches} />);
    expect(screen.getByText('Dispatch Alpha')).toBeInTheDocument();
    expect(screen.getByText('Dispatch Beta')).toBeInTheDocument();
  });

  it('renders empty state when no dispatches', () => {
    render(<LatestDispatches dispatches={[]} />);
    expect(screen.getByText(/dispatches coming soon/i)).toBeInTheDocument();
  });

  it('renders "View all" link', () => {
    render(<LatestDispatches dispatches={mockDispatches} />);
    const link = screen.getByRole('link', { name: /all dispatches/i });
    expect(link).toHaveAttribute('href', '/blog');
  });
});
