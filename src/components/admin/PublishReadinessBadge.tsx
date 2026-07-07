import type { PublishReadiness } from '@/lib/admin-publishing';

interface PublishReadinessBadgeProps {
  readiness: PublishReadiness;
}

const readinessClasses: Record<PublishReadiness['status'], string> = {
  ready: 'bg-bmj-olive/20 text-bmj-olive',
  warning: 'bg-bmj-amber/20 text-bmj-amber',
  blocked: 'bg-bmj-red/20 text-bmj-red',
};

export function PublishReadinessBadge({
  readiness,
}: PublishReadinessBadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-label text-micro uppercase tracking-widest ${readinessClasses[readiness.status]}`}
    >
      {readiness.label}
    </span>
  );
}
