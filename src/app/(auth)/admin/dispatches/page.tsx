import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminBulkActionForm } from '@/components/admin/AdminBulkActionForm';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import { AdminNotice } from '@/components/admin/AdminNotice';
import { PublishReadinessBadge } from '@/components/admin/PublishReadinessBadge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { AdminContentThumbnail } from '@/components/admin/AdminContentThumbnail';
import { ADMIN_BULK_STATUS_OPTIONS } from '@/lib/admin-bulk-actions';
import { ADMIN_CONTENT_STATUS_TABS, ADMIN_LENS_OPTIONS } from '@/lib/admin-list-filters';
import {
  assessDispatchReadiness,
  summarizePublishReadiness,
} from '@/lib/admin-publishing';
import { getLensTheme } from '@/lib/lens-theme';
import { PATHS, adminEditPath, withQuery } from '@/lib/paths';
import { getAllDispatches } from '@/lib/supabase/admin-queries';
import type { ContentStatus, Lens } from '@/lib/supabase/types';
import { bulkUpdateDispatchStatusAction } from './actions';

export const metadata: Metadata = {
  title: 'Dispatches — Admin',
  robots: { index: false, follow: false },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const VALID_STATUSES: ContentStatus[] = [
  'draft',
  'review',
  'scheduled',
  'published',
  'archived',
  'withdrawn',
];

interface DispatchesAdminPageProps {
  searchParams: Promise<{
    status?: string;
    lens?: string;
    q?: string;
    error?: string;
    success?: string;
  }>;
}

export default async function DispatchesAdminPage({
  searchParams,
}: DispatchesAdminPageProps) {
  const { status, lens, q, error, success } = await searchParams;

  const activeStatus = VALID_STATUSES.includes(status as ContentStatus)
    ? (status as ContentStatus)
    : undefined;
  const activeLens = ADMIN_LENS_OPTIONS.some((option) => option.value === lens)
    ? (lens as Lens)
    : undefined;

  const dispatches = await getAllDispatches({
    status: activeStatus,
    lens: activeLens,
    query: q,
  });
  const dispatchRows = dispatches.map((dispatch) => ({
    dispatch,
    readiness: assessDispatchReadiness(dispatch),
  }));
  const readinessSummary = summarizePublishReadiness(
    dispatchRows.map((row) => row.readiness),
  );

  const filterSummary = [
    activeStatus ? activeStatus : null,
    activeLens ? getLensTheme(activeLens).label : null,
    q?.trim() ? `Search: ${q.trim()}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const returnPath = withQuery(PATHS.ADMIN_DISPATCHES, {
    status: activeStatus,
    lens: activeLens,
    q: q?.trim() || undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-bmj-white">
            DISPATCHES
          </h1>
          <p className="mt-1 font-mono text-sm text-bmj-tan">
            {dispatches.length} {dispatches.length === 1 ? 'dispatch' : 'dispatches'}
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_DISPATCHES_NEW}
          className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Dispatch
        </Link>
      </div>

      {error ? (
        <AdminNotice title="Bulk Action Error" message={error} tone="error" />
      ) : null}
      {success ? (
        <AdminNotice title="Bulk Action Complete" message={success} tone="success" />
      ) : null}

      {filterSummary ? (
        <div className="mt-6 border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
            Active Filters
          </p>
          <p className="mt-2 font-body text-sm text-bmj-cream/80">
            {filterSummary}
          </p>
        </div>
      ) : null}

      <nav
        aria-label="Status filter"
        className="mt-6 flex flex-wrap gap-6 border-b border-bmj-tan/20"
      >
        {ADMIN_CONTENT_STATUS_TABS.map((tab) => {
          const isActive =
            activeStatus === tab.value ||
            (tab.value === undefined && activeStatus === undefined);
          return (
            <Link
              key={tab.label}
              href={withQuery(PATHS.ADMIN_DISPATCHES, {
                status: tab.value,
                lens: activeLens,
                q: q?.trim() || undefined,
              })}
              className={`pb-3 font-label text-xs uppercase tracking-widest transition-colors ${
                isActive
                  ? 'border-b-2 border-bmj-red text-bmj-white'
                  : 'text-bmj-tan hover:text-bmj-cream'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <form className="mt-6 grid grid-cols-1 gap-4 border border-bmj-tan/20 bg-bmj-brown p-4 lg:grid-cols-[1fr_240px_auto]">
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        <div>
          <label htmlFor="q" className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q ?? ''}
            placeholder="Search title, slug, or excerpt"
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="lens" className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
            Lens
          </label>
          <select
            id="lens"
            name="lens"
            defaultValue={activeLens ?? ''}
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
          >
            <option value="">All lenses</option>
            {ADMIN_LENS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Filter
          </button>
          <Link
            href={PATHS.ADMIN_DISPATCHES}
            className="border border-bmj-tan/30 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
          >
            Reset
          </Link>
        </div>
      </form>

      <section className="mt-6" aria-labelledby="publish-readiness-heading">
        <h2
          id="publish-readiness-heading"
          className="font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Publish Readiness
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminMetricCard
            label="Ready"
            value={readinessSummary.ready}
            helper="Ready to publish in current list"
            tone={readinessSummary.ready > 0 ? 'success' : 'default'}
          />
          <AdminMetricCard
            label="Review"
            value={readinessSummary.warning}
            helper="Needs a final editorial check"
            tone={readinessSummary.warning > 0 ? 'warning' : 'default'}
          />
          <AdminMetricCard
            label="Needs Work"
            value={readinessSummary.blocked}
            helper="Blocked by missing publish inputs"
            tone={readinessSummary.blocked > 0 ? 'critical' : 'default'}
          />
        </div>
      </section>

      <div className="mt-6">
        {dispatchRows.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No dispatches found. Create your first dispatch.
          </p>
        ) : (
          <AdminBulkActionForm
            action={bulkUpdateDispatchStatusAction}
            returnPath={returnPath}
            fieldName="bulk_status"
            fieldLabel="Bulk Status"
            fieldPlaceholder="Choose a status move"
            helper="Bulk moves help clear editorial queues quickly. Schedule dispatches one by one when publish timing must stay exact."
            itemLabel="dispatches"
            submitLabel="Apply to Selected Dispatches"
            options={ADMIN_BULK_STATUS_OPTIONS}
          >
            <ul>
              {dispatchRows.map(({ dispatch, readiness }) => (
                <li key={dispatch.id} className="border-b border-bmj-tan/10 py-4">
                  <div className="flex items-start gap-4">
                    <label className="mt-1 flex items-center">
                      <input
                        type="checkbox"
                        name="selected_ids"
                        value={dispatch.id}
                        data-bulk-item="true"
                        aria-label={`Select ${dispatch.title}`}
                        className="h-4 w-4 border border-bmj-tan/40 bg-bmj-black accent-bmj-red"
                      />
                    </label>
                    <AdminContentThumbnail
                      src={dispatch.cover_image}
                      alt={dispatch.title}
                      type="dispatch"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={dispatch.status} />
                        <PublishReadinessBadge readiness={readiness} />
                        <h2 className="truncate font-display text-lg text-bmj-white">
                          {dispatch.title}
                        </h2>
                      </div>
                      <p className="mt-1 font-mono text-xs text-bmj-tan">
                        {getLensTheme(dispatch.lens).label} &middot;{' '}
                        {formatDate(dispatch.created_at)}
                      </p>
                      {readiness.status !== 'ready' ? (
                        <p
                          className={`mt-2 font-body text-sm ${
                            readiness.status === 'blocked'
                              ? 'text-bmj-red/80'
                              : 'text-bmj-amber/80'
                          }`}
                        >
                          {readiness.summary}
                        </p>
                      ) : null}
                    </div>
                    <Link
                      href={adminEditPath('dispatches', dispatch.id)}
                      className="shrink-0 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-red"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </AdminBulkActionForm>
        )}
      </div>
    </div>
  );
}
