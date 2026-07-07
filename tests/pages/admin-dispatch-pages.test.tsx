import { render, screen } from '@testing-library/react';
import type { AdminActivityLog, Dispatch } from '@/lib/supabase/types';

const mockDispatch: Dispatch = {
  id: 'dsp-abc-123',
  title: 'Test Dispatch Title',
  slug: 'test-dispatch-title',
  lens: 'culture',
  excerpt: 'A short excerpt.',
  body: 'Full dispatch body content here.',
  status: 'published',
  author: 'The Chairman',
  cover_image: 'covers/test.webp',
  published_at: '2026-01-15T00:00:00Z',
  created_at: '2026-01-10T00:00:00Z',
};

const mockActivity: AdminActivityLog[] = [
  {
    id: 'activity-dispatch-1',
    actor_user_id: 'member-1',
    actor_email: 'operator@blackmalejournal.com',
    actor_role: 'admin',
    entity_type: 'dispatch',
    entity_id: 'dsp-abc-123',
    entity_title: 'Test Dispatch Title',
    action: 'updated',
    summary: 'Updated dispatch "Test Dispatch Title": slug -> test-dispatch-title.',
    metadata: {},
    created_at: '2026-03-25T10:00:00Z',
  },
];

const mockNotFound = jest.fn();

jest.mock('next/navigation', () => ({
  notFound: (...args: unknown[]) => mockNotFound(...args),
  redirect: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock delete-action to avoid server-only next/cache imports in jsdom.
jest.mock('@/app/(auth)/admin/dispatches/delete-action', () => ({
  deleteDispatchAction: jest.fn(),
}));

// Mock DeleteButton to avoid hooks issues in server component tests.
jest.mock('@/components/admin/DeleteButton', () => ({
  DeleteButton: () => <div data-testid="delete-button" />,
}));

// Mock DispatchForm to avoid hooks issues in server component tests.
// The DispatchForm itself is tested in admin-dispatch-form.test.tsx.
jest.mock('@/app/(auth)/admin/dispatches/DispatchForm', () => ({
  DispatchForm: ({ dispatch, action }: { dispatch?: Dispatch; action: unknown }) => (
    <div data-testid="dispatch-form">
      <span data-testid="form-mode">{dispatch ? 'edit' : 'create'}</span>
      <span data-testid="form-action">{typeof action}</span>
      {dispatch && <span data-testid="form-dispatch-id">{dispatch.id}</span>}
      <button type="submit">{dispatch ? 'Update Dispatch' : 'Create Dispatch'}</button>
    </div>
  ),
}));

// ── New Dispatch Page ──────────────────────────────────────────────────────────

describe('NewDispatchPage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "NEW DISPATCH" heading', async () => {
    jest.mock('@/app/(auth)/admin/dispatches/actions', () => ({
      createDispatchAction: jest.fn(),
    }));

    const { default: NewDispatchPage } = await import(
      '@/app/(auth)/admin/dispatches/new/page'
    );
    render(NewDispatchPage());

    expect(
      screen.getByRole('heading', { level: 1, name: 'NEW DISPATCH' }),
    ).toBeInTheDocument();
  });

  it('renders DispatchForm in create mode', async () => {
    jest.mock('@/app/(auth)/admin/dispatches/actions', () => ({
      createDispatchAction: jest.fn(),
    }));

    const { default: NewDispatchPage } = await import(
      '@/app/(auth)/admin/dispatches/new/page'
    );
    render(NewDispatchPage());

    expect(screen.getByTestId('dispatch-form')).toBeInTheDocument();
    expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    expect(
      screen.getByRole('button', { name: /create dispatch/i }),
    ).toBeInTheDocument();
  });
});

// ── Edit Dispatch Page ─────────────────────────────────────────────────────────

describe('EditDispatchPage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "EDIT DISPATCH" heading when dispatch exists', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getDispatchById: jest.fn().mockResolvedValue(mockDispatch),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/dispatches/actions', () => ({
      updateDispatchAction: jest.fn(),
    }));

    const { default: EditDispatchPage } = await import(
      '@/app/(auth)/admin/dispatches/[id]/edit/page'
    );
    const result = await EditDispatchPage({
      params: Promise.resolve({ id: 'dsp-abc-123' }),
    });
    render(result);

    expect(
      screen.getByRole('heading', { level: 1, name: 'EDIT DISPATCH' }),
    ).toBeInTheDocument();
  });

  it('shows dispatch ID', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getDispatchById: jest.fn().mockResolvedValue(mockDispatch),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/dispatches/actions', () => ({
      updateDispatchAction: jest.fn(),
    }));

    const { default: EditDispatchPage } = await import(
      '@/app/(auth)/admin/dispatches/[id]/edit/page'
    );
    const result = await EditDispatchPage({
      params: Promise.resolve({ id: 'dsp-abc-123' }),
    });
    render(result);

    expect(screen.getByText('ID: dsp-abc-123')).toBeInTheDocument();
  });

  it('renders DispatchForm in edit mode with "Update Dispatch" button', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getDispatchById: jest.fn().mockResolvedValue(mockDispatch),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/dispatches/actions', () => ({
      updateDispatchAction: jest.fn(),
    }));

    const { default: EditDispatchPage } = await import(
      '@/app/(auth)/admin/dispatches/[id]/edit/page'
    );
    const result = await EditDispatchPage({
      params: Promise.resolve({ id: 'dsp-abc-123' }),
    });
    render(result);

    expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    expect(screen.getByTestId('form-dispatch-id')).toHaveTextContent('dsp-abc-123');
    expect(
      screen.getByRole('button', { name: /update dispatch/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Owner Audit')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(mockActivity[0].summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /public dispatch/i })).toHaveAttribute(
      'href',
      '/blog/test-dispatch-title',
    );
  });

  it('calls notFound() when dispatch is null', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getDispatchById: jest.fn().mockResolvedValue(null),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue([]),
    }));
    jest.mock('@/app/(auth)/admin/dispatches/actions', () => ({
      updateDispatchAction: jest.fn(),
    }));

    const { default: EditDispatchPage } = await import(
      '@/app/(auth)/admin/dispatches/[id]/edit/page'
    );

    await EditDispatchPage({
      params: Promise.resolve({ id: 'nonexistent' }),
    }).catch(() => {
      // notFound() may throw — that's expected
    });

    expect(mockNotFound).toHaveBeenCalled();
  });
});
