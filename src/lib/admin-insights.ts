import { PATHS } from '@/lib/paths';
import type {
  ContactSubmissionStatus,
  ContentStatus,
  MemberRole,
  MemberTier,
} from '@/lib/supabase/types';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export type AdminContentEntity = 'article' | 'briefing' | 'dispatch' | 'handbook';

export type AdminContentRecord = {
  id: string;
  entity: AdminContentEntity;
  title: string;
  status: ContentStatus;
  href: string;
  descriptor: string;
  createdAt: string;
  publishedAt: string | null;
};

export type AdminMessageRecord = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  status: ContactSubmissionStatus;
  submittedAt: string;
  handledAt: string | null;
};

export type AdminMemberRecord = {
  id: string;
  tier: MemberTier;
  role: MemberRole;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
};

export type AdminSubscriberRecord = {
  id: string;
  source: string | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
};

export type AdminQueueItem = {
  id: string;
  title: string;
  href: string;
  entity: AdminContentEntity;
  descriptor: string;
  ageInDays: number;
  scheduledFor: string | null;
  reason: string;
  severity: 'warning' | 'critical';
};

export type AdminPipelineInsights = {
  total: number;
  statusCounts: Record<ContentStatus, number>;
  scheduledThisWeek: number;
  scheduledQueue: AdminQueueItem[];
  staleQueue: AdminQueueItem[];
  /** 7-day trend — content items created per day, oldest → newest. */
  contentTrend: number[];
  /** 7-day trend — content items published per day, oldest → newest. */
  publishedTrend: number[];
};

export type AdminContentActivityItem = {
  id: string;
  title: string;
  href: string;
  entity: AdminContentEntity;
  descriptor: string;
  happenedAt: string;
  label: 'Created' | 'Scheduled' | 'Published';
};

export type AdminMessageQueueItem = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  href: string;
  status: ContactSubmissionStatus;
  ageInDays: number;
  overdue: boolean;
};

export type AdminMessageInsights = {
  total: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
  spamCount: number;
  unresolvedCount: number;
  overdueCount: number;
  queue: AdminMessageQueueItem[];
};

export type AdminMemberInsights = {
  total: number;
  free: number;
  basic: number;
  premium: number;
  paying: number;
  admins: number;
  editors: number;
  stripeCustomers: number;
  stripeSubscriptions: number;
  billingExceptions: number;
  joinedPast30Days: number;
};

export type AdminSubscriberInsights = {
  total: number;
  active: number;
  unsubscribed: number;
  newPast30Days: number;
  churnPast30Days: number;
  netPast30Days: number;
  topSources: Array<{ source: string; count: number }>;
  /** 7-day trend — new subscribers per day, oldest → newest. */
  subscriberTrend: number[];
};

function diffInDays(iso: string, now: Date): number {
  const delta = now.getTime() - new Date(iso).getTime();
  return Math.max(0, Math.floor(delta / DAY_IN_MS));
}

function isoPastDays(now: Date, days: number): number {
  return now.getTime() - days * DAY_IN_MS;
}

function initContentStatusCounts(): Record<ContentStatus, number> {
  return {
    draft: 0,
    review: 0,
    scheduled: 0,
    published: 0,
    archived: 0,
    withdrawn: 0,
  };
}

/**
 * Bucket ISO timestamps into a 7-day trend array (oldest → newest).
 * Day 0 = 6 days ago, Day 6 = today. Used to power dashboard sparklines.
 */
function bucketSevenDayTrend(isoTimestamps: Array<string | null | undefined>, now: Date): number[] {
  const buckets = new Array<number>(7).fill(0);
  const nowStart = new Date(now);
  nowStart.setHours(0, 0, 0, 0);
  const nowMs = nowStart.getTime();

  for (const iso of isoTimestamps) {
    if (!iso) continue;
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) continue;
    const ageDays = Math.floor((nowMs - ts) / DAY_IN_MS);
    // Today = index 6, yesterday = 5, etc.
    const bucketIndex = 6 - ageDays;
    if (bucketIndex >= 0 && bucketIndex <= 6) {
      buckets[bucketIndex] += 1;
    }
  }

  return buckets;
}

