import type { Metadata } from 'next';
import { PATHS } from '@/lib/paths';
import { getAdminCommandCenterSnapshot } from '@/lib/supabase/admin-queries';
import { StarDivider } from '@/components/ui/StarDivider';
import { BrandMark } from '@/components/brand/BrandMark';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import {
  KeyMetricsGrid,
  AttentionQueueSection,
  PublishingQueueSection,
  EditorialPipelineSection,
  AudienceBillingSection,
  RecentActivitySection,
  TopSourcesSection,
  AdminCoverageSection,
  QuickActionsSection,
  DashboardSection,
  type AttentionItem,
} from '@/components/admin/dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  let snapshot;
  try {
    snapshot = await getAdminCommandCenterSnapshot();
  } catch (err) {
    console.error('[AdminDashboard] snapshot failed', err);
    return (
      <div className="surface-panel p-8">
        <p className="font-display text-xl uppercase tracking-widest text-bmj-red">
          DASHBOARD UNAVAILABLE
        </p>
        <p className="mt-3 font-body text-sm text-bmj-cream/60">
          Failed to load dashboard data. Check the server logs and try refreshing.
        </p>
      </div>
    );
  }
  const { counts, pipeline, activity, members, messages, subscribers } = snapshot;

  const contentCards = [
    {
      label: 'Articles',
      total: counts.articles.total,
      detail: `${counts.articles.published} published · ${counts.articles.draft} draft`,
      href: PATHS.ADMIN_ARTICLES,
    },
    {
      label: 'Briefings',
      total: counts.briefings.total,
      detail: `${counts.briefings.published} published · ${counts.briefings.draft} draft`,
      href: PATHS.ADMIN_BRIEFINGS,
    },
    {
      label: 'Courses',
      total: counts.courses.total,
      detail: `${counts.courses.published} published · ${counts.courses.draft} draft`,
      href: PATHS.ADMIN_COURSES,
    },
    {
      label: 'Dispatches',
      total: counts.dispatches.total,
      detail: `${counts.dispatches.published} published · ${counts.dispatches.draft} draft`,
      href: PATHS.ADMIN_DISPATCHES,
    },
    {
      label: 'Downloads',
      total: counts.downloads.total,
      detail: 'Resource inventory',
      href: PATHS.ADMIN_DOWNLOADS,
    },
    {
      label: 'Handbooks',
      total: counts.handbooks.total,
      detail: `${counts.handbooks.published} published · ${counts.handbooks.draft} draft`,
      href: PATHS.ADMIN_HANDBOOKS,
    },
    {
      label: 'Members',
      total: counts.members.total,
      detail: `${members.paying} paying · ${members.billingExceptions} billing exceptions`,
      href: PATHS.ADMIN_MEMBERS,
    },
    {
      label: 'Messages',
      total: counts.messages.total,
      detail: `${messages.unresolvedCount} unresolved · ${messages.overdueCount} overdue`,
      href: PATHS.ADMIN_MESSAGES,
    },
    {
      label: 'Subscribers',
      total: counts.subscribers.total,
      detail: `${subscribers.active} active · ${subscribers.netPast30Days >= 0 ? '+' : ''}${subscribers.netPast30Days} net 30d`,
      href: PATHS.ADMIN_SUBSCRIBERS,
    },
  ] as const;

  const attentionItems: AttentionItem[] = [
    messages.overdueCount > 0
      ? {
          label: 'Inbox backlog',
          detail: `${messages.overdueCount} messages are older than 3 days and still unresolved.`,
          href: PATHS.ADMIN_MESSAGES as string,
          tone: 'critical' as const,
        }
      : null,
    pipeline.staleQueue.length > 0
      ? {
          label: 'Editorial backlog',
          detail: `${pipeline.staleQueue.length} content items are stale or have missed their scheduled window.`,
          href: pipeline.staleQueue[0]?.href ?? PATHS.ADMIN_ARTICLES,
          tone: 'critical' as const,
        }
      : null,
    members.billingExceptions > 0
      ? {
          label: 'Billing review',
          detail: `${members.billingExceptions} paying members are missing Stripe reference coverage.`,
          href: PATHS.ADMIN_MEMBERS as string,
          tone: 'warning' as const,
        }
      : null,
    subscribers.netPast30Days < 0
      ? {
          label: 'Audience churn',
          detail: `Net subscriber movement is ${subscribers.netPast30Days} over the last 30 days.`,
          href: PATHS.ADMIN_SUBSCRIBERS as string,
          tone: 'warning' as const,
        }
      : null,
  ].filter((item): item is AttentionItem => item !== null);

  return (
    <div>
      <ScrollReveal as="div" direction="none">
        <div className="flex items-start gap-4">
          <div className="mt-1 shrink-0">
            <BrandMark size={32} color="var(--bmj-red)" />
          </div>
          <div>
            <h1 className="font-display text-3xl tracking-widest text-bmj-white">
              DASHBOARD
            </h1>
            <p className="mt-2 max-w-3xl font-body text-sm text-bmj-cream/75">
              Owner command center for publishing, audience, billing follow-up, and
              inbox pressure.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal as="div" delay={0.05}>
        <DashboardSection title="Key Metrics">
          <KeyMetricsGrid
            messages={messages}
            pipeline={pipeline}
            members={members}
            subscribers={subscribers}
          />
        </DashboardSection>
      </ScrollReveal>

      <StarDivider className="my-12" />

      <ScrollReveal as="div" delay={0.1}>
        <DashboardSection title="Attention Queue">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <AttentionQueueSection items={attentionItems} />
            <PublishingQueueSection scheduledQueue={pipeline.scheduledQueue} />
          </div>
        </DashboardSection>
      </ScrollReveal>

      <ScrollReveal as="div" delay={0.15}>
        <DashboardSection title="Editorial Pipeline">
          <div className="mt-12 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <EditorialPipelineSection pipeline={pipeline} />

            <div className="space-y-6">
              <AudienceBillingSection members={members} subscribers={subscribers} />
              <RecentActivitySection activity={activity} />
              <TopSourcesSection topSources={subscribers.topSources} />
            </div>
          </div>
        </DashboardSection>
      </ScrollReveal>

      <StarDivider className="my-12" />

      <ScrollReveal as="div" delay={0.2}>
        <DashboardSection title="Admin Coverage">
          <AdminCoverageSection contentCards={contentCards} />
        </DashboardSection>
      </ScrollReveal>

      <StarDivider className="my-12" />

      <ScrollReveal as="div" delay={0.25}>
        <DashboardSection title="Quick Actions">
          <QuickActionsSection />
        </DashboardSection>
      </ScrollReveal>
    </div>
  );
}
