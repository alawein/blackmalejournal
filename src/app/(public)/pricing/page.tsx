import type { Metadata } from 'next';
import { compareTiers, includesTier } from '@/lib/membership';
import { getAuthUser } from '@/lib/supabase/access';
import { getMemberById } from '@/lib/supabase/queries';
import { BrandMark } from '@/components/brand/BrandMark';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { PATHS, withQuery } from '@/lib/paths';
import type { MemberTier } from '@/lib/supabase/types';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Choose the membership tier that matches your access needs at The Black Male Journal.',
};

function formatTierLabel(tier: MemberTier) {
  return tier === 'free' ? 'Free' : tier === 'basic' ? 'Basic' : 'Premium';
}

const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    price: '$0',
    accentClass: 'border-t-bmj-tan',
    accentTextClass: 'text-bmj-tan',
    description: 'Start with the public archive and open academy material.',
    features: [
      'Public articles',
      'Briefing previews',
      'Video gallery',
      'Open academy access',
    ],
  },
  {
    id: 'basic',
    name: 'BASIC',
    price: '$9',
    accentClass: 'border-t-bmj-amber',
    accentTextClass: 'text-bmj-amber',
    description: 'Unlock the Weekend Briefing archive and member resources.',
    features: [
      'Everything in Free',
      'Full Weekend Briefing archive',
      'Select handbooks',
      'Member-only resource access',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '$19',
    accentClass: 'border-t-bmj-red',
    accentTextClass: 'text-bmj-red',
    description: 'Full access to every handbook, download, and private release.',
    features: [
      'Everything in Basic',
      'All handbooks and downloads',
      'Private content',
      'Early access to new releases',
    ],
  },
] as const;

interface PricingPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const { next } = await searchParams;
  const user = await getAuthUser();
  const member = user ? await getMemberById(user.id) : null;

  return (
    <div className="page-shell py-16">
      <PageHeader
        label="Membership"
        title="CHOOSE YOUR ACCESS"
        icon={<BrandMark size={32} color="var(--bmj-red)" />}
        description="BMJ is built as an archive, briefing organ, and disciplined learning platform. Choose the level of access that matches how deeply you want to enter the work."
        dividerClassName="my-8"
      />

      <ScrollReveal as="div" delay={0.1}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const memberTier = member?.tier;
          const isCurrentPlan = memberTier === plan.id;
          const isIncludedPlan = memberTier
            ? compareTiers(memberTier, plan.id) > 0
            : false;
          const canChoosePlan = !memberTier || !includesTier(memberTier, plan.id);
          const href = user
            ? withQuery(PATHS.PORTAL_SETTINGS, {
                upgrade: plan.id === 'free' ? undefined : plan.id,
                next,
              })
            : withQuery(PATHS.SIGNUP, {
                tier: plan.id === 'free' ? undefined : plan.id,
                next,
              });
          const ctaLabel = isCurrentPlan
            ? 'Current Plan'
            : isIncludedPlan && memberTier
              ? `Included in ${formatTierLabel(memberTier)}`
              : user
                ? `Choose ${plan.name}`
                : plan.id === 'free'
                  ? 'Create Free Account'
                  : `Join ${plan.name}`;

          return (
            <section
              key={plan.id}
              className={`card-offer h-full p-8 ${plan.accentClass}`}
            >
              <p className="meta-stamp">Monthly Membership</p>
              <p className="mt-5 font-display text-3xl text-bmj-white">{plan.name}</p>
              <p className={`mt-2 font-display text-5xl ${plan.accentTextClass}`}>{plan.price}</p>
              <p className="mt-3 font-body text-sm leading-relaxed text-bmj-cream/75">
                {plan.description}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className={plan.accentTextClass} aria-hidden="true">
                      ★
                    </span>
                    <span className="font-body text-sm text-bmj-cream/85">{feature}</span>
                  </li>
                ))}
              </ul>

              {canChoosePlan ? (
                <ButtonLink
                  href={href}
                  variant={plan.id === 'premium' ? 'primary' : 'ghost'}
                  className="mt-8"
                >
                  {ctaLabel}
                </ButtonLink>
              ) : (
                <span className="mt-8 inline-flex items-center justify-center border border-bmj-tan/40 px-6 py-3 font-label text-xs uppercase tracking-label text-bmj-tan">
                  {ctaLabel}
                </span>
              )}
            </section>
          );
        })}
      </div>
      </ScrollReveal>

      <ScrollReveal as="div" delay={0.15}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="paper-texture surface-panel p-8">
          <h2 className="relative z-10 font-display text-2xl text-bmj-white">WHAT YOU ARE FUNDING</h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-bmj-cream/80">
            Membership supports independent editorial work, member resources, and the
            continued buildout of BMJ&apos;s archive, briefings, academy, and private
            releases.
          </p>
        </section>

        <section className="paper-texture surface-panel p-8">
          <h2 className="relative z-10 font-display text-2xl text-bmj-white">FREQUENT QUESTIONS</h2>
          <div className="mt-4 space-y-4 font-body text-sm leading-relaxed text-bmj-cream/80">
            <p>
              <span className="font-label uppercase tracking-widest text-bmj-tan">
                Billing
              </span>{' '}
              Paid plans renew monthly and can be managed from the member portal.
            </p>
            <p>
              <span className="font-label uppercase tracking-widest text-bmj-tan">
                Upgrades
              </span>{' '}
              Moving from Basic to Premium happens inside the portal so members keep a
              single account and a single billing history.
            </p>
            <p>
              <span className="font-label uppercase tracking-widest text-bmj-tan">
                Access
              </span>{' '}
              Content marked Basic or Premium stays gated until the member tier is
              confirmed.
            </p>
          </div>
        </section>
      </div>
      </ScrollReveal>
    </div>
  );
}
