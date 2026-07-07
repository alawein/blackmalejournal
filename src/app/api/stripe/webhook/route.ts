import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, getWebhookSecret, getTierFromPriceId } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';

type AdminClient = ReturnType<typeof createAdminClient>;
type MutationResult = { error?: { message?: string } | null };

function resolveCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | undefined {
  if (typeof customer === 'string') return customer;
  return customer?.id;
}

function assertMutationSucceeded(result: MutationResult, context: string) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message ?? 'Unknown Supabase error'}`);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: AdminClient) {
  // Donation payments: log and return — they do not update membership tier
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

  const result = await supabase
    .from('members')
    .update({
      tier,
      stripe_customer_id: customerId ?? null,
      stripe_subscription_id: subscriptionId ?? null,
    })
    .eq('id', userId);
  assertMutationSucceeded(result, 'Failed to update member after checkout completion');

  console.info(`[webhook] checkout.session.completed: user=${userId} tier=${tier}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: AdminClient) {
  const customerId = resolveCustomerId(subscription.customer);
  if (!customerId) return;

  if (subscription.status !== 'active') {
    console.info(`[webhook] subscription.updated: customer=${customerId} status=${subscription.status} — skipping tier change`);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const newTier = priceId ? getTierFromPriceId(priceId) : null;

  if (!newTier) {
    console.warn('[webhook] subscription.updated: unknown price ID', priceId);
    return;
  }

  const result = await supabase
    .from('members')
    .update({ tier: newTier })
    .eq('stripe_customer_id', customerId);
  assertMutationSucceeded(result, 'Failed to update member tier after subscription update');

  console.info(`[webhook] subscription.updated: customer=${customerId} tier=${newTier}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: AdminClient) {
  const customerId = resolveCustomerId(subscription.customer);
  if (!customerId) return;

  const result = await supabase
    .from('members')
    .update({ tier: 'free', stripe_subscription_id: null })
    .eq('stripe_customer_id', customerId);
  assertMutationSucceeded(result, 'Failed to downgrade member after subscription deletion');

  console.info(`[webhook] subscription.deleted: customer=${customerId} downgraded to free`);
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

  // getWebhookSecret() throws if the env var is missing — see lib/stripe/config.ts
  const webhookSecret = getWebhookSecret();

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;
      case 'invoice.payment_failed':
        handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.info(`[webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
