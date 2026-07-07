import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeaturedCarousel } from '@/components/home/FeaturedCarousel';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

const mockArticles = [
  {
    id: '1', title: 'Article One', slug: 'article-one', lens: 'health' as const,
    tags: [], excerpt: 'Excerpt one', body: 'body', featured: true,
    access_tier: 'free' as const, status: 'published' as const, author: 'The Chairman',
    cover_image: null, published_at: '2026-03-18', created_at: '2026-03-18',
  },
  {
    id: '2', title: 'Article Two', slug: 'article-two', lens: 'politics' as const,
    tags: [], excerpt: 'Excerpt two', body: 'body', featured: true,
    access_tier: 'free' as const, status: 'published' as const, author: 'The Chairman',
    cover_image: null, published_at: '2026-03-17', created_at: '2026-03-17',
  },
  {
    id: '3', title: 'Article Three', slug: 'article-three', lens: 'culture' as const,
    tags: [], excerpt: 'Excerpt three', body: 'body', featured: true,
    access_tier: 'free' as const, status: 'published' as const, author: 'The Chairman',
    cover_image: null, published_at: '2026-03-16', created_at: '2026-03-16',
  },
];

describe('FeaturedCarousel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the section heading', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('shows the first article initially', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    expect(screen.getByText('Article One')).toBeInTheDocument();
  });

  it('renders dot indicators for each article', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('advances to next article after interval', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    act(() => { jest.advanceTimersByTime(6000); });
    expect(screen.getByText('Article Two')).toBeInTheDocument();
  });

  it('allows manual navigation via dot indicators', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<FeaturedCarousel articles={mockArticles} />);
    const tabs = screen.getAllByRole('tab');
    await user.click(tabs[2]);
    expect(screen.getByText('Article Three')).toBeInTheDocument();
  });

  it('renders empty state when no articles', () => {
    render(<FeaturedCarousel articles={[]} />);
    expect(screen.getByText(/featured articles coming soon/i)).toBeInTheDocument();
  });

  it('renders link to full article', () => {
    render(<FeaturedCarousel articles={mockArticles} />);
    const link = screen.getByRole('link', { name: /read article/i });
    expect(link).toHaveAttribute('href', '/articles/article-one');
  });
});
