import { createMockStripe, type MockStripe } from '../helpers/stripe-mock';

// ── Module-level mock ────────────────────────────────────────────────────────
const mockStripeInstance: MockStripe = createMockStripe();

jest.mock('@/lib/stripe/config', () => ({
  getStripe: () => mockStripeInstance,
  getPriceIdForTier: (tier: string) => `price_${tier}_123`,
}));

import {
  createCheckoutSession,
  createBillingPortalSession,
} from '@/lib/stripe/helpers';

// ── Setup ────────────────────────────────────────────────────────────────────

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://test.example.com';
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset to default resolved value
  mockStripeInstance.checkout.sessions.create.mockResolvedValue({
    url: 'https://checkout.stripe.com/test-session',
    id: 'cs_test_123',
  });
  mockStripeInstance.billingPortal.sessions.create.mockResolvedValue({
    url: 'https://billing.stripe.com/test-session',
  });
});

// ── createCheckoutSession ────────────────────────────────────────────────────

describe('createCheckoutSession', () => {
  it('returns checkout URL from Stripe', async () => {
    const url = await createCheckoutSession('user-1', 'user@example.com', 'basic');
    expect(url).toBe('https://checkout.stripe.com/test-session');
  });

  it('passes correct params to Stripe', async () => {
    await createCheckoutSession('user-1', 'user@example.com', 'basic');
    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        customer_email: 'user@example.com',
        metadata: { userId: 'user-1', tier: 'basic' },
        line_items: [{ price: 'price_basic_123', quantity: 1 }],
      }),
    );
  });

  it('throws when session.url is null', async () => {
    mockStripeInstance.checkout.sessions.create.mockResolvedValue({ url: null, id: 'cs_test_123' });
    await expect(createCheckoutSession('user-1', 'user@example.com', 'basic')).rejects.toThrow(
      'Stripe did not return a checkout URL',
    );
  });

  it('works for basic tier', async () => {
    await createCheckoutSession('user-1', 'user@example.com', 'basic');
    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: 'price_basic_123', quantity: 1 }],
        metadata: expect.objectContaining({ tier: 'basic' }),
      }),
    );
  });

  it('works for premium tier', async () => {
    await createCheckoutSession('user-1', 'user@example.com', 'premium');
    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: 'price_premium_123', quantity: 1 }],
        metadata: expect.objectContaining({ tier: 'premium' }),
      }),
    );
  });
});

// ── createBillingPortalSession ───────────────────────────────────────────────

describe('createBillingPortalSession', () => {
  it('returns billing portal URL', async () => {
    const url = await createBillingPortalSession('cus_test_123');
    expect(url).toBe('https://billing.stripe.com/test-session');
  });

  it('passes correct customer ID', async () => {
    await createBillingPortalSession('cus_test_123');
    expect(mockStripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_test_123',
      }),
    );
  });

  it('passes correct return_url', async () => {
    await createBillingPortalSession('cus_test_123');
    expect(mockStripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        return_url: expect.stringContaining('/portal/settings'),
      }),
    );
  });
});
