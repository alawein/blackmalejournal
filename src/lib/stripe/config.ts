import Stripe from 'stripe';

// Lazy singleton — avoids evaluating process.env at module load time,
// which would fail during `next build` when env vars may not be available.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}


export function getPriceIdForTier(tier: 'basic' | 'premium'): string {
  const prices: Record<'basic' | 'premium', string | undefined> = {
    basic: process.env.STRIPE_BASIC_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  };
  const id = prices[tier];
  if (!id) throw new Error(`Missing STRIPE_${tier.toUpperCase()}_PRICE_ID env var`);
  return id;
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  return secret;
}

export function getTierFromPriceId(priceId: string): 'basic' | 'premium' | null {
  const basic = process.env.STRIPE_BASIC_PRICE_ID;
  const premium = process.env.STRIPE_PREMIUM_PRICE_ID;
  if (priceId === basic) return 'basic';
  if (priceId === premium) return 'premium';
  return null;
}
