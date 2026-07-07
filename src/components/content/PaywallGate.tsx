import Link from 'next/link';
import type { AccessTier } from '@/lib/supabase/types';
import { StarDivider } from '@/components/ui/StarDivider';
import { PATHS, withQuery } from '@/lib/paths';

interface PaywallGateProps {
  requiredTier: AccessTier;
  previewBody: string;
  isLoggedIn?: boolean;
  nextHref?: string;
}

export function PaywallGate({
  requiredTier,
  previewBody,
  isLoggedIn = false,
  nextHref,
}: PaywallGateProps) {
  const tierLabel = requiredTier === 'basic' ? 'Basic' : 'Premium';
  const ctaHref = isLoggedIn
    ? withQuery(PATHS.PORTAL_SETTINGS, {
        upgrade: requiredTier === 'free' ? undefined : requiredTier,
        next: nextHref,
      })
    : withQuery(PATHS.SIGNUP, {
        tier: requiredTier,
        next: nextHref,
      });

  return (
    <div>
      {/* Preview text — hard cutoff, no gradient fade */}
      <p className="font-body text-lg leading-article text-bmj-cream/90">
        {previewBody}
        <span aria-hidden="true">&hellip;</span>
      </p>

      {/* Editorial break — consistent with the site's section divider language */}
      <StarDivider className="my-8" />

      {/* CTA */}
      <div className="border border-bmj-red/40 bg-bmj-brown p-8 text-center">
        <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Members Only
        </p>
        <h3 className="mb-4 font-display text-2xl text-bmj-white">
          {isLoggedIn
            ? `Upgrade to ${tierLabel} to read this`
            : `This article is for ${tierLabel} members`}
        </h3>
        <p className="mb-6 font-body text-sm text-bmj-cream/70">
          {isLoggedIn
            ? `Your current plan doesn\u2019t include ${tierLabel.toLowerCase()} content. Upgrade to unlock.`
            : `Upgrade to read the full article and all ${tierLabel.toLowerCase()} content.`}
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={ctaHref}
            className="inline-block bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-85"
          >
            {isLoggedIn ? `Upgrade — ${tierLabel}` : `Subscribe — ${tierLabel}`}
          </Link>
          {!isLoggedIn && (
            <Link
              href={withQuery(PATHS.LOGIN, { next: nextHref })}
              className="font-body text-sm text-bmj-tan underline hover:text-bmj-cream"
            >
              Already a member? Log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
