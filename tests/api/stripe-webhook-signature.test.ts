/** @jest-environment node */
import Stripe from 'stripe';
import { POST } from '@/app/api/stripe/webhook/route';

const mockSecret = 'whsec_synthetic_offline_fixture';
const mockStripe = new Stripe('sk_test_synthetic_offline_fixture');
const mockRpc = jest.fn();
const mockCreateAdminClient = jest.fn(() => ({ rpc: mockRpc }));
jest.mock('@/lib/stripe/config', () => ({
  getStripe: () => mockStripe,
  getWebhookSecret: () => mockSecret,
}));
jest.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => mockCreateAdminClient() }));

const payload = JSON.stringify({
  id: 'evt_synthetic', type: 'checkout.session.completed', created: 100,
  data: { object: { subscription: 'sub_demo', customer: 'cus_demo', metadata: { userId: 'user_demo', tier: 'premium' } } },
});
function deliver(body: string, header: string) {
  return POST(new Request('http://localhost/api/stripe/webhook', {
    method: 'POST', body, headers: { 'stripe-signature': header },
  }));
}

it('rejects a tampered payload before opening a database client and accepts the exact signed bytes', async () => {
  const header = mockStripe.webhooks.generateTestHeaderString({ payload, secret: mockSecret });
  expect((await deliver(payload + ' ', header)).status).toBe(400);
  expect(mockCreateAdminClient).not.toHaveBeenCalled();
  mockRpc.mockResolvedValue({ data: 'applied', error: null });
  expect((await deliver(payload, header)).status).toBe(200);
  expect(mockRpc).toHaveBeenCalledTimes(1);
});