export function summarizeContentPipeline(
  records: AdminContentRecord[],
  now = new Date(),
): AdminPipelineInsights {
  const nowMs = now.getTime();
  const staleThresholdMs = isoPastDays(now, 14);
  const scheduledWindowMs = nowMs + 7 * DAY_IN_MS;
  const statusCounts = initContentStatusCounts();

  const scheduledQueue: AdminQueueItem[] = [];
  const staleQueue: AdminQueueItem[] = [];

  for (const record of records) {
    statusCounts[record.status] += 1;

    const createdAtMs = new Date(record.createdAt).getTime();
    const publishedAtMs = record.publishedAt ? new Date(record.publishedAt).getTime() : null;
    const ageInDays = diffInDays(record.createdAt, now);

    if (
      record.status === 'scheduled' &&
      publishedAtMs !== null &&
      publishedAtMs >= nowMs
    ) {
      scheduledQueue.push({
        id: record.id,
        title: record.title,
        href: record.href,
        entity: record.entity,
        descriptor: record.descriptor,
        ageInDays,
        scheduledFor: record.publishedAt,
        reason:
          publishedAtMs <= scheduledWindowMs
            ? 'Scheduled within the next 7 days'
            : 'Scheduled for a later publishing window',
        severity: 'warning',
      });
    }

    if (
      record.status === 'scheduled' &&
      (publishedAtMs === null || publishedAtMs < nowMs)
    ) {
      staleQueue.push({
        id: record.id,
        title: record.title,
        href: record.href,
        entity: record.entity,
        descriptor: record.descriptor,
        ageInDays,
        scheduledFor: record.publishedAt,
        reason: publishedAtMs === null ? 'Scheduled without a publish time' : 'Scheduled publish date has passed',
        severity: 'critical',
      });
      continue;
    }

    if (
      (record.status === 'draft' || record.status === 'review') &&
      createdAtMs <= staleThresholdMs
    ) {
      staleQueue.push({
        id: record.id,
        title: record.title,
        href: record.href,
        entity: record.entity,
        descriptor: record.descriptor,
        ageInDays,
        scheduledFor: record.publishedAt,
        reason: `${record.status === 'review' ? 'In review' : 'In draft'} for ${ageInDays} days`,
        severity: record.status === 'review' ? 'warning' : 'critical',
      });
    }
  }

  scheduledQueue.sort((left, right) => {
    const leftMs = left.scheduledFor ? new Date(left.scheduledFor).getTime() : Number.MAX_SAFE_INTEGER;
    const rightMs = right.scheduledFor ? new Date(right.scheduledFor).getTime() : Number.MAX_SAFE_INTEGER;
    return leftMs - rightMs;
  });

  staleQueue.sort((left, right) => {
    if (left.severity !== right.severity) {
      return left.severity === 'critical' ? -1 : 1;
    }
    const leftScheduleIssue = left.reason.startsWith('Scheduled');
    const rightScheduleIssue = right.reason.startsWith('Scheduled');
    if (leftScheduleIssue !== rightScheduleIssue) {
      return leftScheduleIssue ? -1 : 1;
    }
    return right.ageInDays - left.ageInDays;
  });

  const contentTrend = bucketSevenDayTrend(
    records.map((record) => record.createdAt),
    now,
  );
  const publishedTrend = bucketSevenDayTrend(
    records.map((record) => (record.status === 'published' ? record.publishedAt : null)),
    now,
  );

  return {
    total: records.length,
    statusCounts,
    scheduledThisWeek: scheduledQueue.filter((item) => {
      if (!item.scheduledFor) return false;
      const scheduledAtMs = new Date(item.scheduledFor).getTime();
      return scheduledAtMs <= scheduledWindowMs;
    }).length,
    scheduledQueue: scheduledQueue.slice(0, 8),
    staleQueue: staleQueue.slice(0, 8),
    contentTrend,
    publishedTrend,
  };
}

export function summarizeContentActivity(
  records: AdminContentRecord[],
  limit = 6,
): AdminContentActivityItem[] {
  return records
    .map((record) => {
      if (record.status === 'published' && record.publishedAt) {
        return {
          id: record.id,
          title: record.title,
          href: record.href,
          entity: record.entity,
          descriptor: record.descriptor,
          happenedAt: record.publishedAt,
          label: 'Published' as const,
        };
      }

      if (record.status === 'scheduled' && record.publishedAt) {
        return {
          id: record.id,
          title: record.title,
          href: record.href,
          entity: record.entity,
          descriptor: record.descriptor,
          happenedAt: record.publishedAt,
          label: 'Scheduled' as const,
        };
      }

      return {
        id: record.id,
        title: record.title,
        href: record.href,
        entity: record.entity,
        descriptor: record.descriptor,
        happenedAt: record.createdAt,
        label: 'Created' as const,
      };
    })
    .sort(
      (left, right) =>
        new Date(right.happenedAt).getTime() - new Date(left.happenedAt).getTime(),
    )
    .slice(0, limit);
}

