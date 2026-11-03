/** @jest-environment node */
const mockConstructEvent = jest.fn();
const mockStripe = {
  webhooks: {
    constructEvent: mockConstructEvent,
  },
};
jest.mock('@/lib/stripe/config', () => ({
  getStripe: () => mockStripe,
  getWebhookSecret: jest.fn(),
  getTierFromPriceId: jest.fn((priceId: string) => {
    if (priceId === 'price_basic') return 'basic';
    if (priceId === 'price_premium') return 'premium';
    return null;
  }),
}));

const mockRpc = jest.fn();
const mockAdminClient = { rpc: mockRpc };
jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}));

import { POST } from '@/app/api/stripe/webhook/route';

function makeWebhookRequest(body: string, signature?: string) {
  const headers: Record<string, string> = {};
  if (signature) {
    headers['stripe-signature'] = signature;
  }
  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers,
    body,
  });
}

function makeEvent(type: string, data: Record<string, unknown> = {}) {
  return {
    id: 'evt_synthetic', created: 100, type,
    data: {
      object: data,
    },
  };
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: 'applied', error: null });
  });

  it('returns 400 when no signature header', async () => {
    const res = await POST(makeWebhookRequest('raw-body'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });
    const res = await POST(makeWebhookRequest('raw-body', 'bad_sig'));
    expect(res.status).toBe(400);
  });

  describe('checkout.session.completed', () => {
    it('updates member tier with customer and subscription IDs', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('checkout.session.completed', {
          customer: 'cus_123',
          subscription: 'sub_456',
          metadata: { userId: 'u1', tier: 'basic' },
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      expect(mockRpc).toHaveBeenCalledWith('apply_stripe_membership_event',
        expect.objectContaining({
          p_tier: 'basic',
          p_customer_id: 'cus_123',
          p_subscription_id: 'sub_456',
        }),
      );
      expect(mockRpc).toHaveBeenCalledWith('apply_stripe_membership_event', expect.objectContaining({ p_member_id: 'u1' }));
    });

    it('handles string customer ID', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('checkout.session.completed', {
          customer: 'cus_string',
          subscription: 'sub_789',
          metadata: { userId: 'u2', tier: 'premium' },
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      expect(mockRpc).toHaveBeenCalledWith('apply_stripe_membership_event',
        expect.objectContaining({
          p_customer_id: 'cus_string',
        }),
      );
    });

    it('handles object customer ID', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('checkout.session.completed', {
          customer: { id: 'cus_obj' },
          subscription: 'sub_abc',
          metadata: { userId: 'u3', tier: 'basic' },
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      expect(mockRpc).toHaveBeenCalledWith('apply_stripe_membership_event',
        expect.objectContaining({
          p_customer_id: 'cus_obj',
        }),
      );
    });

    it('skips when missing metadata', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('checkout.session.completed', {
          customer: 'cus_123',
          subscription: 'sub_456',
          metadata: {},
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('returns 200 and skips DB update for donation type', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('checkout.session.completed', {
          customer: 'cus_donor',
          subscription: null,
          amount_total: 2500,
          customer_email: 'donor@example.com',
          metadata: { type: 'donation', frequency: 'once' },
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.received).toBe(true);
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.updated', () => {
    it('updates tier for active subscription', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('customer.subscription.updated', {
          id: 'sub_123',
          customer: 'cus_123',
          status: 'active',
          items: {
            data: [{ price: { id: 'price_premium' } }],
          },
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      expect(mockRpc).toHaveBeenCalledWith('apply_stripe_membership_event',
        expect.objectContaining({ p_tier: 'premium', p_event_type: 'customer.subscription.updated' }),
      );
    });

    it('skips tier change for non-active status', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('customer.subscription.updated', {
          id: 'sub_123',
          customer: 'cus_123',
          status: 'past_due',
          items: {
            data: [{ price: { id: 'price_basic' } }],
          },
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('skips when unknown price ID', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('customer.subscription.updated', {
          id: 'sub_123',
          customer: 'cus_123',
          status: 'active',
          items: {
            data: [{ price: { id: 'price_unknown' } }],
          },
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.deleted', () => {
    it('downgrades to free tier', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('customer.subscription.deleted', {
          id: 'sub_123',
          customer: 'cus_123',
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      expect(mockRpc).toHaveBeenCalledWith('apply_stripe_membership_event',
        expect.objectContaining({ p_event_type: 'customer.subscription.deleted', p_tier: 'free' }),
      );
    });

    it('passes the deleted subscription ID for the database to clear', async () => {
      mockConstructEvent.mockReturnValue(
        makeEvent('customer.subscription.deleted', {
          id: 'sub_123',
          customer: 'cus_123',
        }),
      );
      const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
      expect(res.status).toBe(200);
      expect(mockRpc).toHaveBeenCalledWith('apply_stripe_membership_event',
        expect.objectContaining({ p_subscription_id: 'sub_123', p_event_type: 'customer.subscription.deleted' }),
      );
    });
  });

  it('returns 200 for invoice.payment_failed', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('invoice.payment_failed', {
        id: 'inv_123',
        customer: 'cus_123',
      }),
    );
    const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
    expect(res.status).toBe(200);
  });

  it('returns 200 for unknown event type', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('some.unknown.event', {}),
    );
    const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
    expect(res.status).toBe(200);
  });

  it('returns {received: true} on success', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('some.event', {}),
    );
    const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it('returns 500 when DB update throws', async () => {
    mockRpc.mockRejectedValue(new Error('DB error'));
    mockConstructEvent.mockReturnValue(
      makeEvent('checkout.session.completed', {
        customer: 'cus_123',
        subscription: 'sub_456',
        metadata: { userId: 'u1', tier: 'basic' },
      }),
    );
    const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
    expect(res.status).toBe(500);
  });

  it('returns 500 when DB update resolves with an error payload', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'Row-level policy violation' } });
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.deleted', {
        id: 'sub_123',
        customer: 'cus_123',
      }),
    );
    const res = await POST(makeWebhookRequest('raw-body', 'test_sig'));
    expect(res.status).toBe(500);
  });
});
