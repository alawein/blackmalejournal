/** @jest-environment node */
const mockGetUser = jest.fn();
const mockCreateClient = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

const mockGetMemberById = jest.fn();
jest.mock('@/lib/supabase/queries', () => ({
  getMemberById: (...args: unknown[]) => mockGetMemberById(...args),
}));

const mockCreateBillingPortalSession = jest.fn();
jest.mock('@/lib/stripe/helpers', () => ({
  createBillingPortalSession: (...args: unknown[]) => mockCreateBillingPortalSession(...args),
}));

import { POST } from '@/app/api/stripe/manage-billing/route';
import { mockMemberPremium } from '../helpers/fixtures';

function makeRequest() {
  return new Request('http://localhost:3000/api/stripe/manage-billing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockAuthUser(user: { id: string; email?: string } | null) {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
      }),
    },
  });
}

describe('POST /api/stripe/manage-billing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateBillingPortalSession.mockResolvedValue('https://billing.stripe.com/portal_123');
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('returns 400 when member not found', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    mockGetMemberById.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(400);
  });

  it('returns 400 when member has no stripe_customer_id', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    mockGetMemberById.mockResolvedValue({ id: 'u1', stripe_customer_id: null });
    const res = await POST();
    expect(res.status).toBe(400);
  });

  it('returns 200 with portal URL', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    mockGetMemberById.mockResolvedValue(mockMemberPremium);
    const res = await POST();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://billing.stripe.com/portal_123');
  });

  it('calls getMemberById with correct user ID', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    mockGetMemberById.mockResolvedValue(mockMemberPremium);
    await POST();
    expect(mockGetMemberById).toHaveBeenCalledWith('u1');
  });

  it('calls createBillingPortalSession with correct customer ID', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    mockGetMemberById.mockResolvedValue(mockMemberPremium);
    await POST();
    expect(mockCreateBillingPortalSession).toHaveBeenCalledWith(mockMemberPremium.stripe_customer_id);
  });

  it('returns 500 when portal session creation throws', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    mockGetMemberById.mockResolvedValue(mockMemberPremium);
    mockCreateBillingPortalSession.mockRejectedValue(new Error('Stripe error'));
    const res = await POST();
    expect(res.status).toBe(500);
  });
});
