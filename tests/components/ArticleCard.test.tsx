import { render, screen } from '@testing-library/react';
import { ArticleCard } from '@/components/content/ArticleCard';

const defaultProps = {
  title: 'Test Article',
  slug: 'test-article',
  lens: 'health' as const,
  excerpt: 'Test excerpt text',
  readingTime: 5,
  publishedAt: '2026-03-15T12:00:00Z',
};

describe('ArticleCard', () => {
  it('renders title, excerpt, and reading time', () => {
    render(<ArticleCard {...defaultProps} />);
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test excerpt text')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<ArticleCard {...defaultProps} />);
    expect(screen.getByText('Mar 15, 2026')).toBeInTheDocument();
  });

  it('shows lock icon when isPremium is true', () => {
    const { container } = render(<ArticleCard {...defaultProps} isPremium />);
    // Lock icon from lucide-react renders as an svg
    const lockWrapper = container.querySelector('.text-bmj-amber');
    expect(lockWrapper).toBeInTheDocument();
  });

  it('links to /articles/{slug}', () => {
    render(<ArticleCard {...defaultProps} />);
    const link = screen.getByRole('link', { name: 'Test Article' });
    expect(link).toHaveAttribute('href', '/articles/test-article');
  });

  it('shows featured label when isFeatured is true', () => {
    render(<ArticleCard {...defaultProps} isFeatured />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });
});
