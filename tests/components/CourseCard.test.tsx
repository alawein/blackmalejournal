import { render, screen } from '@testing-library/react';
import { CourseCard } from '@/components/content/CourseCard';

const defaultProps = {
  title: 'Fundamentals of Discipline',
  slug: 'fundamentals-of-discipline',
  category: 'martial-arts',
  description: 'A course on discipline and focus.',
  accessTier: 'free' as const,
  published: true,
};

describe('CourseCard', () => {
  it('renders title, description, and category label', () => {
    render(<CourseCard {...defaultProps} />);
    expect(screen.getByText('Fundamentals of Discipline')).toBeInTheDocument();
    expect(screen.getByText('A course on discipline and focus.')).toBeInTheDocument();
    expect(screen.getByText('Martial Arts')).toBeInTheDocument();
  });

  it('links to /academy/{slug} when published', () => {
    render(<CourseCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/academy/fundamentals-of-discipline');
  });

  it('shows "Coming Soon" overlay when not published', () => {
    render(<CourseCard {...defaultProps} published={false} />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows Premium or Free tier badge', () => {
    const { rerender } = render(<CourseCard {...defaultProps} accessTier="premium" />);
    expect(screen.getByText('Premium')).toBeInTheDocument();

    rerender(<CourseCard {...defaultProps} accessTier="free" />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
