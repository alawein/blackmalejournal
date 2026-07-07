import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

describe('Breadcrumbs', () => {
  test('renders home link', () => {
    render(<Breadcrumbs items={[]} />);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  });

  test('renders intermediate links', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Articles', href: '/articles' },
          { label: 'The Power of Discipline' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: /articles/i })).toBeInTheDocument();
    expect(screen.getByText('The Power of Discipline')).toBeInTheDocument();
  });

  test('only the last item has aria-current="page"', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Articles', href: '/articles' },
          { label: 'Current Article' },
        ]}
      />,
    );
    const current = screen.getByText('Current Article');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /articles/i })).not.toHaveAttribute('aria-current');
  });

  test('non-last item without href renders as text without aria-current', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Intermediate' },
          { label: 'Last Item' },
        ]}
      />,
    );
    expect(screen.getByText('Intermediate')).not.toHaveAttribute('aria-current');
    expect(screen.getByText('Last Item')).toHaveAttribute('aria-current', 'page');
  });

  test('has nav with aria-label', () => {
    render(<Breadcrumbs items={[]} />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });
});
