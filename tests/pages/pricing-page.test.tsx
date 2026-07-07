import { render, screen } from '@testing-library/react';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/supabase/queries', () => ({
  getMemberById: jest.fn(),
}));

jest.mock('@/components/brand/BrandMark', () => ({
  BrandMark: () => <span data-testid="brand-mark" />,
}));

jest.mock('@/components/ui/StarDivider', () => ({
  StarDivider: ({ className }: { className?: string }) => (
    <hr data-testid="star-divider" className={className} />
  ),
}));

import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';

const mockCreateClient = jest.mocked(createClient);
const mockGetMemberById = jest.mocked(getMemberById);

describe('PricingPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders signup links for anonymous visitors', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);
    mockGetMemberById.mockResolvedValue(null);

    const { default: PricingPage } = await import('@/app/(public)/pricing/page');

    render(await PricingPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'CHOOSE YOUR ACCESS' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Join Premium/i }),
    ).toHaveAttribute('href', '/signup?tier=premium');
  });

  it('renders upgrade links for authenticated members and preserves next', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'member-1',
            },
          },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);
    mockGetMemberById.mockResolvedValue({
      id: 'member-1',
      email: 'member@example.com',
      tier: 'basic',
      role: 'member',
      stripe_customer_id: 'cus_123',
      stripe_subscription_id: 'sub_123',
      created_at: '2025-01-01T00:00:00.000Z',
    });

    const { default: PricingPage } = await import('@/app/(public)/pricing/page');

    render(
      await PricingPage({
        searchParams: Promise.resolve({ next: '/articles/test-piece' }),
      }),
    );

    expect(
      screen.getByRole('link', { name: /Choose Premium/i }),
    ).toHaveAttribute(
      'href',
      '/portal/settings?upgrade=premium&next=%2Farticles%2Ftest-piece',
    );
    expect(screen.queryByRole('link', { name: /Current Plan/i })).not.toBeInTheDocument();
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
  });

  it('does not offer lower-tier checkout paths to premium members', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'member-2',
            },
          },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);
    mockGetMemberById.mockResolvedValue({
      id: 'member-2',
      email: 'premium@example.com',
      tier: 'premium',
      role: 'member',
      stripe_customer_id: 'cus_456',
      stripe_subscription_id: 'sub_456',
      created_at: '2025-01-01T00:00:00.000Z',
    });

    const { default: PricingPage } = await import('@/app/(public)/pricing/page');

    render(await PricingPage({ searchParams: Promise.resolve({ next: '/briefings/issue-10' }) }));

    expect(screen.queryByRole('link', { name: /Choose Basic/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Create Free Account/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('Included in Premium')).toHaveLength(2);
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
  });
});
