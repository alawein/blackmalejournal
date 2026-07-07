import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Sparkline } from './Sparkline';

type AdminMetricTone = 'default' | 'warning' | 'critical' | 'success';

const toneClasses: Record<AdminMetricTone, string> = {
  default: 'border-bmj-tan/20 text-bmj-tan',
  warning: 'border-bmj-amber/30 text-bmj-amber',
  critical: 'border-bmj-red/30 text-bmj-red',
  success: 'border-bmj-olive/30 text-bmj-olive',
};

const sparklineBarByTone: Record<AdminMetricTone, string> = {
  default: 'bg-bmj-tan/60',
  warning: 'bg-bmj-amber/70',
  critical: 'bg-bmj-red/70',
  success: 'bg-bmj-olive/70',
};

interface AdminMetricCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
  href?: string;
  tone?: AdminMetricTone;
  /** Optional 7-day trend values (oldest → newest) — rendered as a sparkline. */
  trend?: number[];
}

export function AdminMetricCard({
  label,
  value,
  helper,
  href,
  tone = 'default',
  trend,
}: AdminMetricCardProps) {
  const hasTrend = trend && trend.length > 0;

  const content = (
    <div
      className={`h-full border surface-panel p-6 hover-lift-sm hover:border-bmj-border-strong hover:shadow-[var(--shadow-md)] ${toneClasses[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-label text-micro uppercase tracking-label-xl">
            {label}
          </p>
          <p className="mt-3 font-mono text-3xl text-bmj-white">{value}</p>
          {helper ? (
            <p className="mt-3 font-body text-sm text-bmj-text-muted">{helper}</p>
          ) : null}
        </div>
        {href ? (
          <ArrowUpRight
            size={16}
            aria-hidden="true"
            className="mt-1 shrink-0 text-bmj-cream/70"
          />
        ) : null}
      </div>

      {hasTrend && (
        <div className="mt-4 border-t border-bmj-tan/15 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-label text-[10px] uppercase tracking-widest text-bmj-cream/60">
              7-day trend
            </span>
            <span className="font-mono text-[10px] text-bmj-cream/60">
              {trend.reduce((sum, value) => sum + value, 0)} total
            </span>
          </div>
          <Sparkline
            values={trend}
            barClassName={sparklineBarByTone[tone]}
            label={`${label} trend`}
          />
        </div>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block h-full transition-colors hover:text-bmj-white">
      {content}
    </Link>
  );
}
