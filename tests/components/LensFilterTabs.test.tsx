import { render, screen, fireEvent } from '@testing-library/react';
import { LensFilterTabs } from '@/components/content/LensFilterTabs';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/articles',
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe('LensFilterTabs', () => {
  it('renders all 6 tabs (All + 5 lenses)', () => {
    render(<LensFilterTabs activeLens="all" />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Health/Wellness')).toBeInTheDocument();
    expect(screen.getByText('Politics/Law')).toBeInTheDocument();
    expect(screen.getByText('Culture/Ideology')).toBeInTheDocument();
    expect(screen.getByText('Entertainment/Technology')).toBeInTheDocument();
    expect(screen.getByText('Business/Finance')).toBeInTheDocument();
  });

  it('active lens has aria-selected=true', () => {
    render(<LensFilterTabs activeLens="health" />);
    expect(screen.getByText('Health/Wellness')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('All')).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking lens calls router.push with ?lens=value', () => {
    render(<LensFilterTabs activeLens="all" />);
    fireEvent.click(screen.getByText('Culture/Ideology'));
    expect(mockPush).toHaveBeenCalledWith('/articles?lens=culture');
  });

  it('clicking "All" deletes lens param', () => {
    render(<LensFilterTabs activeLens="health" />);
    fireEvent.click(screen.getByText('All'));
    expect(mockPush).toHaveBeenCalledWith('/articles?');
  });

  it('deletes tag param when changing lens', () => {
    // Override searchParams to have a tag
    jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue(
      new URLSearchParams('tag=fitness'),
    );
    render(<LensFilterTabs activeLens="health" />);
    fireEvent.click(screen.getByText('Politics/Law'));
    expect(mockPush).toHaveBeenCalledWith(expect.not.stringContaining('tag='));
  });
});
