import { cn } from '@/lib/utils';

interface SparklineProps {
  /** Values, oldest → newest. Renders as a simple CSS bar chart. */
  values: number[];
  /** Bar tint class — e.g. 'bg-bmj-red', 'bg-bmj-amber'. */
  barClassName?: string;
  className?: string;
  /** Accessible label for screen readers. */
  label?: string;
}

/**
 * Mini 7-day bar chart — pure CSS, no charting library.
 * Bars are normalized against the max value in the series so small totals
 * remain visible. Renders an aria-hidden visual + an sr-only summary.
 */
export function Sparkline({
  values,
  barClassName = 'bg-bmj-red/60',
  className,
  label,
}: SparklineProps) {
  const max = Math.max(1, ...values);
  const total = values.reduce((sum, value) => sum + value, 0);

  return (
    <div
      className={cn('flex h-8 items-end gap-[2px]', className)}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label ? `${label}: ${total} total over 7 days` : undefined}
    >
      {values.map((value, index) => {
        const heightPercent = (value / max) * 100;
        const renderHeight = value === 0 ? 4 : Math.max(8, heightPercent);
        return (
          <div
            key={index}
            className={cn(
              'flex-1 transition-all duration-300',
              value === 0 ? 'bg-bmj-tan/20' : barClassName,
            )}
            style={{ height: `${renderHeight}%` }}
          />
        );
      })}
    </div>
  );
}
