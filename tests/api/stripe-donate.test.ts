/** @jest-environment node */
const mockCheckoutCreate = jest.fn();
const mockStripe = {
  checkout: {
    sessions: {
      create: mockCheckoutCreate,
    },
  },
};
jest.mock('@/lib/stripe/config', () => ({
  getStripe: () => mockStripe,
}));

const mockRateLimitCheck = jest.fn();
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({ check: (...args: unknown[]) => mockRateLimitCheck(...args) }),
}));

jest.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) => (name === 'x-forwarded-for' ? '127.0.0.1' : null),
    }),
}));

import { POST } from '@/app/api/stripe/donate/route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/stripe/donate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeInvalidJsonRequest() {
  return new Request('http://localhost:3000/api/stripe/donate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad',
  });
}

const validOneTime = {
  amount: 25,
  frequency: 'once',
  coverFees: false,
};

const validMonthly = {
  amount: 10,
  frequency: 'monthly',
  coverFees: false,
};

describe('POST /api/stripe/donate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/donate_123' });
    mockRateLimitCheck.mockResolvedValue({ success: true, remaining: 9 });
  });

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(makeInvalidJsonRequest());
    expect(res.status).toBe(400);
  });

  it('returns 400 for amount less than 1', async () => {
    const res = await POST(makeRequest({ ...validOneTime, amount: 0 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for amount greater than 10000', async () => {
    const res = await POST(makeRequest({ ...validOneTime, amount: 10001 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid frequency', async () => {
    const res = await POST(makeRequest({ ...validOneTime, frequency: 'yearly' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 for one-time donation with payment mode', async () => {
    const res = await POST(makeRequest(validOneTime));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://checkout.stripe.com/donate_123');
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
      }),
    );
  });

  it('returns 200 for monthly donation with subscription mode', async () => {
    const res = await POST(makeRequest(validMonthly));
    expect(res.status).toBe(200);
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
      }),
    );
    // Verify recurring interval is set
    const callArgs = mockCheckoutCreate.mock.calls[0][0];
    const lineItem = callArgs.line_items[0];
    expect(lineItem.price_data.recurring).toEqual(
      expect.objectContaining({ interval: 'month' }),
    );
  });

  it('applies fee coverage correctly for $10', async () => {
    const res = await POST(makeRequest({ ...validMonthly, coverFees: true }));
    expect(res.status).toBe(200);
    // Expected: ceil(((10 + 0.30) / (1 - 0.029)) * 100) / 100 = 10.61
    const callArgs = mockCheckoutCreate.mock.calls[0][0];
    const unitAmount = callArgs.line_items[0].price_data.unit_amount;
    expect(unitAmount).toBe(1061);
  });

  it('applies fee coverage correctly for $25', async () => {
    const res = await POST(makeRequest({ ...validOneTime, amount: 25, coverFees: true }));
    expect(res.status).toBe(200);
    // Expected: ceil(((25 + 0.30) / (1 - 0.029)) * 100) / 100 = 26.05
    const expected = Math.ceil(((25 + 0.30) / (1 - 0.029)) * 100) / 100;
    const expectedCents = Math.round(expected * 100);
    const callArgs = mockCheckoutCreate.mock.calls[0][0];
    const unitAmount = callArgs.line_items[0].price_data.unit_amount;
    expect(unitAmount).toBe(expectedCents);
  });

  it('includes email as customer_email when provided', async () => {
    const res = await POST(makeRequest({ ...validOneTime, email: 'donor@example.com' }));
    expect(res.status).toBe(200);
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'donor@example.com',
      }),
    );
  });

  it('returns 500 when Stripe create throws', async () => {
    mockCheckoutCreate.mockRejectedValue(new Error('Stripe error'));
    const res = await POST(makeRequest(validOneTime));
    expect(res.status).toBe(500);
  });

  it('returns 429 when rate limit exceeded', async () => {
    mockRateLimitCheck.mockResolvedValue({ success: false, remaining: 0 });
    const req = makeRequest(validOneTime);
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('Too many requests');
    expect(mockRateLimitCheck).toHaveBeenCalledWith(10, '127.0.0.1');
  });
});
