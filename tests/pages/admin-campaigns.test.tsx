import { render, screen } from '@testing-library/react';
import { PATHS, adminEditPath } from '@/lib/paths';
import type { Campaign } from '@/lib/supabase/types';

const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    title: 'March Newsletter',
    subject: 'This Month in the Movement',
    body: '## Headline\n\nBody text here.',
    audience_filter: { activeOnly: true },
    recipient_count: 120,
    status: 'draft',
    scheduled_at: null,
    sent_at: null,
    created_at: '2026-03-10T00:00:00Z',
    updated_at: '2026-03-15T00:00:00Z',
  },
  {
    id: 'camp-2',
    title: 'Welcome Series #1',
    subject: 'Welcome to The Black Male Journal',
    body: 'Welcome aboard.',
    audience_filter: { activeOnly: true, source: 'homepage' },
    recipient_count: 45,
    status: 'sent',
    scheduled_at: '2026-03-01T10:00:00Z',
    sent_at: '2026-03-01T10:00:00Z',
    created_at: '2026-02-28T00:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
];

jest.mock('@/lib/supabase/admin-queries/campaigns', () => ({
  getAllCampaigns: jest.fn().mockResolvedValue(mockCampaigns),
}));

jest.mock('@/app/(auth)/admin/campaigns/actions', () => ({
  deleteCampaignAction: jest.fn(),
}));

describe('CampaignsAdminPage', () => {
  async function renderPage(
    params?: Partial<{ status: string; notice: string }>,
  ) {
    const { default: CampaignsAdminPage } = await import(
      '@/app/(auth)/admin/campaigns/page'
    );
    const searchParams = Promise.resolve(params ?? {});
    render(await CampaignsAdminPage({ searchParams }));
  }

  it('renders "CAMPAIGNS" heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'CAMPAIGNS' }),
    ).toBeInTheDocument();
  });

  it('renders "New Campaign" link', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: /new campaign/i });
    expect(link).toHaveAttribute('href', PATHS.ADMIN_CAMPAIGNS_NEW);
  });

  it('renders campaign titles as links', async () => {
    await renderPage();
    expect(screen.getByText('March Newsletter')).toBeInTheDocument();
    expect(screen.getByText('Welcome Series #1')).toBeInTheDocument();
  });

  it('renders campaign subject lines', async () => {
    await renderPage();
    expect(
      screen.getByText('This Month in the Movement'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Welcome to The Black Male Journal'),
    ).toBeInTheDocument();
  });

  it('renders status badges', async () => {
    await renderPage();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('sent')).toBeInTheDocument();
  });

  it('renders recipient counts', async () => {
    await renderPage();
    expect(screen.getByText(/120 recipients/)).toBeInTheDocument();
    expect(screen.getByText(/45 recipients/)).toBeInTheDocument();
  });

  it('renders campaign count', async () => {
    await renderPage();
    expect(screen.getByText('2 campaigns')).toBeInTheDocument();
  });

  it('renders Edit links pointing to campaign edit pages', async () => {
    await renderPage();
    const editLinks = screen.getAllByRole('link', { name: /^edit$/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute(
      'href',
      adminEditPath('campaigns', 'camp-1'),
    );
    expect(editLinks[1]).toHaveAttribute(
      'href',
      adminEditPath('campaigns', 'camp-2'),
    );
  });

  it('renders status filter tabs', async () => {
    await renderPage();
    expect(
      screen.getByRole('navigation', { name: /status filter/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
  });

  it('renders Delete button only for draft campaigns', async () => {
    await renderPage();
    // Only the draft campaign should have a delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(1);
  });
});

describe('CampaignsAdminPage — empty state', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders empty state when no campaigns', async () => {
    jest.mock('@/lib/supabase/admin-queries/campaigns', () => ({
      getAllCampaigns: jest.fn().mockResolvedValue([]),
    }));

    jest.mock('@/app/(auth)/admin/campaigns/actions', () => ({
      deleteCampaignAction: jest.fn(),
    }));

    const { default: CampaignsAdminPage } = await import(
      '@/app/(auth)/admin/campaigns/page'
    );
    const searchParams = Promise.resolve({});
    render(await CampaignsAdminPage({ searchParams }));

    expect(screen.getByText(/No campaigns yet\./)).toBeInTheDocument();
  });
});
