import { render, screen } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock Supabase server client
const mockGetUser = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
  }),
}));

// Mock bookmarks query
const mockGetBookmarksForMember = jest.fn();
jest.mock('@/lib/supabase/bookmarks', () => ({
  getBookmarksForMember: (...args: unknown[]) => mockGetBookmarksForMember(...args),
}));

// Mock child components
jest.mock('@/components/brand/LensBadge', () => ({
  LensBadge: ({ lens }: { lens: string }) => <span data-testid="lens-badge">{lens}</span>,
}));

jest.mock('@/components/content/BookmarkButton', () => ({
  BookmarkButton: () => <button data-testid="bookmark-button">Remove</button>,
}));

import SavedPage from '@/app/(auth)/portal/bookmarks/page';

describe('Portal Saved Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no bookmarks', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@test.com' } },
      error: null,
    });
    mockGetBookmarksForMember.mockResolvedValue([]);

    const jsx = await SavedPage();
    render(jsx);

    expect(
      screen.getByText(/No saved content yet/),
    ).toBeInTheDocument();
    expect(screen.getByText('Browse Articles')).toBeInTheDocument();
  });

  it('renders bookmarked items grouped by type', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@test.com' } },
      error: null,
    });
    mockGetBookmarksForMember.mockResolvedValue([
      {
        bookmarkId: 'b1',
        contentType: 'article',
        contentId: 'a1',
        title: 'Test Article',
        slug: 'test-article',
        lens: 'politics',
        accessTier: 'free',
        publishedAt: '2025-01-01',
        bookmarkedAt: new Date().toISOString(),
      },
    ]);

    const jsx = await SavedPage();
    render(jsx);

    expect(screen.getByText('ARTICLES')).toBeInTheDocument();
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Saved today')).toBeInTheDocument();
  });

  it('renders page title SAVED', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'test@test.com' } },
      error: null,
    });
    mockGetBookmarksForMember.mockResolvedValue([]);

    const jsx = await SavedPage();
    render(jsx);

    expect(screen.getByText('SAVED')).toBeInTheDocument();
  });
});
