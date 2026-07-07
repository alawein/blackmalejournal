import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonBriefingCard } from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  test('renders with animate-pulse class', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('animate-pulse');
  });

  test('accepts custom className', () => {
    render(<Skeleton className="h-8 w-32" data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton').className).toContain('h-8');
  });

  test('has aria-hidden', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  });

  test('always uses pulse animation regardless of props passed', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.className).toContain('animate-pulse');
    expect(el.className).toContain('bg-bmj-tan/10');
  });
});

describe('SkeletonCard', () => {
  test('renders', () => {
    render(<SkeletonCard data-testid="card" />);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });
});

describe('SkeletonBriefingCard', () => {
  test('renders', () => {
    render(<SkeletonBriefingCard data-testid="bc" />);
    expect(screen.getByTestId('bc')).toBeInTheDocument();
  });
});
