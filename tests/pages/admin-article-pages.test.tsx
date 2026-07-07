import { render, screen } from '@testing-library/react';
import type { AdminActivityLog, Article } from '@/lib/supabase/types';

const mockArticle: Article = {
  id: 'abc-123',
  title: 'Test Article Title',
  slug: 'test-article-title',
  lens: 'culture',
  tags: ['discipline', 'mindset'],
  excerpt: 'A short excerpt.',
  body: 'Full article body content here.',
  featured: true,
  access_tier: 'premium',
  status: 'published',
  author: 'The Chairman',
  cover_image: 'covers/test.webp',
  published_at: '2026-01-15T00:00:00Z',
  created_at: '2026-01-10T00:00:00Z',
};

const mockActivity: AdminActivityLog[] = [
  {
    id: 'activity-article-1',
    actor_user_id: 'member-1',
    actor_email: 'operator@blackmalejournal.com',
    actor_role: 'admin',
    entity_type: 'article',
    entity_id: 'abc-123',
    entity_title: 'Test Article Title',
    action: 'updated',
    summary: 'Updated article "Test Article Title": status review -> published.',
    metadata: {},
    created_at: '2026-03-25T08:00:00Z',
  },
];

const mockNotFound = jest.fn();

jest.mock('next/navigation', () => ({
  notFound: (...args: unknown[]) => mockNotFound(...args),
  redirect: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock delete-action to avoid server-only next/cache imports in jsdom.
jest.mock('@/app/(auth)/admin/articles/delete-action', () => ({
  deleteArticleAction: jest.fn(),
}));

// Mock DeleteButton to avoid hooks issues in server component tests.
jest.mock('@/components/admin/DeleteButton', () => ({
  DeleteButton: () => <div data-testid="delete-button" />,
}));

// Mock ArticleForm to avoid hooks issues in server component tests.
// The ArticleForm itself is tested in admin-article-form.test.tsx.
jest.mock('@/app/(auth)/admin/articles/ArticleForm', () => ({
  ArticleForm: ({ article, action }: { article?: Article; action: unknown }) => (
    <div data-testid="article-form">
      <span data-testid="form-mode">{article ? 'edit' : 'create'}</span>
      <span data-testid="form-action">{typeof action}</span>
      {article && <span data-testid="form-article-id">{article.id}</span>}
      <button type="submit">{article ? 'Update Article' : 'Create Article'}</button>
    </div>
  ),
}));

// ── New Article Page ──────────────────────────────────────────────────────────

describe('NewArticlePage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "NEW ARTICLE" heading', async () => {
    jest.mock('@/app/(auth)/admin/articles/actions', () => ({
      createArticleAction: jest.fn(),
    }));

    const { default: NewArticlePage } = await import(
      '@/app/(auth)/admin/articles/new/page'
    );
    render(NewArticlePage());

    expect(
      screen.getByRole('heading', { level: 1, name: 'NEW ARTICLE' }),
    ).toBeInTheDocument();
  });

  it('renders ArticleForm in create mode', async () => {
    jest.mock('@/app/(auth)/admin/articles/actions', () => ({
      createArticleAction: jest.fn(),
    }));

    const { default: NewArticlePage } = await import(
      '@/app/(auth)/admin/articles/new/page'
    );
    render(NewArticlePage());

    expect(screen.getByTestId('article-form')).toBeInTheDocument();
    expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    expect(
      screen.getByRole('button', { name: /create article/i }),
    ).toBeInTheDocument();
  });
});

// ── Edit Article Page ─────────────────────────────────────────────────────────

describe('EditArticlePage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "EDIT ARTICLE" heading when article exists', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getArticleById: jest.fn().mockResolvedValue(mockArticle),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/articles/actions', () => ({
      updateArticleAction: jest.fn(),
    }));

    const { default: EditArticlePage } = await import(
      '@/app/(auth)/admin/articles/[id]/edit/page'
    );
    const result = await EditArticlePage({
      params: Promise.resolve({ id: 'abc-123' }),
    });
    render(result);

    expect(
      screen.getByRole('heading', { level: 1, name: 'EDIT ARTICLE' }),
    ).toBeInTheDocument();
  });

  it('shows article ID', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getArticleById: jest.fn().mockResolvedValue(mockArticle),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/articles/actions', () => ({
      updateArticleAction: jest.fn(),
    }));

    const { default: EditArticlePage } = await import(
      '@/app/(auth)/admin/articles/[id]/edit/page'
    );
    const result = await EditArticlePage({
      params: Promise.resolve({ id: 'abc-123' }),
    });
    render(result);

    expect(screen.getByText('ID: abc-123')).toBeInTheDocument();
  });

  it('renders ArticleForm in edit mode with "Update Article" button', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getArticleById: jest.fn().mockResolvedValue(mockArticle),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/articles/actions', () => ({
      updateArticleAction: jest.fn(),
    }));

    const { default: EditArticlePage } = await import(
      '@/app/(auth)/admin/articles/[id]/edit/page'
    );
    const result = await EditArticlePage({
      params: Promise.resolve({ id: 'abc-123' }),
    });
    render(result);

    expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    expect(screen.getByTestId('form-article-id')).toHaveTextContent('abc-123');
    expect(
      screen.getByRole('button', { name: /update article/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Owner Audit')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(mockActivity[0].summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /public article/i })).toHaveAttribute(
      'href',
      '/articles/test-article-title',
    );
  });

  it('calls notFound() when article is null', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getArticleById: jest.fn().mockResolvedValue(null),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue([]),
    }));
    jest.mock('@/app/(auth)/admin/articles/actions', () => ({
      updateArticleAction: jest.fn(),
    }));

    const { default: EditArticlePage } = await import(
      '@/app/(auth)/admin/articles/[id]/edit/page'
    );

    await EditArticlePage({
      params: Promise.resolve({ id: 'nonexistent' }),
    }).catch(() => {
      // notFound() may throw — that's expected
    });

    expect(mockNotFound).toHaveBeenCalled();
  });
});
