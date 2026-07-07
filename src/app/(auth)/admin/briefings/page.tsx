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
import { ADMIN_CONTENT_STATUS_TABS } from '@/lib/admin-list-filters';
import {
  assessBriefingReadiness,
  summarizePublishReadiness,
} from '@/lib/admin-publishing';
import { getAllBriefings } from '@/lib/supabase/admin-queries';
import { PATHS, adminEditPath, withQuery } from '@/lib/paths';
import type { ContentStatus } from '@/lib/supabase/types';
import { bulkUpdateBriefingStatusAction } from './actions';

export const metadata: Metadata = {
  title: 'Briefings — Admin',
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

interface BriefingsAdminPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    error?: string;
    success?: string;
  }>;
}

export default async function BriefingsAdminPage({
  searchParams,
}: BriefingsAdminPageProps) {
  const { status, q, error, success } = await searchParams;

  const activeStatus = VALID_STATUSES.includes(status as ContentStatus)
    ? (status as ContentStatus)
    : undefined;

  const briefings = await getAllBriefings({
    status: activeStatus,
    query: q,
  });
  const briefingRows = briefings.map((briefing) => ({
    briefing,
    readiness: assessBriefingReadiness(briefing),
  }));
  const readinessSummary = summarizePublishReadiness(
    briefingRows.map((row) => row.readiness),
  );
  const returnPath = withQuery(PATHS.ADMIN_BRIEFINGS, {
    status: activeStatus,
    q: q?.trim() || undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-bmj-white">
            BRIEFINGS
          </h1>
          <p className="mt-1 font-mono text-sm text-bmj-tan">
            {briefings.length} {briefings.length === 1 ? 'briefing' : 'briefings'}
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_BRIEFINGS_NEW}
          className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Briefing
        </Link>
      </div>

      {error ? (
        <AdminNotice title="Bulk Action Error" message={error} tone="error" />
      ) : null}
      {success ? (
        <AdminNotice title="Bulk Action Complete" message={success} tone="success" />
      ) : null}

      {q?.trim() ? (
        <div className="mt-6 border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
            Active Search
          </p>
          <p className="mt-2 font-body text-sm text-bmj-cream/80">
            Search: {q.trim()}
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
              href={withQuery(PATHS.ADMIN_BRIEFINGS, {
                status: tab.value,
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

      <form className="mt-6 flex gap-3 border border-bmj-tan/20 bg-bmj-brown p-4">
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        <input
          id="q"
          name="q"
          type="text"
          defaultValue={q ?? ''}
          placeholder="Search title, slug, or issue number"
          className="min-w-0 flex-1 border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
        />
        <button
          type="submit"
          className="bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          Search
        </button>
        <Link
          href={PATHS.ADMIN_BRIEFINGS}
          className="border border-bmj-tan/30 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Reset
        </Link>
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
        {briefingRows.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No briefings found. Create your first briefing.
          </p>
        ) : (
          <AdminBulkActionForm
            action={bulkUpdateBriefingStatusAction}
            returnPath={returnPath}
            fieldName="bulk_status"
            fieldLabel="Bulk Status"
            fieldPlaceholder="Choose a status move"
            helper="Bulk moves do not schedule issues. Set Publish At (UTC) on each issue before using scheduled delivery."
            itemLabel="briefings"
            submitLabel="Apply to Selected Briefings"
            options={ADMIN_BULK_STATUS_OPTIONS}
          >
            <ul>
              {briefingRows.map(({ briefing, readiness }) => (
                <li key={briefing.id} className="border-b border-bmj-tan/10 py-4">
                  <div className="flex items-start gap-4">
                    <label className="mt-1 flex items-center">
                      <input
                        type="checkbox"
                        name="selected_ids"
                        value={briefing.id}
                        data-bulk-item="true"
                        aria-label={`Select ${briefing.title}`}
                        className="h-4 w-4 border border-bmj-tan/40 bg-bmj-black accent-bmj-red"
                      />
                    </label>
                    <AdminContentThumbnail
                      src={briefing.cover_image}
                      alt={briefing.title}
                      type="briefing"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={briefing.status} />
                        <PublishReadinessBadge readiness={readiness} />
                        <h2 className="truncate font-display text-lg text-bmj-white">
                          {briefing.title}
                        </h2>
                      </div>
                      <p className="mt-1 font-mono text-xs text-bmj-tan">
                        #{briefing.issue_number} &middot; {briefing.access_tier} &middot;{' '}
                        {formatDate(briefing.created_at)}
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
                      href={adminEditPath('briefings', briefing.id)}
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
