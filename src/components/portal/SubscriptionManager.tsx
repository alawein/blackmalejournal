'use client';

import { useState } from 'react';
import { isTierUpgrade } from '@/lib/membership';
import type { MemberTier, PaidMemberTier } from '@/lib/supabase/types';
import { TierBadge } from '@/components/portal/TierBadge';
import { CheckoutButton } from '@/components/portal/CheckoutButton';

interface SubscriptionManagerProps {
  tier: MemberTier;
  hasSubscription: boolean;
  requestedTier?: PaidMemberTier;
  nextHref?: string;
}

export function SubscriptionManager({
  tier,
  hasSubscription,
  requestedTier,
  nextHref,
}: SubscriptionManagerProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [billingError, setBillingError] = useState('');

  async function handleManageBilling() {
    setLoadingPortal(true);
    setBillingError('');
    try {
      const res = await fetch('/api/stripe/manage-billing', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBillingError(data.error ?? 'Could not open billing portal. Please try again.');
      }
    } catch (err) {
      console.error('Billing portal error:', err);
      setBillingError('Could not open billing portal. Please try again.');
    } finally {
      setLoadingPortal(false);
    }
  }

  const upgradeTier: PaidMemberTier | null =
    requestedTier && isTierUpgrade(tier, requestedTier)
      ? requestedTier
      : tier === 'free'
        ? 'basic'
        : tier === 'basic'
          ? 'premium'
          : null;

  return (
    <div>
      <div className="flex items-center gap-4">
        <TierBadge tier={tier} />
        <span className="font-body text-sm text-bmj-cream/70">Current plan</span>
      </div>

      {hasSubscription && (
        <p className="mt-2 font-mono text-xs text-bmj-tan">
          Subscription active
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {upgradeTier && tier !== 'premium' && (
          <CheckoutButton
            tier={upgradeTier}
            returnTo={nextHref}
            className="bg-bmj-red px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {tier === 'free'
              ? `Start ${upgradeTier === 'basic' ? 'Basic' : 'Premium'} Membership`
              : 'Upgrade to Premium'}
          </CheckoutButton>
        )}

        {hasSubscription && (
          <button
            onClick={handleManageBilling}
            disabled={loadingPortal}
            className="border border-bmj-tan/30 px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white disabled:opacity-50"
          >
            {loadingPortal ? 'Loading…' : 'Manage Billing'}
          </button>
        )}
      </div>

      {billingError && (
        <p className="mt-3 font-body text-xs text-bmj-red">{billingError}</p>
      )}
    </div>
  );
}
