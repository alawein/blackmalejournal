import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Article,
  Briefing,
  ContactSubmission,
  Dispatch,
  Handbook,
  Member,
  NewsletterSubscriber,
} from '@/lib/supabase/types';
import { adminEditPath } from '@/lib/paths';
import {
  summarizeContentActivity,
  summarizeContentPipeline,
  summarizeMemberInsights,
  summarizeMessageInsights,
  summarizeSubscriberInsights,
  type AdminContentRecord,
} from '@/lib/admin-insights';
import { getContentCounts } from './counts';

// ── Admin Insights ───────────────────────────────────────────────────────────

async function getAdminContentRecords(): Promise<AdminContentRecord[]> {
  const supabase = createAdminClient();
  const [articlesResult, briefingsResult, dispatchesResult, handbooksResult] = await Promise.all([
    supabase
      .from('articles')
      .select('id,title,status,published_at,created_at,lens,access_tier')
      .order('created_at', { ascending: false }),
    supabase
      .from('briefings')
      .select('id,title,status,published_at,created_at,issue_number,access_tier')
      .order('created_at', { ascending: false }),
    supabase
      .from('dispatches')
      .select('id,title,status,published_at,created_at,lens')
      .order('created_at', { ascending: false }),
    supabase
      .from('handbooks')
      .select('id,title,status,published_at,created_at,lens,access_tier')
      .order('created_at', { ascending: false }),
  ]);

  if (articlesResult.error) {
    console.error('[getAdminContentRecords:articles]', articlesResult.error.message);
  }
  if (briefingsResult.error) {
    console.error('[getAdminContentRecords:briefings]', briefingsResult.error.message);
  }
  if (dispatchesResult.error) {
    console.error('[getAdminContentRecords:dispatches]', dispatchesResult.error.message);
  }
  if (handbooksResult.error) {
    console.error('[getAdminContentRecords:handbooks]', handbooksResult.error.message);
  }

  const articles = ((articlesResult.data ?? []) as Array<Pick<Article, 'id' | 'title' | 'status' | 'published_at' | 'created_at' | 'lens' | 'access_tier'>>).map(
    (article) => ({
      id: article.id,
      entity: 'article' as const,
      title: article.title,
      status: article.status,
      href: adminEditPath('articles', article.id),
      descriptor: `Article · ${article.lens} · ${article.access_tier}`,
      createdAt: article.created_at,
      publishedAt: article.published_at ?? null,
    }),
  );

  const briefings = ((briefingsResult.data ?? []) as Array<Pick<Briefing, 'id' | 'title' | 'status' | 'published_at' | 'created_at' | 'issue_number' | 'access_tier'>>).map(
    (briefing) => ({
      id: briefing.id,
      entity: 'briefing' as const,
      title: briefing.title,
      status: briefing.status,
      href: adminEditPath('briefings', briefing.id),
      descriptor: `Briefing #${briefing.issue_number} · ${briefing.access_tier}`,
      createdAt: briefing.created_at,
      publishedAt: briefing.published_at ?? null,
    }),
  );

  const dispatches = ((dispatchesResult.data ?? []) as Array<Pick<Dispatch, 'id' | 'title' | 'status' | 'published_at' | 'created_at' | 'lens'>>).map(
    (dispatch) => ({
      id: dispatch.id,
      entity: 'dispatch' as const,
      title: dispatch.title,
      status: dispatch.status,
      href: adminEditPath('dispatches', dispatch.id),
      descriptor: `Dispatch · ${dispatch.lens}`,
      createdAt: dispatch.created_at,
      publishedAt: dispatch.published_at ?? null,
    }),
  );

  const handbooks = ((handbooksResult.data ?? []) as Array<Pick<Handbook, 'id' | 'title' | 'status' | 'published_at' | 'created_at' | 'lens' | 'access_tier'>>).map(
    (handbook) => ({
      id: handbook.id,
      entity: 'handbook' as const,
      title: handbook.title,
      status: handbook.status,
      href: adminEditPath('handbooks', handbook.id),
      descriptor: `Handbook · ${handbook.lens} · ${handbook.access_tier}`,
      createdAt: handbook.created_at,
      publishedAt: handbook.published_at ?? null,
    }),
  );

  return [...articles, ...briefings, ...dispatches, ...handbooks];
}

export async function getAdminContentPipelineInsights() {
  const contentRecords = await getAdminContentRecords();
  return summarizeContentPipeline(contentRecords);
}

export async function getMemberAdminInsights() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('id,tier,role,stripe_customer_id,stripe_subscription_id,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getMemberAdminInsights]', error.message);
    return summarizeMemberInsights([]);
  }

  const members = ((data ?? []) as Array<
    Pick<Member, 'id' | 'tier' | 'role' | 'stripe_customer_id' | 'stripe_subscription_id' | 'created_at'>
  >).map((member) => ({
    id: member.id,
    tier: member.tier,
    role: member.role,
    stripeCustomerId: member.stripe_customer_id,
    stripeSubscriptionId: member.stripe_subscription_id,
    createdAt: member.created_at,
  }));

  return summarizeMemberInsights(members);
}

export async function getMessageAdminInsights() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('id,name,email,subject,status,submitted_at,handled_at')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('[getMessageAdminInsights]', error.message);
    return summarizeMessageInsights([]);
  }

  const submissions = ((data ?? []) as Array<
    Pick<ContactSubmission, 'id' | 'name' | 'email' | 'subject' | 'status' | 'submitted_at' | 'handled_at'>
  >).map((submission) => ({
    id: submission.id,
    name: submission.name,
    email: submission.email,
    subject: submission.subject,
    status: submission.status,
    submittedAt: submission.submitted_at,
    handledAt: submission.handled_at,
  }));

  return summarizeMessageInsights(submissions);
}

export async function getSubscriberAdminInsights() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id,source,subscribed_at,unsubscribed_at')
    .order('subscribed_at', { ascending: false });

  if (error) {
    console.error('[getSubscriberAdminInsights]', error.message);
    return summarizeSubscriberInsights([]);
  }

  const subscribers = ((data ?? []) as Array<
    Pick<NewsletterSubscriber, 'id' | 'source' | 'subscribed_at' | 'unsubscribed_at'>
  >).map((subscriber) => ({
    id: subscriber.id,
    source: subscriber.source,
    subscribedAt: subscriber.subscribed_at,
    unsubscribedAt: subscriber.unsubscribed_at,
  }));

  return summarizeSubscriberInsights(subscribers);
}

export async function getAdminCommandCenterSnapshot() {
  const [counts, contentRecords, members, messages, subscribers] = await Promise.all([
    getContentCounts(),
    getAdminContentRecords(),
    getMemberAdminInsights(),
    getMessageAdminInsights(),
    getSubscriberAdminInsights(),
  ]);

  const pipeline = summarizeContentPipeline(contentRecords);
  const activity = summarizeContentActivity(contentRecords);

  return {
    counts,
    pipeline,
    activity,
    members,
    messages,
    subscribers,
  };
}

