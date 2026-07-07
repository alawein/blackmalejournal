import type { AdminMemberInsights, AdminSubscriberInsights } from '@/lib/admin-insights';

type AudienceBillingSectionProps = {
  members: AdminMemberInsights;
  subscribers: AdminSubscriberInsights;
};

export function AudienceBillingSection({
  members,
  subscribers,
}: AudienceBillingSectionProps) {
  return (
    <section className="surface-panel p-8">
      <h2 className="font-display text-2xl uppercase tracking-section text-bmj-white">
        AUDIENCE AND BILLING
      </h2>
      <div className="mt-8 space-y-6">
        <div className="border border-bmj-border-subtle bg-bmj-black/30 p-5">
          <p className="font-label text-micro uppercase tracking-label-xl text-bmj-tan">
            Member Health
          </p>
          <p className="mt-3 font-body text-sm leading-relaxed text-bmj-cream">
            {members.basic} basic and {members.premium} premium members are
            currently active. {members.billingExceptions} paying members need
            Stripe reference review.
          </p>
        </div>
        <div className="border border-bmj-border-subtle bg-bmj-black/30 p-5">
          <p className="font-label text-micro uppercase tracking-label-xl text-bmj-tan">
            Audience Motion
          </p>
          <p className="mt-3 font-body text-sm leading-relaxed text-bmj-cream">
            {subscribers.newPast30Days} new subscribers and {subscribers.churnPast30Days}{' '}
            unsubscribes were recorded in the last 30 days.
          </p>
        </div>
      </div>
    </section>
  );
}
