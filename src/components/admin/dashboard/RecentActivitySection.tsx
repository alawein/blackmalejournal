import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import type { AdminContentActivityItem } from '@/lib/admin-insights';
import { contentLabels, formatDate } from './utils';

type RecentActivitySectionProps = {
  activity: AdminContentActivityItem[];
};

export function RecentActivitySection({ activity }: RecentActivitySectionProps) {
  return (
    <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl tracking-widest text-bmj-white">
            RECENT EDITORIAL ACTIVITY
          </h2>
          <p className="mt-1 font-body text-sm text-bmj-cream/70">
            The latest content moves across the publishing stack.
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_ARTICLES}
          className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
        >
          Content Desk
          <ArrowRight size={14} />
        </Link>
      </div>

      {activity.length === 0 ? (
        <p className="mt-4 border border-bmj-tan/20 bg-bmj-black/30 p-4 font-body text-sm text-bmj-cream/70">
          No recent editorial activity is visible yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {activity.map((item) => (
            <li
              key={`${item.id}-${item.label}`}
              className="border border-bmj-tan/20 bg-bmj-black/25 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                    {item.label} · {contentLabels[item.entity]}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-2 block font-display text-lg tracking-wider text-bmj-white transition-colors hover:text-bmj-red"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-2 font-mono text-xs text-bmj-tan">
                    {item.descriptor}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-xs text-bmj-cream/70">
                  {formatDate(item.happenedAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
