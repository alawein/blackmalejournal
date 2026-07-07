import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import type { AdminPipelineInsights } from '@/lib/admin-insights';
import { contentLabels } from './utils';

type EditorialPipelineSectionProps = {
  pipeline: AdminPipelineInsights;
};

export function EditorialPipelineSection({
  pipeline,
}: EditorialPipelineSectionProps) {
  return (
    <section className="surface-panel p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-section text-bmj-white">
            EDITORIAL PIPELINE
          </h2>
          <p className="mt-2 font-body text-sm text-bmj-text-muted">
            Status pressure across articles, briefings, dispatches, and handbooks.
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_ARTICLES}
          className="nav-link text-sm"
        >
          Manage Content
          <ArrowRight size={14} className="ml-2 inline" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard
          label="Draft"
          value={pipeline.statusCounts.draft}
          helper="Needs editorial movement"
          tone={pipeline.statusCounts.draft > 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Review"
          value={pipeline.statusCounts.review}
          helper="Ready for decision"
          tone={pipeline.statusCounts.review > 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Scheduled"
          value={pipeline.statusCounts.scheduled}
          helper="Queued for release"
          tone={pipeline.statusCounts.scheduled > 0 ? 'success' : 'default'}
        />
        <AdminMetricCard
          label="Published"
          value={pipeline.statusCounts.published}
          helper="Live editorial inventory"
          tone="default"
        />
      </div>

      <div className="mt-10">
        <h3 className="font-label text-micro uppercase tracking-label-xl text-bmj-tan">
          Stale Or Missed Items
        </h3>
        {pipeline.staleQueue.length === 0 ? (
          <p className="mt-4 border border-bmj-border-subtle bg-bmj-black/30 p-6 font-body text-sm text-bmj-text-muted">
            No stale drafts or missed scheduled items are visible right now.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {pipeline.staleQueue.map((item) => (
              <li
                key={item.id}
                className={`border border-l-[4px] p-6 hover-lift-sm hover:shadow-[var(--shadow-md)] ${
                  item.severity === 'critical'
                    ? 'border-bmj-red/30 border-l-bmj-red bg-bmj-red/10'
                    : 'border-bmj-amber/30 border-l-bmj-amber bg-bmj-amber/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-label text-micro uppercase tracking-label-xl text-bmj-tan">
                      {contentLabels[item.entity]}
                    </p>
                    <Link
                      href={item.href}
                      className="mt-3 block font-display text-xl uppercase tracking-display text-bmj-white transition-colors hover:text-bmj-red"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-2 font-typewriter text-xs text-bmj-text-muted">
                      {item.descriptor}
                    </p>
                    <p className="mt-3 font-body text-sm text-bmj-cream">
                      {item.reason}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-bmj-tan">
                    {item.ageInDays}d open
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
