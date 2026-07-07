import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookmarkButton } from '@/components/content/BookmarkButton';

jest.mock('@/app/(auth)/portal/bookmarks/actions', () => ({
  toggleBookmark: jest.fn().mockResolvedValue({ bookmarked: true }),
}));

describe('BookmarkButton', () => {
  it('renders nothing when not logged in', () => {
    const { container } = render(
      <BookmarkButton
        contentType="article"
        contentId="abc"
        initialBookmarked={false}
        isLoggedIn={false}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders button with "Save to bookmarks" label when logged in and not bookmarked', () => {
    render(
      <BookmarkButton
        contentType="article"
        contentId="abc"
        initialBookmarked={false}
        isLoggedIn={true}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Save to bookmarks' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Save');
  });

  it('renders "Remove bookmark" label when bookmarked', () => {
    render(
      <BookmarkButton
        contentType="article"
        contentId="abc"
        initialBookmarked={true}
        isLoggedIn={true}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Remove bookmark' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Saved');
  });

  it('has aria-pressed="true" when bookmarked', () => {
    render(
      <BookmarkButton
        contentType="article"
        contentId="abc"
        initialBookmarked={true}
        isLoggedIn={true}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('has aria-pressed="false" when not bookmarked', () => {
    render(
      <BookmarkButton
        contentType="article"
        contentId="abc"
        initialBookmarked={false}
        isLoggedIn={true}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles optimistically on click', async () => {
    const user = userEvent.setup();
    render(
      <BookmarkButton
        contentType="article"
        contentId="abc"
        initialBookmarked={false}
        isLoggedIn={true}
      />,
    );
    await user.click(screen.getByRole('button'));
    // Optimistic update: should now show "Saved"
    expect(screen.getByRole('button', { name: 'Remove bookmark' })).toBeInTheDocument();
  });
});
