import { render, screen } from '@testing-library/react';
import { FilterTabs } from '@/components/content/FilterTabs';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/articles',
  useSearchParams: () => new URLSearchParams(),
}));

const tabs = [
  { label: 'All', value: 'all' as const },
  { label: 'Health', value: 'health' as const },
  { label: 'Politics', value: 'politics' as const },
];

describe('FilterTabs', () => {
  it('renders a tablist with the correct aria-label', () => {
    render(
      <FilterTabs
        tabs={tabs}
        activeValue="all"
        paramKey="lens"
        allValue="all"
        ariaLabel="Filter by lens"
      />
    );
    expect(screen.getByRole('tablist', { name: 'Filter by lens' })).toBeInTheDocument();
  });

  it('marks the active tab with aria-selected=true', () => {
    render(
      <FilterTabs
        tabs={tabs}
        activeValue="health"
        paramKey="lens"
        allValue="all"
        ariaLabel="Filter by lens"
      />
    );
    expect(screen.getByRole('tab', { name: 'Health' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false');
  });

  it('renders all tab options', () => {
    render(
      <FilterTabs
        tabs={tabs}
        activeValue="all"
        paramKey="lens"
        allValue="all"
        ariaLabel="Filter by lens"
      />
    );
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
});
