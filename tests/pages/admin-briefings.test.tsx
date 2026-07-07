import { render, screen } from '@testing-library/react';
import { PATHS, adminEditPath } from '@/lib/paths';
import type { Briefing } from '@/lib/supabase/types';

const mockBriefings: Briefing[] = [
  {
    id: 'br-1',
    issue_number: 3,
    title: 'Weekend Briefing 003',
    slug: 'weekend-briefing-003',
    sections: [
      { title: 'Opening', body: 'Welcome to issue 3.' },
      { title: 'Politics', body: 'Political analysis here.' },
    ],
    lead_kicker: 'Opening',
    access_tier: 'free',
    status: 'published',
    cover_image: '/covers/briefing-003.jpg',
    published_at: '2026-03-15T00:00:00Z',
    created_at: '2026-03-14T00:00:00Z',
  },
  {
    id: 'br-2',
    issue_number: 2,
    title: 'Weekend Briefing 002',
    slug: 'weekend-briefing-002',
    sections: [{ title: 'Health', body: 'Health content.' }],
    lead_kicker: 'Health',
    access_tier: 'premium',
    status: 'draft',
    cover_image: null,
    published_at: '2026-03-10T00:00:00Z',
    created_at: '2026-03-09T00:00:00Z',
  },
];

jest.mock('@/lib/supabase/admin-queries', () => ({
  getAllBriefings: jest.fn().mockResolvedValue(mockBriefings),
}));

jest.mock('@/app/(auth)/admin/briefings/actions', () => ({
  bulkUpdateBriefingStatusAction: jest.fn(),
}));

describe('BriefingsAdminPage', () => {
  async function renderPage(params?: Partial<{ status: string; q: string }>) {
    const { default: BriefingsAdminPage } = await import(
      '@/app/(auth)/admin/briefings/page'
    );
    const searchParams = Promise.resolve(params ?? {});
    render(await BriefingsAdminPage({ searchParams }));
  }

  it('renders "BRIEFINGS" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'BRIEFINGS' }),
    ).toBeInTheDocument();
  });

  it('renders briefing titles', async () => {
    await renderPage();
    expect(screen.getByText('Weekend Briefing 003')).toBeInTheDocument();
    expect(screen.getByText('Weekend Briefing 002')).toBeInTheDocument();
  });

  it('renders status badges', async () => {
    await renderPage();
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders "New Briefing" link', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new briefing/i });
    expect(link).toHaveAttribute('href', PATHS.ADMIN_BRIEFINGS_NEW);
  });

  it('renders briefing count', async () => {
    await renderPage();
    expect(screen.getByText('2 briefings')).toBeInTheDocument();
  });

  it('renders Edit links pointing to briefing edit pages', async () => {
    await renderPage();
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', adminEditPath('briefings', 'br-1'));
    expect(editLinks[1]).toHaveAttribute('href', adminEditPath('briefings', 'br-2'));
  });

  it('renders issue number in metadata', async () => {
    await renderPage();
    expect(screen.getByText(/^#3/)).toBeInTheDocument();
    expect(screen.getByText(/^#2/)).toBeInTheDocument();
  });

  it('renders status filter tabs including scheduled', async () => {
    await renderPage();
    expect(
      screen.getByRole('navigation', { name: /status filter/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('renders the search form and active search state', async () => {
    await renderPage({ q: 'weekend' });
    expect(screen.getByRole('textbox')).toHaveValue('weekend');
    expect(screen.getByText(/Active Search/i)).toBeInTheDocument();
  });

  it('renders publish readiness cards and blocking issues', async () => {
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
    expect(screen.getByLabelText('Select Weekend Briefing 003')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });
});

describe('BriefingsAdminPage — empty state', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders empty state when no briefings', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getAllBriefings: jest.fn().mockResolvedValue([]),
    }));

    const { default: BriefingsAdminPage } = await import(
      '@/app/(auth)/admin/briefings/page'
    );
    const searchParams = Promise.resolve({});
    render(await BriefingsAdminPage({ searchParams }));

    expect(
      screen.getByText('No briefings found. Create your first briefing.'),
    ).toBeInTheDocument();
  });
});
