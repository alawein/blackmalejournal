import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/supabase/access';
import { getMemberById, getLatestArticles } from '@/lib/supabase/queries';
import { ButtonLink } from '@/components/ui/Button';
import { TierBadge } from '@/components/portal/TierBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { formatDate } from '@/lib/utils';
import { getBookmarkCount } from '@/lib/supabase/bookmarks';
import type { MemberTier } from '@/lib/supabase/types';
import { articlePath, normalizeInternalPath, PATHS } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Member Portal',
  description: 'Your member dashboard. View your access tier, latest content, and manage your subscription.',
  robots: { index: false, follow: false },
};

const TIER_ACCESS: Record<MemberTier, string[]> = {
  free: [
    'Public articles',
    'Briefing previews',
    'Video gallery',
    'Academy',
  ],
  basic: [
    'Everything in Free',
    'Full briefing archive',
    'Select handbooks',
    'Member resources',
  ],
  premium: [
    'Everything in Basic',
    'All handbooks',
    'Downloads',
    'Private content',
    'Early access',
  ],
};

interface PortalPageProps {
  searchParams: Promise<{ checkout?: string; next?: string }>;
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const params = await searchParams;
  const nextHref = normalizeInternalPath(params.next, '/portal');
  const user = await getAuthUser();

  if (!user) redirect(PATHS.LOGIN);

  const member = await getMemberById(user.id);
  const tier: MemberTier = member?.tier ?? 'free';
  const displayName =
    (user.user_metadata?.display_name as string) ||
    user.email?.split('@')[0] ||
    'Member';
  const memberSince = member?.created_at ?? user.created_at ?? '';

  const latestArticles = await getLatestArticles(5);
  const bookmarkCount = await getBookmarkCount(user.id);

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-10">
        <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
          Member Portal
        </p>
        <h1 className="mb-4 font-display text-4xl text-bmj-white sm:text-5xl">
          WELCOME BACK, {displayName.toUpperCase()}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <TierBadge tier={tier} />
          {memberSince && (
            <span className="font-mono text-xs text-bmj-tan">
              Member since {formatDate(memberSince)}
            </span>
          )}
        </div>
      </div>

      {params.checkout === 'success' && (
        <div className="mb-6 border border-bmj-amber/40 bg-bmj-amber/10 p-4">
          <p className="font-body text-sm text-bmj-amber">
            Welcome aboard. Your subscription is active.
          </p>
          {nextHref !== '/portal' && (
            <Link
              href={nextHref}
              className="mt-3 inline-flex font-label text-xs uppercase tracking-widest text-bmj-white underline underline-offset-4"
            >
              Continue to Requested Content
            </Link>
          )}
        </div>
      )}

      {params.checkout === 'cancelled' && (
        <div className="mb-6 border border-bmj-tan/30 bg-bmj-tan/5 p-4">
          <p className="font-body text-sm text-bmj-tan">
            Checkout was cancelled. No charges were made.
          </p>
          {nextHref !== '/portal' && (
            <Link
              href={nextHref}
              className="mt-3 inline-flex font-label text-xs uppercase tracking-widest text-bmj-cream underline underline-offset-4"
            >
              Return to Requested Content
            </Link>
          )}
        </div>
      )}

      <StarDivider />

      {/* Your Access */}
      <section className="py-10">
        <h2 className="mb-6 font-display text-2xl text-bmj-white">
          YOUR ACCESS
        </h2>
        <div className="border border-bmj-tan/20 bg-bmj-brown p-6">
          <ul className="space-y-2">
            {TIER_ACCESS[tier].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="text-bmj-red" aria-hidden="true">
                  ★
                </span>
                <span className="font-body text-sm text-bmj-cream">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Upgrade CTA */}
      {tier !== 'premium' && (
        <section className="mb-10 border border-bmj-red/30 bg-bmj-red/5 p-8 text-center">
          <h2 className="mb-2 font-display text-2xl text-bmj-white">
            UNLOCK MORE
          </h2>
          <p className="mb-4 font-body text-sm text-bmj-cream/70">
            {tier === 'free'
              ? 'Upgrade to Basic or Premium to access the full archive.'
              : 'Upgrade to Premium for complete access to everything.'}
          </p>
          <ButtonLink href={PATHS.PRICING} variant="primary">
            Upgrade Now
          </ButtonLink>
        </section>
      )}

      {/* Latest content */}
      <section className="py-10">
        <h2 className="mb-6 font-display text-2xl text-bmj-white">
          LATEST FOR YOU
        </h2>
        <div className="space-y-4">
          {latestArticles.map((article) => (
            <Link
              key={article.id}
              href={articlePath(article.slug)}
              className="block border-l-4 border-bmj-red bg-bmj-brown p-4 no-underline transition-colors hover:bg-bmj-brown/80"
            >
              <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                {article.lens}
              </p>
              <h3 className="font-display text-xl text-bmj-white">
                {article.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-bmj-tan">
                {formatDate(article.published_at)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <StarDivider />

      {/* Quick links */}
      <div className="flex flex-wrap gap-4 py-10">
        <ButtonLink href={PATHS.PORTAL_BOOKMARKS} variant="ghost">
          Saved{bookmarkCount > 0 ? ` (${bookmarkCount})` : ''}
        </ButtonLink>
        <ButtonLink href={PATHS.PORTAL_SETTINGS} variant="ghost">
          Settings
        </ButtonLink>
        <ButtonLink href={PATHS.BRIEFINGS} variant="ghost">
          Briefings
        </ButtonLink>
        <ButtonLink href={PATHS.ACADEMY} variant="ghost">
          Academy
        </ButtonLink>
        <ButtonLink href={PATHS.HANDBOOKS} variant="ghost">
          Handbooks
        </ButtonLink>
        <ButtonLink href={PATHS.DOWNLOADS} variant="ghost">
          Downloads
        </ButtonLink>
      </div>
    </div>
  );
}
