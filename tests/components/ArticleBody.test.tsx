import { render, screen } from '@testing-library/react';
import { ArticleBody } from '@/components/content/ArticleBody';

describe('ArticleBody', () => {
  it('renders paragraphs', () => {
    render(<ArticleBody body={'First paragraph.\n\nSecond paragraph.'} />);
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();
  });

  it('renders ## as h2', () => {
    render(<ArticleBody body="## Section Heading" />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Section Heading');
  });

  it('renders ### as h3', () => {
    render(<ArticleBody body="### Sub Heading" />);
    const h3 = screen.getByRole('heading', { level: 3 });
    expect(h3).toHaveTextContent('Sub Heading');
  });

  it('renders > as blockquote', () => {
    render(<ArticleBody body="> A powerful quote" />);
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toHaveTextContent('A powerful quote');
  });

  it('renders <mark> tags as mark elements', () => {
    render(<ArticleBody body="This has <mark>highlighted text</mark> inside." />);
    const mark = screen.getByText('highlighted text');
    expect(mark.tagName).toBe('MARK');
  });
});