export function summarizeMessageInsights(
  records: AdminMessageRecord[],
  now = new Date(),
): AdminMessageInsights {
  const queue: AdminMessageQueueItem[] = [];
  let newCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  let spamCount = 0;
  let overdueCount = 0;

  for (const record of records) {
    const ageInDays = diffInDays(record.submittedAt, now);
    const overdue =
      (record.status === 'new' || record.status === 'in_progress') && ageInDays >= 3;

    if (record.status === 'new') newCount += 1;
    if (record.status === 'in_progress') inProgressCount += 1;
    if (record.status === 'resolved') resolvedCount += 1;
    if (record.status === 'spam') spamCount += 1;
    if (overdue) overdueCount += 1;

    if (record.status === 'new' || record.status === 'in_progress') {
      queue.push({
        id: record.id,
        name: record.name,
        email: record.email,
        subject: record.subject,
        href: PATHS.ADMIN_MESSAGES,
        status: record.status,
        ageInDays,
        overdue,
      });
    }
  }

  queue.sort((left, right) => {
    if (left.overdue !== right.overdue) return left.overdue ? -1 : 1;
    return right.ageInDays - left.ageInDays;
  });

  return {
    total: records.length,
    newCount,
    inProgressCount,
    resolvedCount,
    spamCount,
    unresolvedCount: newCount + inProgressCount,
    overdueCount,
    queue: queue.slice(0, 6),
  };
}

export function summarizeMemberInsights(
  records: AdminMemberRecord[],
  now = new Date(),
): AdminMemberInsights {
  let free = 0;
  let basic = 0;
  let premium = 0;
  let admins = 0;
  let editors = 0;
  let stripeCustomers = 0;
  let stripeSubscriptions = 0;
  let billingExceptions = 0;
  let joinedPast30Days = 0;
  const recentThresholdMs = isoPastDays(now, 30);

  for (const record of records) {
    if (record.tier === 'free') free += 1;
    if (record.tier === 'basic') basic += 1;
    if (record.tier === 'premium') premium += 1;
    if (record.role === 'admin') admins += 1;
    if (record.role === 'editor') editors += 1;
    if (record.stripeCustomerId) stripeCustomers += 1;
    if (record.stripeSubscriptionId) stripeSubscriptions += 1;
    if (new Date(record.createdAt).getTime() >= recentThresholdMs) joinedPast30Days += 1;

    if (
      record.tier !== 'free' &&
      (!record.stripeCustomerId || !record.stripeSubscriptionId)
    ) {
      billingExceptions += 1;
    }
  }

  return {
    total: records.length,
    free,
    basic,
    premium,
    paying: basic + premium,
    admins,
    editors,
    stripeCustomers,
    stripeSubscriptions,
    billingExceptions,
    joinedPast30Days,
  };
}

export function summarizeSubscriberInsights(
  records: AdminSubscriberRecord[],
  now = new Date(),
): AdminSubscriberInsights {
  let active = 0;
  let unsubscribed = 0;
  let newPast30Days = 0;
  let churnPast30Days = 0;
  const recentThresholdMs = isoPastDays(now, 30);
  const sourceCounts = new Map<string, number>();

  for (const record of records) {
    const isActive = !record.unsubscribedAt;
    if (isActive) active += 1;
    if (!isActive) unsubscribed += 1;
    if (new Date(record.subscribedAt).getTime() >= recentThresholdMs) newPast30Days += 1;
    if (record.unsubscribedAt && new Date(record.unsubscribedAt).getTime() >= recentThresholdMs) {
      churnPast30Days += 1;
    }

    if (isActive) {
      const source = record.source?.trim() || 'unknown';
      sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
    }
  }

  const topSources = Array.from(sourceCounts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));

  const subscriberTrend = bucketSevenDayTrend(
    records.map((record) => record.subscribedAt),
    now,
  );

  return {
    total: records.length,
    active,
    unsubscribed,
    newPast30Days,
    churnPast30Days,
    netPast30Days: newPast30Days - churnPast30Days,
    topSources,
    subscriberTrend,
  };
}
