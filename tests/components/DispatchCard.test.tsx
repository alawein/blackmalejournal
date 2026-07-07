import { render, screen } from '@testing-library/react';
import { DispatchCard } from '@/components/content/DispatchCard';

const defaultProps = {
  title: 'Test Dispatch',
  slug: 'test-dispatch',
  lens: 'culture' as const,
  excerpt: 'A short excerpt for the dispatch.',
  publishedAt: '2026-03-15T12:00:00Z',
};

describe('DispatchCard', () => {
  it('renders title and excerpt', () => {
    render(<DispatchCard {...defaultProps} />);
    expect(screen.getByText('Test Dispatch')).toBeInTheDocument();
    expect(screen.getByText('A short excerpt for the dispatch.')).toBeInTheDocument();
  });

  it('links to /blog/{slug}', () => {
    render(<DispatchCard {...defaultProps} />);
    const link = screen.getByRole('link', { name: 'Test Dispatch' });
    expect(link).toHaveAttribute('href', '/blog/test-dispatch');
  });

  it('shows lens badge and formatted date', () => {
    render(<DispatchCard {...defaultProps} />);
    expect(screen.getByText('Culture/Ideology')).toBeInTheDocument();
    expect(screen.getByText('MARCH 15, 2026')).toBeInTheDocument();
  });
});
