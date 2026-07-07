import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  test('renders heading and description', () => {
    render(<EmptyState heading="No articles yet" description="Check back soon." />);
    expect(screen.getByText('No articles yet')).toBeInTheDocument();
    expect(screen.getByText('Check back soon.')).toBeInTheDocument();
  });

  test('renders action link when provided', () => {
    render(
      <EmptyState heading="No results" description="Try again."
        actionLabel="Browse articles" actionHref="/articles" />,
    );
    expect(screen.getByRole('link', { name: /browse articles/i })).toHaveAttribute('href', '/articles');
  });

  test('renders star icon as decorative', () => {
    const { container } = render(<EmptyState heading="Empty" description="Nothing" />);
    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
  });
});
