import { AdminMetricCard } from '@/components/admin/AdminMetricCard';

type ContentCard = {
  label: string;
  total: number;
  detail: string;
  href: string;
};

type AdminCoverageSectionProps = {
  contentCards: readonly ContentCard[];
};

export function AdminCoverageSection({ contentCards }: AdminCoverageSectionProps) {
  return (
    <section aria-labelledby="coverage-heading">
      <h2
        id="coverage-heading"
        className="font-label text-micro uppercase tracking-label-xl text-bmj-tan"
      >
        Admin Coverage
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contentCards.map((card) => (
          <AdminMetricCard
            key={card.label}
            label={card.label}
            value={card.total}
            helper={card.detail}
            href={card.href}
          />
        ))}
      </div>
    </section>
  );
}
