import { render, screen } from '@testing-library/react';
import { SearchFilters } from '@/components/search/SearchFilters';

// Mock next/link to render plain <a> tags
jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
      <a href={href} {...props}>{children}</a>
    ),
  };
});

describe('SearchFilters', () => {
  const defaults = {
    query: 'test',
    activeLenses: [] as string[],
    activeTypes: [] as string[],
    activeSort: 'relevance' as const,
  };

  it('renders all 5 lens pills', () => {
    render(<SearchFilters {...defaults} />);
    expect(screen.getByText('Health/Wellness')).toBeInTheDocument();
    expect(screen.getByText('Politics/Law')).toBeInTheDocument();
    expect(screen.getByText('Culture/Ideology')).toBeInTheDocument();
    expect(screen.getByText('Entertainment/Technology')).toBeInTheDocument();
    expect(screen.getByText('Business/Finance')).toBeInTheDocument();
  });

  it('renders all 4 type chips', () => {
    render(<SearchFilters {...defaults} />);
    expect(screen.getByText('Article')).toBeInTheDocument();
    expect(screen.getByText('Briefing')).toBeInTheDocument();
    expect(screen.getByText('Dispatch')).toBeInTheDocument();
    expect(screen.getByText('Handbook')).toBeInTheDocument();
  });

  it('renders sort select with both options', () => {
    render(<SearchFilters {...defaults} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Relevance')).toBeInTheDocument();
    expect(screen.getByText('Newest first')).toBeInTheDocument();
  });

  it('active lens has aria-pressed="true"', () => {
    render(<SearchFilters {...defaults} activeLenses={['health']} />);
    expect(screen.getByText('Health/Wellness')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Politics/Law')).toHaveAttribute('aria-pressed', 'false');
  });

  it('clear-all only visible when filters are active', () => {
    const { rerender } = render(<SearchFilters {...defaults} />);
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();

    rerender(<SearchFilters {...defaults} activeLenses={['health']} />);
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('clear-all visible when sort is non-default', () => {
    render(<SearchFilters {...defaults} activeSort="date" />);
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('clear-all visible when types are active', () => {
    render(<SearchFilters {...defaults} activeTypes={['article']} />);
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('lens toggle links contain correct query params', () => {
    render(<SearchFilters {...defaults} activeLenses={['health']} />);
    // Health is active — toggling it off should remove it from lens param
    const healthLink = screen.getByText('Health/Wellness');
    expect(healthLink).toHaveAttribute('href', '/search?q=test');

    // Politics is inactive — toggling it on should add it alongside health
    const politicsLink = screen.getByText('Politics/Law');
    expect(politicsLink).toHaveAttribute('href', expect.stringContaining('lens=health%2Cpolitics'));
  });

  it('type toggle links contain correct query params', () => {
    render(<SearchFilters {...defaults} activeTypes={['briefing']} />);
    // Briefing is active — toggling it off should remove it
    const briefingLink = screen.getByText('Briefing');
    expect(briefingLink).toHaveAttribute('href', '/search?q=test');

    // Article is inactive — toggling it on should add it
    const articleLink = screen.getByText('Article');
    expect(articleLink).toHaveAttribute('href', expect.stringContaining('type=briefing%2Carticle'));
  });

  it('clear-all link resets to query-only URL', () => {
    render(<SearchFilters {...defaults} activeLenses={['health']} activeTypes={['article']} activeSort="date" />);
    const clearLink = screen.getByText('Clear all');
    expect(clearLink).toHaveAttribute('href', '/search?q=test');
  });
});
