import { render, screen } from '@testing-library/react';
import PosterBlock from '@/components/content/PosterBlock';

const defaultProps = {
  title: 'Rise Up',
  lens: 'politics' as const,
  linkUrl: '/articles/rise-up',
};

describe('PosterBlock', () => {
  it('renders title and lens label', () => {
    render(<PosterBlock {...defaultProps} />);
    expect(screen.getByText('Rise Up')).toBeInTheDocument();
    expect(screen.getByText('politics')).toBeInTheDocument();
  });

  it('links to linkUrl', () => {
    render(<PosterBlock {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/articles/rise-up');
  });

  it('renders excerpt when provided', () => {
    render(<PosterBlock {...defaultProps} excerpt="An excerpt about rising." />);
    expect(screen.getByText('An excerpt about rising.')).toBeInTheDocument();
  });

  it('renders background image when provided', () => {
    const { container } = render(<PosterBlock {...defaultProps} backgroundImageUrl="/img/poster.jpg" />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('poster.jpg'));
  });
});
