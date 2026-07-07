import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilterTabs } from '@/components/content/CategoryFilterTabs';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/academy',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/utils', () => ({
  getCategoryLabel: (category: string) => {
    const labels: Record<string, string> = {
      'martial-arts': 'Martial Arts',
      'mental-health': 'Mental Health',
      'relationships': 'Relationships',
      'purpose': 'Purpose',
      'branding': 'Branding',
    };
    return labels[category] ?? category;
  },
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe('CategoryFilterTabs', () => {
  it('tablist has an accessible name', () => {
    render(<CategoryFilterTabs activeCategory="all" />);
    expect(
      screen.getByRole('tablist', { name: /filter courses by category/i }),
    ).toBeInTheDocument();
  });

  it('renders all 6 category tabs', () => {
    render(<CategoryFilterTabs activeCategory="all" />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Martial Arts')).toBeInTheDocument();
    expect(screen.getByText('Mental Health')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText('Purpose')).toBeInTheDocument();
    expect(screen.getByText('Branding')).toBeInTheDocument();
  });

  it('active category has aria-selected=true', () => {
    render(<CategoryFilterTabs activeCategory="martial-arts" />);
    expect(screen.getByText('Martial Arts')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('All')).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking category calls router.push with ?category=value', () => {
    render(<CategoryFilterTabs activeCategory="all" />);
    fireEvent.click(screen.getByText('Purpose'));
    expect(mockPush).toHaveBeenCalledWith('/academy?category=purpose');
  });

  it('clicking "All" deletes category param', () => {
    render(<CategoryFilterTabs activeCategory="martial-arts" />);
    fireEvent.click(screen.getByText('All'));
    expect(mockPush).toHaveBeenCalledWith('/academy?');
  });
});
