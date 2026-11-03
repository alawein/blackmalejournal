import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, getWebhookSecret, getTierFromPriceId } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';

type MembershipChange = {
  p_member_id: string | null;
  p_customer_id: string | null;
  p_subscription_id: string | null;
  p_tier: string;
};

function resolveCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | undefined {
  if (typeof customer === 'string') return customer;
  return customer?.id;
}

function checkoutChange(session: Stripe.Checkout.Session): MembershipChange | undefined {
  // Donation payments: log and return - they do not update membership tier
  if (session.metadata?.type === 'donation') {
    const amountCents = session.amount_total ?? 0;
    const amountDollars = (amountCents / 100).toFixed(2);
    const email = session.customer_email ?? 'anonymous';
    console.info(`[webhook] donation.completed: amount=$${amountDollars} email=${email}`);
    return;
  }

  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as 'basic' | 'premium' | undefined;

  if (!userId || !tier) {
    console.error('[webhook] Missing metadata on checkout session');
    return;
  }

  const customerId = resolveCustomerId(session.customer);
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  return { p_member_id: userId, p_customer_id: customerId ?? null,
    p_subscription_id: subscriptionId ?? null, p_tier: tier };
}

function subscriptionChange(subscription: Stripe.Subscription): MembershipChange | undefined {
  const customerId = resolveCustomerId(subscription.customer);
  if (!customerId) return;

  if (subscription.status !== 'active') {
    console.info(`[webhook] subscription.updated: customer=${customerId} status=${subscription.status} - skipping tier change`);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const newTier = priceId ? getTierFromPriceId(priceId) : null;

  if (!newTier) {
    console.warn('[webhook] subscription.updated: unknown price ID', priceId);
    return;
  }

  return { p_member_id: null, p_customer_id: customerId,
    p_subscription_id: subscription.id, p_tier: newTier };
}

function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.warn(`[webhook] payment_failed: customer=${resolveCustomerId(invoice.customer)}`);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // getWebhookSecret() throws if the env var is missing - see lib/stripe/config.ts
  const webhookSecret = getWebhookSecret();

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    let change: MembershipChange | undefined;
    switch (event.type) {
      case 'checkout.session.completed':
        change = checkoutChange(event.data.object);
        break;
      case 'customer.subscription.updated':
        change = subscriptionChange(event.data.object);
        break;
      case 'customer.subscription.deleted': {
        const customerId = resolveCustomerId(event.data.object.customer);
        if (customerId) change = {
          p_member_id: null, p_customer_id: customerId,
          p_subscription_id: event.data.object.id, p_tier: 'free',
        };
        break;
      }
      case 'invoice.payment_failed':
        handlePaymentFailed(event.data.object);
        break;
      default:
        console.info(`[webhook] Unhandled event: ${event.type}`);
    }
    if (change) {
      const { data, error } = await createAdminClient().rpc('apply_stripe_membership_event', {
        ...change, p_event_id: event.id, p_event_type: event.type,
        p_stripe_created: new Date(event.created * 1000).toISOString(),
      });
      if (error) throw error;
      console.info(`[webhook] ${event.type}: ${data}`);
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
