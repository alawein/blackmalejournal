import { NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe/config';
import { resolveSiteUrl } from '@/lib/site-url';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

const donateSchema = z.object({
  amount: z.number().min(1, 'Minimum $1').max(10000, 'Maximum $10,000'),
  frequency: z.enum(['monthly', 'once']),
  coverFees: z.boolean().optional().default(false),
  note: z.string().max(500).optional(),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  const siteUrl = resolveSiteUrl();

  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success } = await limiter.check(10, ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = donateSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Validation failed';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { frequency, coverFees, note, email } = result.data;
  let { amount } = result.data;

  // If covering fees, adjust amount so BMJ receives the original amount after Stripe's cut
  // Stripe charges 2.9% + $0.30
  if (coverFees) {
    amount = Math.ceil(((amount + 0.30) / (1 - 0.029)) * 100) / 100;
  }

  const unitAmount = Math.round(amount * 100); // Convert to cents

  const isRecurring = frequency === 'monthly';
  const productName = isRecurring
    ? 'Monthly Support — The Black Male Journal'
    : 'Support — The Black Male Journal';

  try {
    const stripe = getStripe();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: isRecurring ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: productName },
            unit_amount: unitAmount,
            ...(isRecurring && { recurring: { interval: 'month' as const } }),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'donation',
        frequency,
        ...(note && { note }),
      },
      success_url: `${siteUrl}/support?status=success`,
      cancel_url: `${siteUrl}/support?status=cancel`,
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[donate]', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
