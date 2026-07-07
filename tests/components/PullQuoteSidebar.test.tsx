import { render, screen } from '@testing-library/react';
import PullQuoteSidebar from '@/components/content/PullQuoteSidebar';

describe('PullQuoteSidebar', () => {
  it('renders children', () => {
    render(
      <PullQuoteSidebar body="> A quote here">
        <p>Child content</p>
      </PullQuoteSidebar>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('extracts and displays blockquotes from body', () => {
    const body = 'Some text\n\n> This is a pull quote\n\nMore text';
    render(
      <PullQuoteSidebar body={body}>
        <p>Article</p>
      </PullQuoteSidebar>,
    );
    expect(screen.getByText(/This is a pull quote/)).toBeInTheDocument();
  });

  it('returns just children when no blockquotes in body', () => {
    const body = 'No quotes here.\n\nJust paragraphs.';
    const { container } = render(
      <PullQuoteSidebar body={body}>
        <p>Only child</p>
      </PullQuoteSidebar>,
    );
    expect(screen.getByText('Only child')).toBeInTheDocument();
    // No sidebar grid when there are no quotes
    expect(container.querySelector('aside')).not.toBeInTheDocument();
  });

  it('limits to 3 quotes max', () => {
    const body = [
      '> Quote one',
      '',
      '> Quote two',
      '',
      '> Quote three',
      '',
      '> Quote four',
    ].join('\n');
    render(
      <PullQuoteSidebar body={body}>
        <p>Content</p>
      </PullQuoteSidebar>,
    );
    const blockquotes = screen.getAllByRole('blockquote');
    expect(blockquotes).toHaveLength(3);
  });
});
