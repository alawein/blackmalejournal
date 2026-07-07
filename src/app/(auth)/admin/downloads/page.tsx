import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminBulkActionForm } from '@/components/admin/AdminBulkActionForm';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import { AdminNotice } from '@/components/admin/AdminNotice';
import { PublishReadinessBadge } from '@/components/admin/PublishReadinessBadge';
import { AdminContentThumbnail } from '@/components/admin/AdminContentThumbnail';
import { ADMIN_BULK_DOWNLOAD_TIER_OPTIONS } from '@/lib/admin-bulk-actions';
import {
  assessDownloadReadiness,
  summarizePublishReadiness,
} from '@/lib/admin-publishing';
import { getAllDownloads } from '@/lib/supabase/admin-queries';
import { PATHS, adminEditPath, withQuery } from '@/lib/paths';
import type { AccessTier } from '@/lib/supabase/types';
import { bulkUpdateDownloadAccessTierAction } from './actions';

export const metadata: Metadata = {
  title: 'Downloads — Admin',
  robots: { index: false, follow: false },
};

const tierStyles: Record<AccessTier, string> = {
  free: 'bg-bmj-tan/20 text-bmj-tan',
  basic: 'bg-bmj-amber/20 text-bmj-amber',
  premium: 'bg-bmj-red/20 text-bmj-red',
};

function TierBadge({ tier }: { tier: AccessTier }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-label text-micro uppercase tracking-widest ${tierStyles[tier]}`}
    >
      {tier}
    </span>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const CATEGORY_TABS: { label: string; value: string | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Template', value: 'template' },
  { label: 'Worksheet', value: 'worksheet' },
  { label: 'Handbook', value: 'handbook' },
];

const TIER_FILTERS: Array<{ label: string; value: AccessTier | undefined }> = [
  { label: 'All tiers', value: undefined },
  { label: 'Free', value: 'free' },
  { label: 'Basic', value: 'basic' },
  { label: 'Premium', value: 'premium' },
];

interface DownloadsAdminPageProps {
  searchParams: Promise<{
    category?: string;
    tier?: string;
    q?: string;
    error?: string;
    success?: string;
  }>;
}

export default async function DownloadsAdminPage({
  searchParams,
}: DownloadsAdminPageProps) {
  const { category, tier, q, error, success } = await searchParams;

  const activeCategory = category?.trim() || undefined;
  const activeTier = TIER_FILTERS.some((filter) => filter.value === tier)
    ? (tier as AccessTier | undefined)
    : undefined;

  const downloads = await getAllDownloads({
    category: activeCategory,
    accessTier: activeTier,
    query: q,
  });
  const downloadRows = downloads.map((download) => ({
    download,
    readiness: assessDownloadReadiness(download),
  }));
  const readinessSummary = summarizePublishReadiness(
    downloadRows.map((row) => row.readiness),
  );

  const filterSummary = [
    activeCategory ? activeCategory : null,
    activeTier ? activeTier : null,
    q?.trim() ? `Search: ${q.trim()}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const returnPath = withQuery(PATHS.ADMIN_DOWNLOADS, {
    category: activeCategory,
    tier: activeTier,
    q: q?.trim() || undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-bmj-white">
            DOWNLOADS
          </h1>
          <p className="mt-1 font-mono text-sm text-bmj-tan">
            {downloads.length} {downloads.length === 1 ? 'download' : 'downloads'}
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_DOWNLOADS_NEW}
          className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Download
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
        aria-label="Category filter"
        className="mt-6 flex flex-wrap gap-6 border-b border-bmj-tan/20"
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive =
            activeCategory === tab.value ||
            (tab.value === undefined && activeCategory === undefined);
          return (
            <Link
              key={tab.label}
              href={withQuery(PATHS.ADMIN_DOWNLOADS, {
                category: tab.value,
                tier: activeTier,
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

      <form className="mt-6 grid grid-cols-1 gap-4 border border-bmj-tan/20 bg-bmj-brown p-4 lg:grid-cols-[1fr_220px_auto]">
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
        <div>
          <label htmlFor="q" className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q ?? ''}
            placeholder="Search title, slug, description, or file type"
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="tier" className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
            Access Tier
          </label>
          <select
            id="tier"
            name="tier"
            defaultValue={activeTier ?? ''}
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
          >
            {TIER_FILTERS.map((filter) => (
              <option key={filter.label} value={filter.value ?? ''}>
                {filter.label}
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
            href={PATHS.ADMIN_DOWNLOADS}
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
            helper="Ready to ship in current list"
            tone={readinessSummary.ready > 0 ? 'success' : 'default'}
          />
          <AdminMetricCard
            label="Review"
            value={readinessSummary.warning}
            helper="Needs a final asset check"
            tone={readinessSummary.warning > 0 ? 'warning' : 'default'}
          />
          <AdminMetricCard
            label="Needs Work"
            value={readinessSummary.blocked}
            helper="Blocked by missing file metadata"
            tone={readinessSummary.blocked > 0 ? 'critical' : 'default'}
          />
        </div>
      </section>

      <div className="mt-6">
        {downloadRows.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No downloads found. Create your first download.
          </p>
        ) : (
          <AdminBulkActionForm
            action={bulkUpdateDownloadAccessTierAction}
            returnPath={returnPath}
            fieldName="bulk_access_tier"
            fieldLabel="Bulk Access Tier"
            fieldPlaceholder="Choose an access tier"
            helper="Bulk tier changes update access control only. Category, file metadata, and release timing remain item-specific."
            itemLabel="downloads"
            submitLabel="Apply to Selected Downloads"
            options={ADMIN_BULK_DOWNLOAD_TIER_OPTIONS}
          >
            <ul>
              {downloadRows.map(({ download, readiness }) => (
                <li key={download.id} className="border-b border-bmj-tan/10 py-4">
                  <div className="flex items-start gap-4">
                    <label className="mt-1 flex items-center">
                      <input
                        type="checkbox"
                        name="selected_ids"
                        value={download.id}
                        data-bulk-item="true"
                        aria-label={`Select ${download.title}`}
                        className="h-4 w-4 border border-bmj-tan/40 bg-bmj-black accent-bmj-red"
                      />
                    </label>
                    <AdminContentThumbnail
                      src={download.cover_image}
                      alt={download.title}
                      type="download"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <TierBadge tier={download.access_tier} />
                        <PublishReadinessBadge readiness={readiness} />
                        <h2 className="truncate font-display text-lg text-bmj-white">
                          {download.title}
                        </h2>
                      </div>
                      <p className="mt-1 font-mono text-xs text-bmj-tan">
                        {download.category} &middot;{' '}
                        {download.file_type.toUpperCase()} &middot;{' '}
                        {formatFileSize(download.file_size)} &middot;{' '}
                        {formatDate(download.created_at)}
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
                      href={adminEditPath('downloads', download.id)}
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
