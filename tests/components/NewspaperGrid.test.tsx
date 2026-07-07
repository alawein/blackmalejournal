import { render, screen } from '@testing-library/react';
import NewspaperGrid from '@/components/content/NewspaperGrid';

const makeArticle = (slug: string, title: string, lens: 'health' | 'politics' | 'culture' | 'entertainment' | 'business' = 'health') => ({
  slug,
  title,
  excerpt: `Excerpt for ${title}`,
  lens,
  cover_image: null,
  published_at: '2026-03-01T00:00:00Z',
});

describe('NewspaperGrid', () => {
  it('returns null for empty articles', () => {
    const { container } = render(<NewspaperGrid articles={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders lead story (first article) with larger styling', () => {
    const articles = [
      makeArticle('lead', 'Lead Story'),
      makeArticle('second', 'Second Story'),
    ];
    render(<NewspaperGrid articles={articles} />);
    const leadHeading = screen.getByText('Lead Story');
    // Lead story has larger text classes (text-2xl or text-3xl)
    expect(leadHeading.className).toMatch(/text-2xl|text-3xl/);
  });

  it('renders secondary stories', () => {
    const articles = [
      makeArticle('lead', 'Lead Story'),
      makeArticle('second', 'Second Story'),
      makeArticle('third', 'Third Story'),
    ];
    render(<NewspaperGrid articles={articles} />);
    expect(screen.getByText('Second Story')).toBeInTheDocument();
    expect(screen.getByText('Third Story')).toBeInTheDocument();
  });

  it('shows lens badges', () => {
    const articles = [
      makeArticle('lead', 'Lead', 'health'),
      makeArticle('second', 'Second', 'culture'),
    ];
    render(<NewspaperGrid articles={articles} />);
    expect(screen.getByText('Health/Wellness')).toBeInTheDocument();
    expect(screen.getByText('Culture/Ideology')).toBeInTheDocument();
  });
});
