/** @jest-environment node */
const mockSubmitContactForm = jest.fn();
jest.mock('@/lib/supabase/queries', () => ({
  submitContactForm: (...args: unknown[]) => mockSubmitContactForm(...args),
}));

const mockSend = jest.fn().mockResolvedValue({ id: 'test' });
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

let _ipCounter = 0;
jest.mock('next/headers', () => ({
  headers: () => Promise.resolve(new Map([['x-forwarded-for', `10.0.0.${++_ipCounter}`]])),
}));

import { POST } from '@/app/api/contact/route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeInvalidJsonRequest() {
  return new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{not valid json',
  });
}

const validPayload = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Inquiry',
  message: 'This is a valid test message with enough characters.',
};

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmitContactForm.mockResolvedValue({ id: 'contact-1' });
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    delete process.env.CONTACT_TO_EMAIL;
  });

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(makeInvalidJsonRequest());
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await POST(makeRequest({ name: 'Test' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    const res = await POST(makeRequest({ ...validPayload, email: 'not-an-email' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for message too short', async () => {
    const res = await POST(makeRequest({ ...validPayload, message: 'short' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with valid data and calls submitContactForm', async () => {
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockSubmitContactForm).toHaveBeenCalledWith(
      expect.objectContaining({
        name: validPayload.name,
        email: validPayload.email,
        subject: validPayload.subject,
        message: validPayload.message,
      }),
    );
  });

  it('returns 200 even when Resend env vars are not set', async () => {
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('returns 200 and sends email when Resend env vars are present', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_FROM_EMAIL = 'noreply@example.com';
    process.env.CONTACT_TO_EMAIL = 'admin@example.com';
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalled();
  });

  it('returns 500 when submitContactForm throws', async () => {
    mockSubmitContactForm.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(500);
  });
});
