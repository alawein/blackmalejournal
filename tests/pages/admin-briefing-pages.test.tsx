import { render, screen } from '@testing-library/react';
import type { AdminActivityLog, Briefing } from '@/lib/supabase/types';

const mockBriefing: Briefing = {
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
  cover_image: null,
  published_at: '2026-03-15T00:00:00Z',
  created_at: '2026-03-14T00:00:00Z',
};

const mockActivity: AdminActivityLog[] = [
  {
    id: 'activity-briefing-1',
    actor_user_id: 'member-1',
    actor_email: 'operator@blackmalejournal.com',
    actor_role: 'editor',
    entity_type: 'briefing',
    entity_id: 'br-1',
    entity_title: 'Weekend Briefing 003',
    action: 'created',
    summary: 'Created briefing "Weekend Briefing 003" as published.',
    metadata: {},
    created_at: '2026-03-25T09:00:00Z',
  },
];

const mockNotFound = jest.fn();

jest.mock('next/navigation', () => ({
  notFound: (...args: unknown[]) => mockNotFound(...args),
  redirect: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock delete-action to avoid server-only next/cache imports in jsdom.
jest.mock('@/app/(auth)/admin/briefings/delete-action', () => ({
  deleteBriefingAction: jest.fn(),
}));

// Mock DeleteButton to avoid hooks issues in server component tests.
jest.mock('@/components/admin/DeleteButton', () => ({
  DeleteButton: () => <div data-testid="delete-button" />,
}));

// Mock BriefingForm to avoid hooks issues in server component tests.
// The BriefingForm itself is tested in admin-briefing-form.test.tsx.
jest.mock('@/app/(auth)/admin/briefings/BriefingForm', () => ({
  BriefingForm: ({ briefing, action }: { briefing?: Briefing; action: unknown }) => (
    <div data-testid="briefing-form">
      <span data-testid="form-mode">{briefing ? 'edit' : 'create'}</span>
      <span data-testid="form-action">{typeof action}</span>
      {briefing && <span data-testid="form-briefing-id">{briefing.id}</span>}
      <button type="submit">{briefing ? 'Update Briefing' : 'Create Briefing'}</button>
    </div>
  ),
}));

// ── New Briefing Page ──────────────────────────────────────────────────────────

describe('NewBriefingPage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "NEW BRIEFING" heading', async () => {
    jest.mock('@/app/(auth)/admin/briefings/actions', () => ({
      createBriefingAction: jest.fn(),
    }));

    const { default: NewBriefingPage } = await import(
      '@/app/(auth)/admin/briefings/new/page'
    );
    render(NewBriefingPage());

    expect(
      screen.getByRole('heading', { level: 1, name: 'NEW BRIEFING' }),
    ).toBeInTheDocument();
  });

  it('renders BriefingForm in create mode', async () => {
    jest.mock('@/app/(auth)/admin/briefings/actions', () => ({
      createBriefingAction: jest.fn(),
    }));

    const { default: NewBriefingPage } = await import(
      '@/app/(auth)/admin/briefings/new/page'
    );
    render(NewBriefingPage());

    expect(screen.getByTestId('briefing-form')).toBeInTheDocument();
    expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    expect(
      screen.getByRole('button', { name: /create briefing/i }),
    ).toBeInTheDocument();
  });
});

// ── Edit Briefing Page ─────────────────────────────────────────────────────────

describe('EditBriefingPage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "EDIT BRIEFING" heading when briefing exists', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getBriefingById: jest.fn().mockResolvedValue(mockBriefing),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/briefings/actions', () => ({
      updateBriefingAction: jest.fn(),
    }));

    const { default: EditBriefingPage } = await import(
      '@/app/(auth)/admin/briefings/[id]/edit/page'
    );
    const result = await EditBriefingPage({
      params: Promise.resolve({ id: 'br-1' }),
    });
    render(result);

    expect(
      screen.getByRole('heading', { level: 1, name: 'EDIT BRIEFING' }),
    ).toBeInTheDocument();
  });

  it('shows briefing ID', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getBriefingById: jest.fn().mockResolvedValue(mockBriefing),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/briefings/actions', () => ({
      updateBriefingAction: jest.fn(),
    }));

    const { default: EditBriefingPage } = await import(
      '@/app/(auth)/admin/briefings/[id]/edit/page'
    );
    const result = await EditBriefingPage({
      params: Promise.resolve({ id: 'br-1' }),
    });
    render(result);

    expect(screen.getByText('ID: br-1')).toBeInTheDocument();
  });

  it('renders BriefingForm in edit mode with "Update Briefing" button', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getBriefingById: jest.fn().mockResolvedValue(mockBriefing),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/briefings/actions', () => ({
      updateBriefingAction: jest.fn(),
    }));

    const { default: EditBriefingPage } = await import(
      '@/app/(auth)/admin/briefings/[id]/edit/page'
    );
    const result = await EditBriefingPage({
      params: Promise.resolve({ id: 'br-1' }),
    });
    render(result);

    expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    expect(screen.getByTestId('form-briefing-id')).toHaveTextContent('br-1');
    expect(
      screen.getByRole('button', { name: /update briefing/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Owner Audit')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(mockActivity[0].summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /public briefing/i })).toHaveAttribute(
      'href',
      '/briefings/weekend-briefing-003',
    );
  });

  it('calls notFound() when briefing is null', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getBriefingById: jest.fn().mockResolvedValue(null),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue([]),
    }));
    jest.mock('@/app/(auth)/admin/briefings/actions', () => ({
      updateBriefingAction: jest.fn(),
    }));

    const { default: EditBriefingPage } = await import(
      '@/app/(auth)/admin/briefings/[id]/edit/page'
    );

    await EditBriefingPage({
      params: Promise.resolve({ id: 'nonexistent' }),
    }).catch(() => {
      // notFound() may throw — that's expected
    });

    expect(mockNotFound).toHaveBeenCalled();
  });
});
