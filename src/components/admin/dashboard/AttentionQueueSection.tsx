import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '@/lib/paths';

export type AttentionItem = {
  label: string;
  detail: string;
  href: string;
  tone: 'critical' | 'warning';
};

type AttentionQueueSectionProps = {
  items: AttentionItem[];
};

export function AttentionQueueSection({ items }: AttentionQueueSectionProps) {
  return (
    <section className="surface-panel p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-section text-bmj-white">
            ATTENTION QUEUE
          </h2>
          <p className="mt-2 font-body text-sm text-bmj-text-muted">
            Resolve these items before adding new content.
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_MESSAGES}
          className="nav-link text-sm"
        >
          Open Inbox
          <ArrowRight size={14} className="ml-2 inline" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 border border-bmj-olive/30 bg-bmj-olive/10 p-4 font-body text-sm text-bmj-cream/80">
          No urgent admin blockers are visible right now. The inbox is under
          control and there are no stale editorial or billing exceptions in
          the current snapshot.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.label}
              className={`border border-l-[4px] p-4 hover-lift-sm hover:shadow-[var(--shadow-md)] ${
                item.tone === 'critical'
                  ? 'border-bmj-red/30 border-l-bmj-red bg-bmj-red/10'
                  : 'border-bmj-amber/30 border-l-bmj-amber bg-bmj-amber/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-bmj-white">
                    {item.label}
                  </p>
                  <p className="mt-2 font-body text-sm text-bmj-cream/80">
                    {item.detail}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="shrink-0 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
                >
                  Resolve
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
