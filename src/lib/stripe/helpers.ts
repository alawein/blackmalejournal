import { getStripe, getPriceIdForTier } from '@/lib/stripe/config';
import { normalizeInternalPath, withQuery } from '@/lib/paths';
import { resolveSiteUrl } from '@/lib/site-url';

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: 'basic' | 'premium',
  returnTo?: string,
): Promise<string> {
  const siteUrl = resolveSiteUrl();
  const nextHref = normalizeInternalPath(returnTo, '/portal');
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer_email: userEmail,
    line_items: [
      {
        price: getPriceIdForTier(tier),
        quantity: 1,
      },
    ],
    metadata: { userId, tier },
    success_url: withQuery(`${siteUrl}/portal`, {
      checkout: 'success',
      next: nextHref !== '/portal' ? nextHref : undefined,
    }),
    cancel_url: withQuery(`${siteUrl}/portal`, {
      checkout: 'cancelled',
      next: nextHref !== '/portal' ? nextHref : undefined,
    }),
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return session.url;
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
): Promise<string> {
  const siteUrl = resolveSiteUrl();
  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${siteUrl}/portal/settings`,
  });

  return session.url;
}
