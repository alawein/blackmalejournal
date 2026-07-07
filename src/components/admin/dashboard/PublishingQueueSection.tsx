import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import type { AdminQueueItem } from '@/lib/admin-insights';
import { contentLabels, formatDate } from './utils';

type PublishingQueueSectionProps = {
  scheduledQueue: AdminQueueItem[];
};

export function PublishingQueueSection({
  scheduledQueue,
}: PublishingQueueSectionProps) {
  return (
    <section className="surface-panel p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-section text-bmj-white">
            PUBLISHING QUEUE
          </h2>
          <p className="mt-2 font-body text-sm text-bmj-text-muted">
            Upcoming scheduled items across the editorial stack.
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_ARTICLES}
          className="nav-link text-sm"
        >
          View Content
          <ArrowRight size={14} className="ml-2 inline" />
        </Link>
      </div>

      {scheduledQueue.length === 0 ? (
        <p className="mt-6 border border-bmj-tan/20 bg-bmj-black/30 p-4 font-body text-sm text-bmj-cream/70">
          No scheduled items are currently queued.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {scheduledQueue.map((item) => (
            <li key={item.id} className="border border-bmj-border-subtle bg-bmj-black/40 p-5 hover:border-bmj-border-strong transition-colors">
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
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-label text-micro uppercase tracking-label text-bmj-amber font-bold">
                    Scheduled
                  </p>
                  <p className="mt-2 font-mono text-sm text-bmj-white">
                    {formatDate(item.scheduledFor)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
