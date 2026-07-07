import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import {
  getAllSubscribers,
  getSubscriberAdminInsights,
  getSubscriberCounts,
} from '@/lib/supabase/admin-queries';
import { PATHS, withQuery } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Subscribers — Admin',
  robots: { index: false, follow: false },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const FILTER_TABS = [
  { label: 'All', value: undefined },
  { label: 'Active', value: 'active' },
  { label: 'Unsubscribed', value: 'unsubscribed' },
] as const;

interface SubscribersAdminPageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function SubscribersAdminPage({
  searchParams,
}: SubscribersAdminPageProps) {
  const { filter, q } = await searchParams;

  const activeFilter =
    filter === 'active' ? true : filter === 'unsubscribed' ? false : undefined;

  const [subscribers, counts, insights] = await Promise.all([
    getAllSubscribers({
      active: activeFilter,
      query: q,
    }),
    getSubscriberCounts(),
    getSubscriberAdminInsights(),
  ]);

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl tracking-widest text-bmj-white">
          SUBSCRIBERS
        </h1>
        <p className="mt-1 font-mono text-sm text-bmj-tan">
          {subscribers.length} {subscribers.length === 1 ? 'subscriber' : 'subscribers'}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Active Base"
          value={insights.active}
          helper={`${insights.total} total recorded subscribers`}
          tone="success"
        />
        <AdminMetricCard
          label="Net 30d"
          value={`${insights.netPast30Days >= 0 ? '+' : ''}${insights.netPast30Days}`}
          helper={`${insights.newPast30Days} new · ${insights.churnPast30Days} churn`}
          tone={insights.netPast30Days < 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Churn 30d"
          value={insights.churnPast30Days}
          helper="Recent unsubscribe count"
          tone={insights.churnPast30Days > 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Unsubscribed"
          value={insights.unsubscribed}
          helper="Inactive records retained for ops history"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
          <h2 className="font-display text-xl tracking-widest text-bmj-white">
            GROWTH SNAPSHOT
          </h2>
          <p className="mt-2 font-body text-sm text-bmj-cream/80">
            BMJ added {insights.newPast30Days} subscribers and lost {insights.churnPast30Days}{' '}
            over the last 30 days, for a net movement of{' '}
            {insights.netPast30Days >= 0 ? '+' : ''}
            {insights.netPast30Days}.
          </p>
        </section>

        <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl tracking-widest text-bmj-white">
              TOP SOURCES
            </h2>
            <span className="font-label text-xs uppercase tracking-widest text-bmj-tan">
              Active audience
            </span>
          </div>
          {insights.topSources.length === 0 ? (
            <p className="mt-4 font-body text-sm text-bmj-cream/70">
              Source data is not available yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {insights.topSources.map((source) => (
                <li
                  key={source.source}
                  className="flex items-center justify-between border border-bmj-tan/20 bg-bmj-black/25 px-4 py-3"
                >
                  <span className="font-mono text-sm text-bmj-cream">
                    {source.source}
                  </span>
                  <span className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                    {source.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-micro uppercase tracking-widest text-bmj-tan">Total</p>
          <p className="mt-2 font-mono text-2xl text-bmj-white">{counts.total}</p>
        </div>
        <div className="border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-micro uppercase tracking-widest text-bmj-tan">Active</p>
          <p className="mt-2 font-mono text-2xl text-bmj-white">{counts.active}</p>
        </div>
        <div className="border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-micro uppercase tracking-widest text-bmj-tan">Unsubscribed</p>
          <p className="mt-2 font-mono text-2xl text-bmj-white">{counts.unsubscribed}</p>
        </div>
      </div>

      <nav
        aria-label="Subscriber filter"
        className="mt-6 flex gap-6 border-b border-bmj-tan/20"
      >
        {FILTER_TABS.map((tab) => {
          const isActive =
            filter === tab.value ||
            (tab.value === undefined && filter === undefined);
          return (
            <Link
              key={tab.label}
              href={withQuery(PATHS.ADMIN_SUBSCRIBERS, {
                filter: tab.value,
                q: q || undefined,
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

      <div className="mt-6 flex flex-col gap-4 border border-bmj-tan/20 bg-bmj-brown p-4 lg:flex-row lg:items-end">
        <form className="flex min-w-0 flex-1 gap-3">
          {filter && <input type="hidden" name="filter" value={filter} />}
          <div className="min-w-0 flex-1">
            <label htmlFor="q" className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="text"
              defaultValue={q ?? ''}
              placeholder="Search email or source"
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="self-end bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </form>

        <div className="flex gap-3">
          <Link
            href={withQuery('/api/admin/subscribers/export', {
              filter,
              q: q || undefined,
            })}
            className="inline-flex items-center justify-center border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
          >
            Export CSV
          </Link>
          <Link
            href={PATHS.ADMIN_SUBSCRIBERS}
            className="inline-flex items-center justify-center border border-bmj-tan/20 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:border-bmj-red hover:text-bmj-white"
          >
            Reset
          </Link>
        </div>
      </div>

      <div className="mt-6">
        {subscribers.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No subscribers yet.
          </p>
        ) : (
          <ul>
            {subscribers.map((subscriber) => (
              <li
                key={subscriber.id}
                className="flex items-center justify-between border-b border-bmj-tan/10 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-bmj-cream">
                    {subscriber.email}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    {subscriber.source && (
                      <span className="font-mono text-xs text-bmj-tan/50">
                        {subscriber.source}
                      </span>
                    )}
                    <span className="font-mono text-xs text-bmj-tan">
                      Subscribed {formatDate(subscriber.subscribed_at)}
                    </span>
                    {subscriber.unsubscribed_at && (
                      <span className="font-mono text-xs text-bmj-red">
                        Unsubscribed {formatDate(subscriber.unsubscribed_at)}
                      </span>
                    )}
                  </div>
                </div>
                {subscriber.unsubscribed_at && (
                  <span className="ml-4 shrink-0 px-2 py-0.5 font-label text-micro uppercase tracking-widest text-bmj-red">
                    Unsubscribed
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
