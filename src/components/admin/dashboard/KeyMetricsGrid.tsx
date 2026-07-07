import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import { PATHS } from '@/lib/paths';
import type {
  AdminMessageInsights,
  AdminPipelineInsights,
  AdminMemberInsights,
  AdminSubscriberInsights,
} from '@/lib/admin-insights';

type KeyMetricsGridProps = {
  messages: AdminMessageInsights;
  pipeline: AdminPipelineInsights;
  members: AdminMemberInsights;
  subscribers: AdminSubscriberInsights;
};

export function KeyMetricsGrid({
  messages,
  pipeline,
  members,
  subscribers,
}: KeyMetricsGridProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <AdminMetricCard
        label="Inbox Pressure"
        value={messages.unresolvedCount}
        helper={`${messages.overdueCount} overdue · ${messages.newCount} new`}
        href={PATHS.ADMIN_MESSAGES}
        tone={messages.overdueCount > 0 ? 'critical' : 'default'}
      />
      <AdminMetricCard
        label="Editorial Backlog"
        value={pipeline.staleQueue.length}
        helper={`${pipeline.statusCounts.draft} drafts · ${pipeline.statusCounts.review} in review`}
        href={pipeline.staleQueue[0]?.href ?? PATHS.ADMIN_ARTICLES}
        tone={pipeline.staleQueue.length > 0 ? 'critical' : 'default'}
        trend={pipeline.contentTrend}
      />
      <AdminMetricCard
        label="Scheduled This Week"
        value={pipeline.scheduledThisWeek}
        helper={`${pipeline.statusCounts.scheduled} total scheduled`}
        href={pipeline.scheduledQueue[0]?.href ?? PATHS.ADMIN_BRIEFINGS}
        tone={pipeline.scheduledThisWeek > 0 ? 'warning' : 'default'}
        trend={pipeline.publishedTrend}
      />
      <AdminMetricCard
        label="Paying Members"
        value={members.paying}
        helper={`${members.billingExceptions} need billing review`}
        href={PATHS.ADMIN_MEMBERS}
        tone={members.billingExceptions > 0 ? 'warning' : 'default'}
      />
      <AdminMetricCard
        label="Active Subscribers"
        value={subscribers.active}
        helper={`${subscribers.netPast30Days >= 0 ? '+' : ''}${subscribers.netPast30Days} net over 30 days`}
        href={PATHS.ADMIN_SUBSCRIBERS}
        tone={subscribers.netPast30Days < 0 ? 'warning' : 'success'}
        trend={subscribers.subscriberTrend}
      />
      <AdminMetricCard
        label="New Members 30d"
        value={members.joinedPast30Days}
        helper={`${members.admins} admins · ${members.editors} editors`}
        href={PATHS.ADMIN_MEMBERS}
        tone="default"
      />
    </div>
  );
}
