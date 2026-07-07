/** @jest-environment node */
const mockGetUser = jest.fn();
const mockCreateClient = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

const mockCreateCheckoutSession = jest.fn();
jest.mock('@/lib/stripe/helpers', () => ({
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckoutSession(...args),
}));

import { POST } from '@/app/api/stripe/checkout/route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeInvalidJsonRequest() {
  return new Request('http://localhost:3000/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad json',
  });
}

function mockAuthUser(user: { id: string; email?: string | null } | null) {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
      }),
    },
  });
}

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateCheckoutSession.mockResolvedValue('https://checkout.stripe.com/session_123');
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const res = await POST(makeRequest({ tier: 'basic' }));
    expect(res.status).toBe(401);
  });

  it('returns 401 when user has no email', async () => {
    mockAuthUser({ id: 'u1', email: null });
    const res = await POST(makeRequest({ tier: 'basic' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid JSON', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    const res = await POST(makeInvalidJsonRequest());
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid tier', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    const res = await POST(makeRequest({ tier: 'gold' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with url for basic tier', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    const res = await POST(makeRequest({ tier: 'basic' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://checkout.stripe.com/session_123');
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      'u1',
      'test@example.com',
      'basic',
      '/portal',
    );
  });

  it('returns 200 with url for premium tier', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    const res = await POST(makeRequest({ tier: 'premium' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBeDefined();
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      'u1',
      'test@example.com',
      'premium',
      '/portal',
    );
  });

  it('passes a normalized return path to createCheckoutSession', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });

    const res = await POST(
      makeRequest({ tier: 'basic', returnTo: '/articles/return-here?ref=paywall' }),
    );

    expect(res.status).toBe(200);
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      'u1',
      'test@example.com',
      'basic',
      '/articles/return-here?ref=paywall',
    );
  });

  it('returns 500 when createCheckoutSession throws', async () => {
    mockAuthUser({ id: 'u1', email: 'test@example.com' });
    mockCreateCheckoutSession.mockRejectedValue(new Error('Stripe error'));
    const res = await POST(makeRequest({ tier: 'basic' }));
    expect(res.status).toBe(500);
  });
});
