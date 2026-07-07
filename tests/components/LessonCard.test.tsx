import { render, screen } from '@testing-library/react';
import { LessonCard } from '@/components/content/LessonCard';

const defaultProps = {
  title: 'The Morning Protocol',
  slug: 'the-morning-protocol',
  courseSlug: 'discipline-foundations',
  orderNumber: 1,
  duration: 12,
  hasAccess: true,
};

describe('LessonCard', () => {
  it('renders lesson number and title', () => {
    render(<LessonCard {...defaultProps} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('The Morning Protocol')).toBeInTheDocument();
  });

  it('shows duration', () => {
    render(<LessonCard {...defaultProps} />);
    expect(screen.getByText('12 min')).toBeInTheDocument();
  });

  it('links to lesson page when user has access', () => {
    render(<LessonCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      '/academy/discipline-foundations/the-morning-protocol',
    );
  });

  it('shows lock icon when user has no access', () => {
    const { container } = render(
      <LessonCard {...defaultProps} hasAccess={false} />,
    );
    expect(container.querySelector('[data-testid="icon-Lock"]')).toBeInTheDocument();
  });

  it('does not link when user has no access', () => {
    render(<LessonCard {...defaultProps} hasAccess={false} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('pads lesson number to two digits', () => {
    render(<LessonCard {...defaultProps} orderNumber={3} />);
    expect(screen.getByText('03')).toBeInTheDocument();
  });
});
