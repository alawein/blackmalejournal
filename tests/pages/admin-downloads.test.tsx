import { render, screen } from '@testing-library/react';
import { PATHS, adminEditPath } from '@/lib/paths';
import type { Download } from '@/lib/supabase/types';

const mockDownloads: Download[] = [
  {
    id: 'dl-1',
    title: 'Weekly Planner Template',
    slug: 'weekly-planner-template',
    description: 'A structured weekly planner for intentional living.',
    category: 'template',
    file_url: 'downloads/weekly-planner.pdf',
    file_type: 'pdf',
    file_size: 1048576,
    access_tier: 'free',
    cover_image: '/covers/planner.jpg',
    published_at: '2026-03-10T00:00:00Z',
    created_at: '2026-03-08T00:00:00Z',
  },
  {
    id: 'dl-2',
    title: 'Financial Freedom Worksheet',
    slug: 'financial-freedom-worksheet',
    description: 'Build your path to financial independence.',
    category: 'worksheet',
    file_url: 'downloads/financial-freedom.pdf',
    file_type: 'pdf',
    file_size: 2097152,
    access_tier: 'premium',
    cover_image: null,
    published_at: '2026-03-12T00:00:00Z',
    created_at: '2026-03-11T00:00:00Z',
  },
];

jest.mock('@/lib/supabase/admin-queries', () => ({
  getAllDownloads: jest.fn().mockResolvedValue(mockDownloads),
}));

jest.mock('@/app/(auth)/admin/downloads/actions', () => ({
  bulkUpdateDownloadAccessTierAction: jest.fn(),
}));

describe('DownloadsAdminPage', () => {
  async function renderPage(
    params?: Partial<{ category: string; tier: string; q: string }>,
  ) {
    const { default: DownloadsAdminPage } = await import(
      '@/app/(auth)/admin/downloads/page'
    );
    const searchParams = Promise.resolve(params ?? {});
    render(await DownloadsAdminPage({ searchParams }));
  }

  it('renders "DOWNLOADS" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'DOWNLOADS' }),
    ).toBeInTheDocument();
  });

  it('renders download titles', async () => {
    await renderPage();
    expect(
      screen.getByText('Weekly Planner Template'),
    ).toBeInTheDocument();
    expect(screen.getByText('Financial Freedom Worksheet')).toBeInTheDocument();
  });

  it('renders access tier badges', async () => {
    await renderPage();
    expect(screen.getByText('free')).toBeInTheDocument();
    expect(screen.getByText('premium')).toBeInTheDocument();
  });

  it('renders "New Download" link', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new download/i });
    expect(link).toHaveAttribute('href', PATHS.ADMIN_DOWNLOADS_NEW);
  });

  it('renders download count', async () => {
    await renderPage();
    expect(screen.getByText('2 downloads')).toBeInTheDocument();
  });

  it('renders Edit links pointing to download edit pages', async () => {
    await renderPage();
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', adminEditPath('downloads', 'dl-1'));
    expect(editLinks[1]).toHaveAttribute('href', adminEditPath('downloads', 'dl-2'));
  });

  it('renders category filter tabs', async () => {
    await renderPage();
    expect(
      screen.getByRole('navigation', { name: /category filter/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Template')).toBeInTheDocument();
    expect(screen.getByText('Worksheet')).toBeInTheDocument();
    expect(screen.getByText('Handbook')).toBeInTheDocument();
  });

  it('renders search and access-tier filters', async () => {
    await renderPage({ q: 'planner', tier: 'free' });
    expect(screen.getByLabelText('Search')).toHaveValue('planner');
    expect(screen.getByLabelText('Access Tier')).toHaveValue('free');
    expect(screen.getByText(/Active Filters/i)).toBeInTheDocument();
  });

  it('renders publish readiness cards and advisory issues', async () => {
    await renderPage();
    expect(screen.getByText('Publish Readiness')).toBeInTheDocument();
    expect(screen.getAllByText('Ready').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Review').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('No cover image')).toBeInTheDocument();
  });

  it('renders bulk action controls and row selection checkboxes', async () => {
    await renderPage();
    expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Bulk Access Tier')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Weekly Planner Template')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('renders metadata with category, file type, and size', async () => {
    await renderPage();
    expect(screen.getByText(/template/)).toBeInTheDocument();
    expect(screen.getAllByText(/PDF/)).toHaveLength(2);
    expect(screen.getByText(/1\.0 MB/)).toBeInTheDocument();
  });
});

describe('DownloadsAdminPage — empty state', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders empty state when no downloads', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getAllDownloads: jest.fn().mockResolvedValue([]),
    }));

    const { default: DownloadsAdminPage } = await import(
      '@/app/(auth)/admin/downloads/page'
    );
    const searchParams = Promise.resolve({});
    render(await DownloadsAdminPage({ searchParams }));

    expect(
      screen.getByText('No downloads found. Create your first download.'),
    ).toBeInTheDocument();
  });
});
