import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '@/lib/paths';

type TopSourcesSectionProps = {
  topSources: Array<{ source: string; count: number }>;
};

export function TopSourcesSection({ topSources }: TopSourcesSectionProps) {
  return (
    <section className="border border-bmj-tan/20 bg-bmj-brown p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl tracking-widest text-bmj-white">
          TOP SOURCES
        </h2>
        <Link
          href={PATHS.ADMIN_SUBSCRIBERS}
          className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-white"
        >
          Subscriber Desk
          <ArrowRight size={14} />
        </Link>
      </div>

      {topSources.length === 0 ? (
        <p className="mt-4 font-body text-sm text-bmj-cream/70">
          Subscriber source data is not populated yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {topSources.map((source) => (
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
  );
}
