import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/downloads',
  useSearchParams: () => new URLSearchParams(),
}));

import { DownloadCategoryTabs } from '@/components/content/DownloadCategoryTabs';

describe('DownloadCategoryTabs', () => {
  it('tablist has an accessible name', () => {
    render(<DownloadCategoryTabs activeCategory="all" />);
    expect(
      screen.getByRole('tablist', { name: /filter downloads by category/i }),
    ).toBeInTheDocument();
  });

  it('renders a Handbooks tab', () => {
    render(<DownloadCategoryTabs activeCategory="all" />);
    expect(screen.getByRole('tab', { name: /Handbooks/i })).toBeInTheDocument();
  });

  it('renders all 6 tabs: All, Templates, Worksheets, Guides, Toolkits, Handbooks', () => {
    render(<DownloadCategoryTabs activeCategory="all" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(6);
  });
});
