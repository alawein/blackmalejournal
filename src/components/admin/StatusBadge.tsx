import { cn } from '@/lib/utils';
import type { CampaignStatus, ContactSubmissionStatus, ContentStatus } from '@/lib/supabase/types';

/**
 * Supported admin status strings across the platform.
 * Using a broad union keeps <StatusBadge> reusable from content pages,
 * campaign pages, and contact-submission pages without per-file color maps.
 */
export type AdminStatus =
  | ContentStatus
  | CampaignStatus
  | ContactSubmissionStatus;

/**
 * Shared status → color class mapping.
 * BMJ brand prohibits pure blue — we use olive (#416100) for "live/published"
 * and brand gold (#C77A0E) for "scheduled" to keep semantic distinction
 * while staying on-palette.
 */
const STATUS_STYLES: Record<AdminStatus, string> = {
  // Content lifecycle
  draft: 'border-bmj-tan/30 bg-bmj-tan/15 text-bmj-tan',
  review: 'border-bmj-amber/40 bg-bmj-amber/15 text-bmj-amber',
  scheduled: 'border-bmj-gold/40 bg-bmj-gold/15 text-bmj-gold',
  published: 'border-bmj-olive/40 bg-bmj-olive/15 text-bmj-olive',
  archived: 'border-bmj-tan/20 bg-bmj-tan/10 text-bmj-tan/60',
  withdrawn: 'border-bmj-red/40 bg-bmj-red/15 text-bmj-red',
  // Campaign extras
  sent: 'border-bmj-olive/40 bg-bmj-olive/15 text-bmj-olive',
  failed: 'border-bmj-red/40 bg-bmj-red/15 text-bmj-red',
  // Contact submission extras
  new: 'border-bmj-amber/40 bg-bmj-amber/15 text-bmj-amber',
  in_progress: 'border-bmj-gold/40 bg-bmj-gold/15 text-bmj-gold',
  resolved: 'border-bmj-olive/40 bg-bmj-olive/15 text-bmj-olive',
  spam: 'border-bmj-tan/20 bg-bmj-tan/10 text-bmj-tan/60',
};

/**
 * Human-friendly label override for statuses that need formatting.
 */
const STATUS_LABELS: Partial<Record<AdminStatus, string>> = {
  in_progress: 'in progress',
};

interface StatusBadgeProps {
  status: AdminStatus;
  className?: string;
}

/**
 * Standardized status pill used across every admin listing surface.
 * Reads the shared STATUS_STYLES map so status colors stay in sync
 * as new statuses are introduced.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block border px-2 py-0.5 font-label text-micro uppercase tracking-label',
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
