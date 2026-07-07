import { render, screen } from '@testing-library/react';
import { HandbookCard } from '@/components/content/HandbookCard';

const defaultProps = {
  title: 'The Field Manual',
  slug: 'the-field-manual',
  lens: 'health' as const,
  description: 'A guide to physical discipline.',
  accessTier: 'basic' as const,
  publishedAt: '2026-03-15T12:00:00Z',
};

describe('HandbookCard', () => {
  it('renders title and description', () => {
    render(<HandbookCard {...defaultProps} />);
    expect(screen.getByText('The Field Manual')).toBeInTheDocument();
    expect(screen.getByText('A guide to physical discipline.')).toBeInTheDocument();
  });

  it('links to /handbooks/{slug}', () => {
    render(<HandbookCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/handbooks/the-field-manual');
  });

  it('shows lock icon when access tier is not free', () => {
    const { container } = render(<HandbookCard {...defaultProps} />);
    expect(container.querySelector('[data-testid="icon-Lock"]')).toBeInTheDocument();
  });

  it('does not show lock icon for free handbooks', () => {
    const { container } = render(
      <HandbookCard {...defaultProps} accessTier="free" />,
    );
    expect(container.querySelector('[data-testid="icon-Lock"]')).not.toBeInTheDocument();
  });

  it('renders lens badge', () => {
    render(<HandbookCard {...defaultProps} />);
    expect(screen.getByText('Health/Wellness')).toBeInTheDocument();
  });
});
