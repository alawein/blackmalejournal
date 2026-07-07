import { render, screen } from '@testing-library/react';
import QuoteCard from '@/components/content/QuoteCard';

const defaultProps = {
  quote: 'By any means necessary.',
  attribution: 'Malcolm X',
};

describe('QuoteCard', () => {
  it('renders quote and attribution', () => {
    render(<QuoteCard {...defaultProps} />);
    expect(screen.getByText('By any means necessary.')).toBeInTheDocument();
    expect(screen.getByText('Malcolm X')).toBeInTheDocument();
  });

  it('applies lens-specific background color class', () => {
    const { container, rerender } = render(<QuoteCard {...defaultProps} lens="politics" />);
    expect(container.firstChild).toHaveClass('bg-bmj-red/10');

    rerender(<QuoteCard {...defaultProps} lens="culture" />);
    expect(container.firstChild).toHaveClass('bg-bmj-tan/10');
  });

  it('renders portrait when provided', () => {
    render(<QuoteCard {...defaultProps} portraitUrl="/img/portrait.jpg" />);
    const img = screen.getByRole('img', { name: 'Malcolm X' });
    expect(img).toBeInTheDocument();
  });

  it('defaults to health lens', () => {
    const { container } = render(<QuoteCard {...defaultProps} />);
    expect(container.firstChild).toHaveClass('bg-bmj-amber/10');
  });
});
