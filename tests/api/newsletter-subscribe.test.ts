/** @jest-environment node */
const mockSubscribe = jest.fn();
jest.mock('@/lib/supabase/queries', () => ({
  subscribeToNewsletter: (...args: unknown[]) => mockSubscribe(...args),
}));

const mockRateLimitCheck = jest.fn();
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({ check: (...args: unknown[]) => mockRateLimitCheck(...args) }),
}));

jest.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) => (name === 'x-forwarded-for' ? '10.0.0.1' : null),
    }),
}));

import { POST } from '@/app/api/newsletter/subscribe/route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeInvalidJsonRequest() {
  return new Request('http://localhost:3000/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{broken json!!',
  });
}

describe('POST /api/newsletter/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribe.mockResolvedValue({ id: 'sub-1' });
    mockRateLimitCheck.mockResolvedValue({ success: true, remaining: 4 });
  });

  it('returns 429 when rate limit exceeded', async () => {
    mockRateLimitCheck.mockResolvedValue({ success: false, remaining: 0 });
    const res = await POST(makeRequest({ email: 'user@example.com' }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('Too many requests');
    expect(mockRateLimitCheck).toHaveBeenCalledWith(5, '10.0.0.1');
  });

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(makeInvalidJsonRequest());
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing email', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await POST(makeRequest({ email: 'not-valid' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with valid email and calls subscribeToNewsletter with default source', async () => {
    const res = await POST(makeRequest({ email: 'user@example.com' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockSubscribe).toHaveBeenCalledWith('user@example.com', 'website');
  });

  it('returns 200 with source param and passes it through', async () => {
    const res = await POST(makeRequest({ email: 'user@example.com', source: 'footer' }));
    expect(res.status).toBe(200);
    expect(mockSubscribe).toHaveBeenCalledWith('user@example.com', 'footer');
  });

  it('normalizes email and blank source before subscribing', async () => {
    const res = await POST(makeRequest({ email: '  USER@Example.COM  ', source: '   ' }));
    expect(res.status).toBe(200);
    expect(mockSubscribe).toHaveBeenCalledWith('user@example.com', 'website');
  });

  it('returns 500 when subscribeToNewsletter throws', async () => {
    mockSubscribe.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeRequest({ email: 'user@example.com' }));
    expect(res.status).toBe(500);
  });
});
