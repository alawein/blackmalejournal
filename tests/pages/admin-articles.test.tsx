import { render, screen, within } from '@testing-library/react';
import { PATHS, adminEditPath } from '@/lib/paths';
import type { Article } from '@/lib/supabase/types';

const mockArticles: Article[] = [
  {
    id: 'art-1',
    title: 'The Discipline of Stillness',
    slug: 'the-discipline-of-stillness',
    lens: 'culture',
    tags: ['mindset', 'discipline'],
    excerpt: 'On the power of silence.',
    body: 'Full body text.',
    featured: true,
    access_tier: 'free',
    status: 'published',
    author: 'The Chairman',
    cover_image: '/covers/stillness.jpg',
    published_at: '2026-03-10T00:00:00Z',
    created_at: '2026-03-08T00:00:00Z',
  },
  {
    id: 'art-2',
    title: 'Building Community Power',
    slug: 'building-community-power',
    lens: 'politics',
    tags: ['organizing'],
    excerpt: 'Grassroots strategy.',
    body: 'Full body text.',
    featured: false,
    access_tier: 'premium',
    status: 'draft',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-12T00:00:00Z',
    created_at: '2026-03-11T00:00:00Z',
  },
];

jest.mock('@/lib/supabase/admin-queries', () => ({
  getAllArticles: jest.fn().mockResolvedValue(mockArticles),
}));

jest.mock('@/app/(auth)/admin/articles/actions', () => ({
  bulkUpdateArticleStatusAction: jest.fn(),
}));

describe('ArticlesAdminPage', () => {
  async function renderPage(
    params?: Partial<{ status: string; lens: string; q: string }>,
  ) {
    const { default: ArticlesAdminPage } = await import(
      '@/app/(auth)/admin/articles/page'
    );
    const searchParams = Promise.resolve(params ?? {});
    render(await ArticlesAdminPage({ searchParams }));
  }

  it('renders "ARTICLES" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'ARTICLES' }),
    ).toBeInTheDocument();
  });

  it('renders article titles', async () => {
    await renderPage();
    expect(
      screen.getByText('The Discipline of Stillness'),
    ).toBeInTheDocument();
    expect(screen.getByText('Building Community Power')).toBeInTheDocument();
  });

  it('renders status badges', async () => {
    await renderPage();
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders "New Article" link', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new article/i });
    expect(link).toHaveAttribute('href', PATHS.ADMIN_ARTICLES_NEW);
  });

  it('renders article count', async () => {
    await renderPage();
    expect(screen.getByText('2 articles')).toBeInTheDocument();
  });

  it('renders Edit links pointing to article edit pages', async () => {
    await renderPage();
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', adminEditPath('articles', 'art-1'));
    expect(editLinks[1]).toHaveAttribute('href', adminEditPath('articles', 'art-2'));
  });

  it('renders star icon for featured articles', async () => {
    await renderPage();
    expect(screen.getByLabelText('Featured')).toBeInTheDocument();
  });

  it('renders status filter tabs including scheduled', async () => {
    await renderPage();
    const statusNav = screen.getByRole('navigation', { name: /status filter/i });
    expect(statusNav).toBeInTheDocument();
    expect(within(statusNav).getByText('All')).toBeInTheDocument();
    expect(within(statusNav).getByText('Draft')).toBeInTheDocument();
    expect(within(statusNav).getByText('Review')).toBeInTheDocument();
    expect(within(statusNav).getByText('Scheduled')).toBeInTheDocument();
    expect(within(statusNav).getByText('Published')).toBeInTheDocument();
    expect(within(statusNav).getByText('Archived')).toBeInTheDocument();
  });

  it('renders search and lens filters', async () => {
    await renderPage({ q: 'discipline', lens: 'culture' });
    expect(screen.getByLabelText('Search')).toHaveValue('discipline');
    expect(screen.getByLabelText('Lens')).toHaveValue('culture');
    expect(screen.getByText(/Active Filters/i)).toBeInTheDocument();
  });

  it('renders publish readiness cards and issue callouts', async () => {
    await renderPage();
    expect(screen.getByText('Publish Readiness')).toBeInTheDocument();
    expect(screen.getAllByText('Ready').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Needs Work').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Missing cover image')).toBeInTheDocument();
  });

  it('renders bulk action controls and row selection checkboxes', async () => {
    await renderPage();
    expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Bulk Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Select The Discipline of Stillness')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('renders metadata with lens, tier, and date', async () => {
    await renderPage();
    expect(screen.getAllByText(/Culture\/Ideology/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Politics\/Law/).length).toBeGreaterThanOrEqual(1);
  });
});

describe('ArticlesAdminPage — empty state', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders empty state when no articles', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getAllArticles: jest.fn().mockResolvedValue([]),
    }));

    const { default: ArticlesAdminPage } = await import(
      '@/app/(auth)/admin/articles/page'
    );
    const searchParams = Promise.resolve({});
    render(await ArticlesAdminPage({ searchParams }));

    expect(
      screen.getByText('No articles found. Create your first article.'),
    ).toBeInTheDocument();
  });
});
