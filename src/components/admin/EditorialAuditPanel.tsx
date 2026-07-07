import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { PublishReadiness } from '@/lib/admin-publishing';
import type { AdminActivityLog } from '@/lib/supabase/types';
import { PublishReadinessBadge } from '@/components/admin/PublishReadinessBadge';

type AuditTone = 'default' | 'warning' | 'critical' | 'success';

type AuditItem = {
  label: string;
  value: string;
  tone?: AuditTone;
};

type AuditLink = {
  label: string;
  href: string;
};

interface EditorialAuditPanelProps {
  descriptor: string;
  status: string;
  readiness: PublishReadiness;
  createdAt: string;
  publishedAt?: string | null;
  publishLabel?: string;
  checks: AuditItem[];
  links: AuditLink[];
  activity?: AdminActivityLog[];
}

const toneClasses: Record<AuditTone, string> = {
  default: 'border-bmj-tan/20 bg-bmj-black/25 text-bmj-cream',
  warning: 'border-bmj-amber/30 bg-bmj-amber/10 text-bmj-amber',
  critical: 'border-bmj-red/30 bg-bmj-red/10 text-bmj-red',
  success: 'border-bmj-olive/30 bg-bmj-olive/10 text-[#9fcb51]',
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Not set';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date(iso)) + ' UTC';
}

function activityTone(action: AdminActivityLog['action']): AuditTone {
  if (action === 'created') return 'success';
  if (action === 'deleted') return 'critical';
  return 'default';
}

function formatActionLabel(action: AdminActivityLog['action']): string {
  return action.toUpperCase();
}

function AuditList({
  title,
  items,
}: {
  title: string;
  items: AuditItem[];
}) {
  return (
    <div>
      <h3 className="font-label text-xs uppercase tracking-widest text-bmj-tan">
        {title}
      </h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li
            key={`${title}-${item.label}`}
            className={`border px-4 py-3 ${toneClasses[item.tone ?? 'default']}`}
          >
            <p className="font-label text-micro uppercase tracking-widest">
              {item.label}
            </p>
            <p className="mt-2 font-body text-sm">{item.value}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EditorialAuditPanel({
  descriptor,
  status,
  readiness,
  createdAt,
  publishedAt,
  publishLabel = 'Publish At',
  checks,
  links,
  activity = [],
}: EditorialAuditPanelProps) {
  const lifecycle: AuditItem[] = [
    {
      label: 'Created',
      value: formatDateTime(createdAt),
      tone: 'default',
    },
    {
      label: publishLabel,
      value: formatDateTime(publishedAt),
      tone: publishedAt ? 'success' : 'warning',
    },
    {
      label: 'Current Status',
      value: status,
      tone:
        status === 'published'
          ? 'success'
          : status === 'scheduled' || status === 'review'
            ? 'warning'
            : 'default',
    },
  ];

  const issueItems: AuditItem[] = [
    ...readiness.blockingIssues.map((value) => ({
      label: 'Blocking Issue',
      value,
      tone: 'critical' as const,
    })),
    ...readiness.advisoryIssues.map((value) => ({
      label: 'Advisory',
      value,
      tone: 'warning' as const,
    })),
  ];

  return (
    <aside className="border border-bmj-tan/20 bg-bmj-brown p-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Owner Audit
        </p>
        <PublishReadinessBadge readiness={readiness} />
      </div>

      <p className="mt-3 font-body text-sm text-bmj-cream/80">{descriptor}</p>

      <AuditList title="Lifecycle" items={lifecycle} />

      <div className="mt-6">
        <h3 className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Open Issues
        </h3>
        {issueItems.length === 0 ? (
          <p className="mt-3 border border-bmj-olive/30 bg-bmj-olive/10 px-4 py-3 font-body text-sm text-bmj-cream/80">
            No publish blockers are visible right now.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {issueItems.map((item, index) => (
              <li
                key={`${item.label}-${index}`}
                className={`border px-4 py-3 ${toneClasses[item.tone ?? 'default']}`}
              >
                <p className="font-label text-micro uppercase tracking-widest">
                  {item.label}
                </p>
                <p className="mt-2 font-body text-sm">{item.value}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Verification
        </h3>
        <ul className="mt-3 space-y-3">
          {checks.map((item) => (
            <li
              key={item.label}
              className={`border px-4 py-3 ${toneClasses[item.tone ?? 'default']}`}
            >
              <p className="font-label text-micro uppercase tracking-widest">
                {item.label}
              </p>
              <p className="mt-2 font-body text-sm">{item.value}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Recent Activity
        </h3>
        {activity.length === 0 ? (
          <p className="mt-3 border border-bmj-tan/20 bg-bmj-black/25 px-4 py-3 font-body text-sm text-bmj-cream/80">
            No persisted operator events are recorded for this item yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {activity.map((entry) => (
              <li
                key={entry.id}
                className={`border px-4 py-3 ${toneClasses[activityTone(entry.action)]}`}
              >
                <p className="font-label text-micro uppercase tracking-widest">
                  {formatActionLabel(entry.action)} | {formatDateTime(entry.created_at)}
                </p>
                <p className="mt-2 font-body text-sm">{entry.summary}</p>
                <p className="mt-2 font-mono text-[11px] text-bmj-cream/70">
                  {entry.actor_email} · {entry.actor_role}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Routes
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="inline-flex items-center justify-between border border-bmj-tan/20 bg-bmj-black/25 px-4 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
            >
              {link.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
