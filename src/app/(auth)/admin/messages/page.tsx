import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  getAllContactSubmissions,
  getContactSubmissionCounts,
  getMessageAdminInsights,
} from '@/lib/supabase/admin-queries';
import type { ContactSubmissionStatus } from '@/lib/supabase/types';
import { updateContactSubmissionAction } from './actions';
import { PATHS, withQuery } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Messages — Admin',
  robots: { index: false, follow: false },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getAgeInDays(iso: string): number {
  const delta = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(delta / (1000 * 60 * 60 * 24)));
}

const STATUS_TABS: { label: string; value: ContactSubmissionStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'New', value: 'new' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Spam', value: 'spam' },
];

interface MessagesAdminPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    error?: string;
    message?: string;
  }>;
}

export default async function MessagesAdminPage({ searchParams }: MessagesAdminPageProps) {
  const { status, q, error, message } = await searchParams;
  const activeStatus = STATUS_TABS.some((tab) => tab.value === status)
    ? (status as ContactSubmissionStatus | undefined)
    : undefined;
  const [submissions, counts, insights] = await Promise.all([
    getAllContactSubmissions({ status: activeStatus, query: q }),
    getContactSubmissionCounts(),
    getMessageAdminInsights(),
  ]);
  const returnTo = withQuery(PATHS.ADMIN_MESSAGES, {
    status: activeStatus,
    q: q || undefined,
  });

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl tracking-widest text-bmj-white">
          MESSAGES
        </h1>
        <p className="mt-1 font-mono text-sm text-bmj-tan">
          {submissions.length} {submissions.length === 1 ? 'message' : 'messages'}
        </p>
      </div>

      {error && (
        <div className="mt-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
          <p className="font-body text-sm text-bmj-red">{error}</p>
        </div>
      )}

      {message && (
        <div className="mt-6 border border-bmj-amber/40 bg-bmj-amber/10 p-4">
          <p className="font-body text-sm text-bmj-amber">{message}</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Unresolved"
          value={insights.unresolvedCount}
          helper={`${insights.newCount} new · ${insights.inProgressCount} in progress`}
          tone={insights.overdueCount > 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Overdue"
          value={insights.overdueCount}
          helper="Messages older than 3 days and still unresolved"
          tone={insights.overdueCount > 0 ? 'critical' : 'default'}
        />
        <AdminMetricCard
          label="Resolved"
          value={insights.resolvedCount}
          helper="Handled and closed"
          tone="success"
        />
        <AdminMetricCard
          label="Spam"
          value={insights.spamCount}
          helper="Junk or low-signal submissions"
        />
      </div>

      {insights.overdueCount > 0 && (
        <div className="mt-6 border border-bmj-red/30 bg-bmj-red/10 p-4">
          <p className="font-label text-xs uppercase tracking-widest text-bmj-red">
            Backlog Pressure
          </p>
          <p className="mt-2 font-body text-sm text-bmj-cream/80">
            {insights.overdueCount} unresolved messages are older than 3 days.
            Handle the oldest queue items first to keep response latency under
            control.
          </p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-micro uppercase tracking-widest text-bmj-tan">Total</p>
          <p className="mt-2 font-mono text-2xl text-bmj-white">{counts.total}</p>
        </div>
        <div className="border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-micro uppercase tracking-widest text-bmj-tan">New</p>
          <p className="mt-2 font-mono text-2xl text-bmj-white">{counts.new}</p>
        </div>
        <div className="border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-micro uppercase tracking-widest text-bmj-tan">In Progress</p>
          <p className="mt-2 font-mono text-2xl text-bmj-white">{counts.in_progress}</p>
        </div>
        <div className="border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-micro uppercase tracking-widest text-bmj-tan">Resolved</p>
          <p className="mt-2 font-mono text-2xl text-bmj-white">{counts.resolved}</p>
        </div>
        <div className="border border-bmj-tan/20 bg-bmj-brown p-4">
          <p className="font-label text-micro uppercase tracking-widest text-bmj-tan">Spam</p>
          <p className="mt-2 font-mono text-2xl text-bmj-white">{counts.spam}</p>
        </div>
      </div>

      <nav
        aria-label="Message filter"
        className="mt-6 flex flex-wrap gap-6 border-b border-bmj-tan/20"
      >
        {STATUS_TABS.map((tab) => {
          const href = withQuery(PATHS.ADMIN_MESSAGES, {
            status: tab.value,
            q: q || undefined,
          });
          const isActive =
            activeStatus === tab.value || (!tab.value && activeStatus === undefined);
          return (
            <Link
              key={tab.label}
              href={href}
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
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search name, email, subject, or notes"
          className="min-w-0 flex-1 border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
        />
        <button
          type="submit"
          className="bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="mt-6">
        {submissions.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No messages yet.
          </p>
        ) : (
          <ul>
            {submissions.map((submission) => {
              const ageInDays = getAgeInDays(submission.submitted_at);
              const isOverdue =
                (submission.status === 'new' || submission.status === 'in_progress') &&
                ageInDays >= 3;

              return (
                <li
                  key={submission.id}
                  className={`border-b py-5 ${
                    isOverdue ? 'border-bmj-red/20' : 'border-bmj-tan/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="font-display text-sm tracking-widest text-bmj-white">
                          {submission.name}
                        </span>
                        <span className="font-mono text-xs text-bmj-tan">
                          {submission.email}
                        </span>
                      </div>
                      {submission.subject && (
                        <p className="mt-1 font-label text-xs uppercase tracking-widest text-bmj-cream/80">
                          {submission.subject}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <StatusBadge status={submission.status} />
                        {submission.handled_at && (
                          <span className="font-mono text-stamp text-bmj-tan">
                            Updated {formatDate(submission.handled_at)}
                          </span>
                        )}
                        {(submission.status === 'new' || submission.status === 'in_progress') && (
                          <span
                            className={`font-mono text-stamp ${
                              isOverdue ? 'text-bmj-red' : 'text-bmj-tan'
                            }`}
                          >
                            {ageInDays}d open
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-body text-sm text-bmj-cream/70">
                        {submission.message.length > 100
                          ? submission.message.slice(0, 100) + '…'
                          : submission.message}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-bmj-tan">
                      {formatDate(submission.submitted_at)}
                    </span>
                  </div>

                  <form action={updateContactSubmissionAction} className="mt-4 grid grid-cols-1 gap-4 border border-bmj-tan/20 bg-bmj-brown/60 p-4 lg:grid-cols-[220px_1fr_auto]">
                    <input type="hidden" name="id" value={submission.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <div>
                      <label htmlFor={`status-${submission.id}`} className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
                        Status
                      </label>
                      <select
                        id={`status-${submission.id}`}
                        name="status"
                        defaultValue={submission.status}
                        className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="spam">Spam</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`notes-${submission.id}`} className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
                        Internal Notes
                      </label>
                      <textarea
                        id={`notes-${submission.id}`}
                        name="internal_notes"
                        rows={3}
                        defaultValue={submission.internal_notes ?? ''}
                        className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
                        placeholder="Add handling notes for the Chairman or editor desk"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
