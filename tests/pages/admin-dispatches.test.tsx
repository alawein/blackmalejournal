import { render, screen } from '@testing-library/react';
import { PATHS, adminEditPath } from '@/lib/paths';
import type { Dispatch } from '@/lib/supabase/types';

const mockDispatches: Dispatch[] = [
  {
    id: 'dsp-1',
    title: 'The State of Black Fatherhood',
    slug: 'the-state-of-black-fatherhood',
    lens: 'culture',
    excerpt: 'Examining fatherhood through a revolutionary lens.',
    body: 'Full body text.',
    status: 'published',
    author: 'The Chairman',
    cover_image: '/covers/fatherhood.jpg',
    published_at: '2026-03-10T00:00:00Z',
    created_at: '2026-03-08T00:00:00Z',
  },
  {
    id: 'dsp-2',
    title: 'Community Wellness Initiative',
    slug: 'community-wellness-initiative',
    lens: 'health',
    excerpt: 'Building wellness infrastructure.',
    body: 'Full body text.',
    status: 'draft',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-03-12T00:00:00Z',
    created_at: '2026-03-11T00:00:00Z',
  },
];

jest.mock('@/lib/supabase/admin-queries', () => ({
  getAllDispatches: jest.fn().mockResolvedValue(mockDispatches),
}));

jest.mock('@/app/(auth)/admin/dispatches/actions', () => ({
  bulkUpdateDispatchStatusAction: jest.fn(),
}));

describe('DispatchesAdminPage', () => {
  async function renderPage(
    params?: Partial<{ status: string; lens: string; q: string }>,
  ) {
    const { default: DispatchesAdminPage } = await import(
      '@/app/(auth)/admin/dispatches/page'
    );
    const searchParams = Promise.resolve(params ?? {});
    render(await DispatchesAdminPage({ searchParams }));
  }

  it('renders "DISPATCHES" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'DISPATCHES' }),
    ).toBeInTheDocument();
  });

  it('renders dispatch titles', async () => {
    await renderPage();
    expect(
      screen.getByText('The State of Black Fatherhood'),
    ).toBeInTheDocument();
    expect(screen.getByText('Community Wellness Initiative')).toBeInTheDocument();
  });

  it('renders status badges', async () => {
    await renderPage();
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders "New Dispatch" link', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new dispatch/i });
    expect(link).toHaveAttribute('href', PATHS.ADMIN_DISPATCHES_NEW);
  });

  it('renders dispatch count', async () => {
    await renderPage();
    expect(screen.getByText('2 dispatches')).toBeInTheDocument();
  });

  it('renders Edit links pointing to dispatch edit pages', async () => {
    await renderPage();
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', adminEditPath('dispatches', 'dsp-1'));
    expect(editLinks[1]).toHaveAttribute('href', adminEditPath('dispatches', 'dsp-2'));
  });

  it('renders status filter tabs including scheduled', async () => {
    await renderPage();
    expect(
      screen.getByRole('navigation', { name: /status filter/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('renders search and lens filters', async () => {
    await renderPage({ q: 'fatherhood', lens: 'culture' });
    expect(screen.getByLabelText('Search')).toHaveValue('fatherhood');
    expect(screen.getByLabelText('Lens')).toHaveValue('culture');
    expect(screen.getByText(/Active Filters/i)).toBeInTheDocument();
  });

  it('renders publish readiness cards and issue summaries', async () => {
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
    expect(screen.getByLabelText('Select The State of Black Fatherhood')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('renders metadata with lens and date', async () => {
    await renderPage();
    expect(screen.getAllByText(/Culture\/Ideology/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Health\/Wellness/).length).toBeGreaterThanOrEqual(1);
  });
});

describe('DispatchesAdminPage — empty state', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders empty state when no dispatches', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getAllDispatches: jest.fn().mockResolvedValue([]),
    }));

    const { default: DispatchesAdminPage } = await import(
      '@/app/(auth)/admin/dispatches/page'
    );
    const searchParams = Promise.resolve({});
    render(await DispatchesAdminPage({ searchParams }));

    expect(
      screen.getByText('No dispatches found. Create your first dispatch.'),
    ).toBeInTheDocument();
  });
});
