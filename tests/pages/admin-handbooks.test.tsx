import { render, screen } from '@testing-library/react';
import { adminEditPath } from '@/lib/paths';
import type { Handbook } from '@/lib/supabase/types';

const mockHandbooks: Handbook[] = [
  {
    id: 'hb-1',
    title: 'Black Sovereignty Handbook',
    slug: 'black-sovereignty-handbook',
    lens: 'politics',
    description: 'A field manual for disciplined political work.',
    body: 'Full body text.',
    access_tier: 'premium',
    status: 'published',
    author: 'The Chairman',
    cover_image: '/covers/sovereignty.jpg',
    file_url: 'handbooks/black-sovereignty.pdf',
    published_at: '2026-03-10T00:00:00Z',
    created_at: '2026-03-08T00:00:00Z',
  },
  {
    id: 'hb-2',
    title: 'Health Discipline Primer',
    slug: 'health-discipline-primer',
    lens: 'health',
    description: 'A foundation for daily health discipline.',
    body: 'Full body text.',
    access_tier: 'basic',
    status: 'draft',
    author: 'The Chairman',
    cover_image: null,
    file_url: null,
    published_at: '2026-03-12T00:00:00Z',
    created_at: '2026-03-11T00:00:00Z',
  },
];

jest.mock('@/lib/supabase/admin-queries', () => ({
  getAllHandbooks: jest.fn().mockResolvedValue(mockHandbooks),
}));

jest.mock('@/app/(auth)/admin/handbooks/actions', () => ({
  bulkUpdateHandbookStatusAction: jest.fn(),
}));

describe('HandbooksAdminPage', () => {
  async function renderPage(
    params?: Partial<{ status: string; lens: string; q: string }>,
  ) {
    const { default: HandbooksAdminPage } = await import(
      '@/app/(auth)/admin/handbooks/page'
    );
    const searchParams = Promise.resolve(params ?? {});
    render(await HandbooksAdminPage({ searchParams }));
  }

  it('renders "HANDBOOKS" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'HANDBOOKS' }),
    ).toBeInTheDocument();
  });

  it('renders handbook titles and metadata', async () => {
    await renderPage();
    expect(screen.getByText('Black Sovereignty Handbook')).toBeInTheDocument();
    expect(screen.getByText('Health Discipline Primer')).toBeInTheDocument();
    expect(screen.getAllByText(/Politics\/Law/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Health\/Wellness/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders filters and status tabs', async () => {
    await renderPage({ q: 'discipline', lens: 'health' });
    expect(screen.getByLabelText('Search')).toHaveValue('discipline');
    expect(screen.getByLabelText('Lens')).toHaveValue('health');
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('renders publish readiness cards and blocking issues', async () => {
    await renderPage();
    expect(screen.getByText('Publish Readiness')).toBeInTheDocument();
    expect(screen.getAllByText('Ready').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Needs Work').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Missing cover image · Missing handbook file')).toBeInTheDocument();
  });

  it('renders bulk action controls and row selection checkboxes', async () => {
    await renderPage();
    expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Bulk Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Black Sovereignty Handbook')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('renders edit links', async () => {
    await renderPage();
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks[0]).toHaveAttribute('href', adminEditPath('handbooks', 'hb-1'));
    expect(editLinks[1]).toHaveAttribute('href', adminEditPath('handbooks', 'hb-2'));
  });
});
