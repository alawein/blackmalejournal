import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/supabase/queries', () => ({
  getHandbooks: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/components/ui/StarDivider', () => ({ StarDivider: () => null }));
jest.mock('@/components/ui/EmptyState', () => ({ EmptyState: () => null }));
jest.mock('@/components/content/HandbookCard', () => ({ HandbookCard: () => null }));
jest.mock('@/components/content/LensFilterTabs', () => ({ LensFilterTabs: () => null }));

describe('HandbooksPage redirect', () => {
  it('redirects to /downloads?category=handbook', async () => {
    const { default: HandbooksPage } = await import(
      '@/app/(public)/handbooks/page'
    );

    HandbooksPage();

    expect(redirect).toHaveBeenCalledWith('/downloads?category=handbook');
  });
});
