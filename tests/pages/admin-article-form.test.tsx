import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleForm } from '@/app/(auth)/admin/articles/ArticleForm';
import type { Article } from '@/lib/supabase/types';

// Mock useFormStatus to avoid needing a real form action context
jest.mock('react-dom', () => {
  const actual = jest.requireActual('react-dom');
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

const mockAction = jest.fn();

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

describe('ArticleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ArticleForm action={mockAction} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lens/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/excerpt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/body/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/access tier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/featured/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cover image/i)).toBeInTheDocument();
  });

  it('shows "Create Article" button when no article provided', () => {
    render(<ArticleForm action={mockAction} />);

    expect(
      screen.getByRole('button', { name: /create article/i }),
    ).toBeInTheDocument();
  });

  it('shows "Update Article" button when article provided', () => {
    render(<ArticleForm article={mockArticle} action={mockAction} />);

    expect(
      screen.getByRole('button', { name: /update article/i }),
    ).toBeInTheDocument();
  });

  it('pre-fills fields when article is provided', () => {
    render(<ArticleForm article={mockArticle} action={mockAction} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Article Title');
    expect(screen.getByLabelText(/slug/i)).toHaveValue('test-article-title');
    expect(screen.getByLabelText(/lens/i)).toHaveValue('culture');
    expect(screen.getByLabelText(/tags/i)).toHaveValue(
      'discipline, mindset',
    );
    expect(screen.getByLabelText(/excerpt/i)).toHaveValue(
      'A short excerpt.',
    );
    expect(screen.getByLabelText(/body/i)).toHaveValue(
      'Full article body content here.',
    );
    expect(screen.getByLabelText(/access tier/i)).toHaveValue('premium');
    expect(screen.getByLabelText(/status/i)).toHaveValue('published');
    expect(screen.getByLabelText(/publish at \(utc\)/i)).toHaveValue(
      '2026-01-15T00:00',
    );
    expect(screen.getByLabelText(/featured/i)).toBeChecked();
    expect(screen.getByLabelText(/cover image/i)).toHaveValue(
      'covers/test.webp',
    );
  });

  it('auto-generates slug from title on blur when slug is empty', () => {
    render(<ArticleForm action={mockAction} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(titleInput, {
      target: { value: 'My New Article Title' },
    });
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue('my-new-article-title');
  });

  it('does not overwrite slug if already filled', () => {
    render(<ArticleForm action={mockAction} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    fireEvent.change(slugInput, { target: { value: 'custom-slug' } });
    fireEvent.change(titleInput, {
      target: { value: 'My New Article Title' },
    });
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue('custom-slug');
  });

  it('includes hidden id field in edit mode', () => {
    const { container } = render(
      <ArticleForm article={mockArticle} action={mockAction} />,
    );

    const hiddenInput = container.querySelector('input[name="id"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveValue('abc-123');
  });

  it('does not include hidden id field in create mode', () => {
    const { container } = render(<ArticleForm action={mockAction} />);

    const hiddenInput = container.querySelector('input[name="id"]');
    expect(hiddenInput).not.toBeInTheDocument();
  });

  it('shows excerpt character count', () => {
    render(<ArticleForm action={mockAction} />);

    expect(screen.getByText('0/500')).toBeInTheDocument();

    const excerptInput = screen.getByLabelText(/excerpt/i);
    fireEvent.change(excerptInput, { target: { value: 'Hello world' } });

    expect(screen.getByText('11/500')).toBeInTheDocument();
  });
});
