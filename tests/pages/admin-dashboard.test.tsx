import { render, screen } from '@testing-library/react';
import { PATHS, adminEditPath } from '@/lib/paths';

jest.mock('@/lib/supabase/admin-queries', () => ({
  getAdminCommandCenterSnapshot: jest.fn().mockResolvedValue({
    counts: {
      articles: { total: 12, published: 8, draft: 4 },
      briefings: { total: 5, published: 4, draft: 1 },
      courses: { total: 6, published: 4, draft: 2 },
      dispatches: { total: 8, published: 6, draft: 2 },
      downloads: { total: 15 },
      handbooks: { total: 3, published: 2, draft: 1 },
      members: { total: 42 },
      messages: { total: 7 },
      subscribers: { total: 99 },
    },
    pipeline: {
      total: 11,
      statusCounts: {
        draft: 4,
        review: 2,
        scheduled: 3,
        published: 1,
        archived: 1,
        withdrawn: 0,
      },
      scheduledThisWeek: 2,
      scheduledQueue: [
        {
          id: 'briefing-1',
          title: 'Weekend Briefing 14',
          href: adminEditPath('briefings', 'briefing-1'),
          entity: 'briefing',
          descriptor: 'Briefing #14 · premium',
          ageInDays: 2,
          scheduledFor: '2026-03-29T12:00:00.000Z',
          reason: 'Scheduled within the next 7 days',
          severity: 'warning',
        },
      ],
      staleQueue: [
        {
          id: 'article-1',
          title: 'Draft Manifesto',
          href: adminEditPath('articles', 'article-1'),
          entity: 'article',
          descriptor: 'Article · politics · premium',
          ageInDays: 21,
          scheduledFor: null,
          reason: 'In draft for 21 days',
          severity: 'critical',
        },
      ],
    },
    activity: [
      {
        id: 'dispatch-2',
        title: 'Morning Organizing Note',
        href: adminEditPath('dispatches', 'dispatch-2'),
        entity: 'dispatch',
        descriptor: 'Dispatch · culture',
        happenedAt: '2026-03-25T08:00:00.000Z',
        label: 'Published',
      },
      {
        id: 'article-2',
        title: 'The New Discipline',
        href: adminEditPath('articles', 'article-2'),
        entity: 'article',
        descriptor: 'Article · culture · premium',
        happenedAt: '2026-03-24T18:00:00.000Z',
        label: 'Created',
      },
    ],
    members: {
      total: 42,
      free: 20,
      basic: 12,
      premium: 10,
      paying: 22,
      admins: 2,
      editors: 3,
      stripeCustomers: 20,
      stripeSubscriptions: 19,
      billingExceptions: 3,
      joinedPast30Days: 6,
    },
    messages: {
      total: 7,
      newCount: 3,
      inProgressCount: 2,
      resolvedCount: 1,
      spamCount: 1,
      unresolvedCount: 5,
      overdueCount: 2,
      queue: [],
    },
    subscribers: {
      total: 99,
      active: 87,
      unsubscribed: 12,
      newPast30Days: 18,
      churnPast30Days: 5,
      netPast30Days: 13,
      topSources: [
        { source: 'homepage', count: 20 },
        { source: 'dispatch', count: 12 },
      ],
    },
  }),
}));

jest.mock('@/components/ui/StarDivider', () => ({
  StarDivider: ({ className }: { className?: string }) => (
    <hr data-testid="star-divider" className={className} />
  ),
}));

describe('AdminDashboardPage', () => {
  async function renderPage() {
    const { default: AdminDashboardPage } = await import(
      '@/app/(auth)/admin/page'
    );
    render(await AdminDashboardPage());
  }

  it('renders the dashboard heading', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'DASHBOARD' }),
    ).toBeInTheDocument();
  });

  it('renders command-center metric cards', async () => {
    await renderPage();
    expect(screen.getByText('Inbox Pressure')).toBeInTheDocument();
    expect(screen.getByText('Editorial Backlog')).toBeInTheDocument();
    expect(screen.getByText('Scheduled This Week')).toBeInTheDocument();
    expect(screen.getByText('Paying Members')).toBeInTheDocument();
    expect(screen.getByText('Active Subscribers')).toBeInTheDocument();
  });

  it('renders attention and publishing sections', async () => {
    await renderPage();
    expect(screen.getByText('ATTENTION QUEUE')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHING QUEUE')).toBeInTheDocument();
    expect(screen.getByText('Draft Manifesto')).toBeInTheDocument();
    expect(screen.getByText('Weekend Briefing 14')).toBeInTheDocument();
  });

  it('renders top subscriber sources', async () => {
    await renderPage();
    expect(screen.getByText('TOP SOURCES')).toBeInTheDocument();
    expect(screen.getByText('homepage')).toBeInTheDocument();
    expect(screen.getByText('dispatch')).toBeInTheDocument();
  });

  it('renders recent editorial activity', async () => {
    await renderPage();
    expect(screen.getByText('RECENT EDITORIAL ACTIVITY')).toBeInTheDocument();
    expect(screen.getByText('Morning Organizing Note')).toBeInTheDocument();
    expect(screen.getByText('The New Discipline')).toBeInTheDocument();
  });

  it('renders coverage cards for admin sections', async () => {
    await renderPage();
    expect(screen.getByText('Articles')).toBeInTheDocument();
    expect(screen.getByText('Briefings')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('Subscribers')).toBeInTheDocument();
  });

  it('renders quick action links', async () => {
    await renderPage();
    expect(screen.getByRole('link', { name: /new article/i })).toHaveAttribute(
      'href',
      PATHS.ADMIN_ARTICLES_NEW,
    );
    expect(screen.getByRole('link', { name: /new course/i })).toHaveAttribute(
      'href',
      PATHS.ADMIN_COURSES_NEW,
    );
    expect(screen.getByRole('link', { name: /new download/i })).toHaveAttribute(
      'href',
      PATHS.ADMIN_DOWNLOADS_NEW,
    );
  });

  it('renders star dividers', async () => {
    await renderPage();
    expect(screen.getAllByTestId('star-divider').length).toBeGreaterThanOrEqual(3);
  });
});
