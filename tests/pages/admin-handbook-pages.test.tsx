import { render, screen } from '@testing-library/react';
import type { AdminActivityLog, Handbook } from '@/lib/supabase/types';

const mockHandbook: Handbook = {
  id: 'hb-123',
  title: 'Political Field Manual',
  slug: 'political-field-manual',
  lens: 'politics',
  description: 'A field manual for disciplined organizing.',
  body: 'Full handbook body.',
  access_tier: 'premium',
  status: 'published',
  author: 'The Chairman',
  cover_image: 'covers/handbook.webp',
  file_url: 'handbooks/files/field-manual.pdf',
  published_at: '2026-01-15T00:00:00Z',
  created_at: '2026-01-10T00:00:00Z',
};

const mockActivity: AdminActivityLog[] = [
  {
    id: 'activity-handbook-1',
    actor_user_id: 'member-1',
    actor_email: 'operator@blackmalejournal.com',
    actor_role: 'editor',
    entity_type: 'handbook',
    entity_id: 'hb-123',
    entity_title: 'Political Field Manual',
    action: 'deleted',
    summary: 'Deleted handbook "Political Field Manual".',
    metadata: {},
    created_at: '2026-03-25T12:00:00Z',
  },
];

const mockNotFound = jest.fn();

jest.mock('next/navigation', () => ({
  notFound: (...args: unknown[]) => mockNotFound(...args),
  redirect: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/app/(auth)/admin/handbooks/delete-action', () => ({
  deleteHandbookAction: jest.fn(),
}));

jest.mock('@/components/admin/DeleteButton', () => ({
  DeleteButton: () => <div data-testid="delete-button" />,
}));

jest.mock('@/app/(auth)/admin/handbooks/HandbookForm', () => ({
  HandbookForm: ({
    handbook,
    action,
  }: {
    handbook?: Handbook;
    action: unknown;
  }) => (
    <div data-testid="handbook-form">
      <span data-testid="form-mode">{handbook ? 'edit' : 'create'}</span>
      <span data-testid="form-action">{typeof action}</span>
      {handbook && <span data-testid="form-handbook-id">{handbook.id}</span>}
      <button type="submit">{handbook ? 'Update Handbook' : 'Create Handbook'}</button>
    </div>
  ),
}));

describe('NewHandbookPage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "NEW HANDBOOK" heading', async () => {
    jest.mock('@/app/(auth)/admin/handbooks/actions', () => ({
      createHandbookAction: jest.fn(),
    }));

    const { default: NewHandbookPage } = await import(
      '@/app/(auth)/admin/handbooks/new/page'
    );
    render(NewHandbookPage());

    expect(
      screen.getByRole('heading', { level: 1, name: 'NEW HANDBOOK' }),
    ).toBeInTheDocument();
  });

  it('renders HandbookForm in create mode', async () => {
    jest.mock('@/app/(auth)/admin/handbooks/actions', () => ({
      createHandbookAction: jest.fn(),
    }));

    const { default: NewHandbookPage } = await import(
      '@/app/(auth)/admin/handbooks/new/page'
    );
    render(NewHandbookPage());

    expect(screen.getByTestId('handbook-form')).toBeInTheDocument();
    expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    expect(
      screen.getByRole('button', { name: /create handbook/i }),
    ).toBeInTheDocument();
  });
});

describe('EditHandbookPage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('renders "EDIT HANDBOOK" heading when handbook exists', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getHandbookById: jest.fn().mockResolvedValue(mockHandbook),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/handbooks/actions', () => ({
      updateHandbookAction: jest.fn(),
    }));

    const { default: EditHandbookPage } = await import(
      '@/app/(auth)/admin/handbooks/[id]/edit/page'
    );
    const result = await EditHandbookPage({
      params: Promise.resolve({ id: 'hb-123' }),
    });
    render(result);

    expect(
      screen.getByRole('heading', { level: 1, name: 'EDIT HANDBOOK' }),
    ).toBeInTheDocument();
  });

  it('renders HandbookForm in edit mode and owner audit links', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getHandbookById: jest.fn().mockResolvedValue(mockHandbook),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue(mockActivity),
    }));
    jest.mock('@/app/(auth)/admin/handbooks/actions', () => ({
      updateHandbookAction: jest.fn(),
    }));

    const { default: EditHandbookPage } = await import(
      '@/app/(auth)/admin/handbooks/[id]/edit/page'
    );
    const result = await EditHandbookPage({
      params: Promise.resolve({ id: 'hb-123' }),
    });
    render(result);

    expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    expect(screen.getByTestId('form-handbook-id')).toHaveTextContent('hb-123');
    expect(screen.getByText('Owner Audit')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(mockActivity[0].summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /public handbook/i })).toHaveAttribute(
      'href',
      '/handbooks/political-field-manual',
    );
  });

  it('calls notFound() when handbook is null', async () => {
    jest.mock('@/lib/supabase/admin-queries', () => ({
      getHandbookById: jest.fn().mockResolvedValue(null),
      getAdminActivityLogForEntity: jest.fn().mockResolvedValue([]),
    }));
    jest.mock('@/app/(auth)/admin/handbooks/actions', () => ({
      updateHandbookAction: jest.fn(),
    }));

    const { default: EditHandbookPage } = await import(
      '@/app/(auth)/admin/handbooks/[id]/edit/page'
    );

    await EditHandbookPage({
      params: Promise.resolve({ id: 'missing' }),
    }).catch(() => {
      // notFound() may throw.
    });

    expect(mockNotFound).toHaveBeenCalled();
  });
});
