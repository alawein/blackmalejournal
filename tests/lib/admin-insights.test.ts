import { adminEditPath } from '@/lib/paths';
import {
  summarizeContentActivity,
  summarizeContentPipeline,
  summarizeMemberInsights,
  summarizeMessageInsights,
  summarizeSubscriberInsights,
  type AdminContentRecord,
} from '@/lib/admin-insights';

describe('admin insights helpers', () => {
  const now = new Date('2026-03-25T12:00:00.000Z');

  it('summarizes content pipeline queues', () => {
    const records: AdminContentRecord[] = [
      {
        id: '1',
        entity: 'article',
        title: 'Old Draft',
        status: 'draft',
        href: adminEditPath('articles', '1'),
        descriptor: 'Article · politics · premium',
        createdAt: '2026-02-20T12:00:00.000Z',
        publishedAt: null,
      },
      {
        id: '2',
        entity: 'briefing',
        title: 'Tomorrow Briefing',
        status: 'scheduled',
        href: adminEditPath('briefings', '2'),
        descriptor: 'Briefing #2 · premium',
        createdAt: '2026-03-20T12:00:00.000Z',
        publishedAt: '2026-03-26T12:00:00.000Z',
      },
      {
        id: '3',
        entity: 'dispatch',
        title: 'Missed Dispatch',
        status: 'scheduled',
        href: adminEditPath('dispatches', '3'),
        descriptor: 'Dispatch · culture',
        createdAt: '2026-03-10T12:00:00.000Z',
        publishedAt: '2026-03-20T12:00:00.000Z',
      },
    ];

    const result = summarizeContentPipeline(records, now);
    expect(result.statusCounts.draft).toBe(1);
    expect(result.statusCounts.scheduled).toBe(2);
    expect(result.scheduledThisWeek).toBe(1);
    expect(result.scheduledQueue[0]?.title).toBe('Tomorrow Briefing');
    expect(result.staleQueue.map((item) => item.title)).toEqual([
      'Missed Dispatch',
      'Old Draft',
    ]);
  });

  it('summarizes recent editorial activity', () => {
    const records: AdminContentRecord[] = [
      {
        id: '1',
        entity: 'article',
        title: 'Fresh Draft',
        status: 'draft',
        href: adminEditPath('articles', '1'),
        descriptor: 'Article · politics · premium',
        createdAt: '2026-03-25T09:00:00.000Z',
        publishedAt: null,
      },
      {
        id: '2',
        entity: 'briefing',
        title: 'Weekend Briefing',
        status: 'scheduled',
        href: adminEditPath('briefings', '2'),
        descriptor: 'Briefing #5 · premium',
        createdAt: '2026-03-20T12:00:00.000Z',
        publishedAt: '2026-03-28T12:00:00.000Z',
      },
      {
        id: '3',
        entity: 'dispatch',
        title: 'Published Dispatch',
        status: 'published',
        href: adminEditPath('dispatches', '3'),
        descriptor: 'Dispatch · culture',
        createdAt: '2026-03-21T12:00:00.000Z',
        publishedAt: '2026-03-24T16:00:00.000Z',
      },
    ];

    const result = summarizeContentActivity(records, 3);
    expect(result.map((item) => `${item.label}:${item.title}`)).toEqual([
      'Scheduled:Weekend Briefing',
      'Created:Fresh Draft',
      'Published:Published Dispatch',
    ]);
  });

  it('summarizes message backlog and overdue queue', () => {
    const result = summarizeMessageInsights(
      [
        {
          id: '1',
          name: 'Alpha',
          email: 'alpha@example.com',
          subject: 'Question',
          status: 'new',
          submittedAt: '2026-03-20T12:00:00.000Z',
          handledAt: null,
        },
        {
          id: '2',
          name: 'Beta',
          email: 'beta@example.com',
          subject: 'Follow-up',
          status: 'in_progress',
          submittedAt: '2026-03-24T12:00:00.000Z',
          handledAt: null,
        },
        {
          id: '3',
          name: 'Gamma',
          email: 'gamma@example.com',
          subject: null,
          status: 'resolved',
          submittedAt: '2026-03-19T12:00:00.000Z',
          handledAt: '2026-03-21T12:00:00.000Z',
        },
      ],
      now,
    );

    expect(result.unresolvedCount).toBe(2);
    expect(result.overdueCount).toBe(1);
    expect(result.queue[0]?.name).toBe('Alpha');
  });

  it('summarizes member billing health', () => {
    const result = summarizeMemberInsights(
      [
        {
          id: '1',
          tier: 'premium',
          role: 'member',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: null,
          createdAt: '2026-03-10T12:00:00.000Z',
        },
        {
          id: '2',
          tier: 'basic',
          role: 'editor',
          stripeCustomerId: 'cus_2',
          stripeSubscriptionId: 'sub_2',
          createdAt: '2026-03-01T12:00:00.000Z',
        },
        {
          id: '3',
          tier: 'free',
          role: 'admin',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: '2026-02-01T12:00:00.000Z',
        },
      ],
      now,
    );

    expect(result.paying).toBe(2);
    expect(result.billingExceptions).toBe(1);
    expect(result.admins).toBe(1);
    expect(result.editors).toBe(1);
    expect(result.joinedPast30Days).toBe(2);
  });

  it('summarizes subscriber growth and sources', () => {
    const result = summarizeSubscriberInsights(
      [
        {
          id: '1',
          source: 'homepage',
          subscribedAt: '2026-03-20T12:00:00.000Z',
          unsubscribedAt: null,
        },
        {
          id: '2',
          source: 'dispatch',
          subscribedAt: '2026-03-12T12:00:00.000Z',
          unsubscribedAt: null,
        },
        {
          id: '3',
          source: 'homepage',
          subscribedAt: '2026-02-20T12:00:00.000Z',
          unsubscribedAt: '2026-03-24T12:00:00.000Z',
        },
      ],
      now,
    );

    expect(result.active).toBe(2);
    expect(result.unsubscribed).toBe(1);
    expect(result.newPast30Days).toBe(2);
    expect(result.churnPast30Days).toBe(1);
    expect(result.netPast30Days).toBe(1);
    expect(result.topSources[0]).toEqual({ source: 'dispatch', count: 1 });
  });
});
