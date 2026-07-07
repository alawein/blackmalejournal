import type {
  Article,
  Briefing,
  Dispatch,
  Download,
  Handbook,
} from '@/lib/supabase/types';

export type PublishReadinessStatus = 'ready' | 'warning' | 'blocked';

export type PublishReadiness = {
  status: PublishReadinessStatus;
  label: string;
  summary: string;
  blockingIssues: string[];
  advisoryIssues: string[];
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function summarizeIssues(issues: string[]): string {
  return issues.slice(0, 2).join(' · ');
}

function finalizeReadiness(
  blockingIssues: string[],
  advisoryIssues: string[] = [],
): PublishReadiness {
  if (blockingIssues.length > 0) {
    return {
      status: 'blocked',
      label: 'Needs Work',
      summary: summarizeIssues(blockingIssues),
      blockingIssues,
      advisoryIssues,
    };
  }

  if (advisoryIssues.length > 0) {
    return {
      status: 'warning',
      label: 'Review',
      summary: summarizeIssues(advisoryIssues),
      blockingIssues,
      advisoryIssues,
    };
  }

  return {
    status: 'ready',
    label: 'Ready',
    summary: 'Ready to publish',
    blockingIssues,
    advisoryIssues,
  };
}

function checkPublishTiming(
  status: string,
  publishedAt: string | null | undefined,
  blockingIssues: string[],
) {
  if (status === 'scheduled' && !hasText(publishedAt)) {
    blockingIssues.push('Missing publish time');
  }

  if (status === 'published' && !hasText(publishedAt)) {
    blockingIssues.push('Missing publish date');
  }
}

export function assessArticleReadiness(article: Article): PublishReadiness {
  const blockingIssues: string[] = [];
  const advisoryIssues: string[] = [];

  if (!hasText(article.title)) blockingIssues.push('Missing title');
  if (!hasText(article.slug)) blockingIssues.push('Missing slug');
  if (!hasText(article.excerpt)) blockingIssues.push('Missing excerpt');
  if (!hasText(article.body)) blockingIssues.push('Missing body');
  if (!hasText(article.cover_image)) blockingIssues.push('Missing cover image');
  if (!hasText(article.author)) blockingIssues.push('Missing author');
  if (article.tags.length === 0) advisoryIssues.push('No tags added');

  checkPublishTiming(article.status, article.published_at, blockingIssues);

  return finalizeReadiness(blockingIssues, advisoryIssues);
}

export function assessBriefingReadiness(briefing: Briefing): PublishReadiness {
  const blockingIssues: string[] = [];

  if (!briefing.issue_number || briefing.issue_number < 1) {
    blockingIssues.push('Missing issue number');
  }
  if (!hasText(briefing.title)) blockingIssues.push('Missing title');
  if (!hasText(briefing.slug)) blockingIssues.push('Missing slug');
  if (!hasText(briefing.cover_image)) blockingIssues.push('Missing cover image');

  const validSections = briefing.sections.filter(
    (section) => hasText(section.title) && hasText(section.body),
  );
  if (validSections.length === 0) {
    blockingIssues.push('Missing populated sections');
  }

  checkPublishTiming(briefing.status, briefing.published_at, blockingIssues);

  return finalizeReadiness(blockingIssues);
}

export function assessDispatchReadiness(dispatch: Dispatch): PublishReadiness {
  const blockingIssues: string[] = [];

  if (!hasText(dispatch.title)) blockingIssues.push('Missing title');
  if (!hasText(dispatch.slug)) blockingIssues.push('Missing slug');
  if (!hasText(dispatch.excerpt)) blockingIssues.push('Missing excerpt');
  if (!hasText(dispatch.body)) blockingIssues.push('Missing body');
  if (!hasText(dispatch.cover_image)) blockingIssues.push('Missing cover image');
  if (!hasText(dispatch.author)) blockingIssues.push('Missing author');

  checkPublishTiming(dispatch.status, dispatch.published_at, blockingIssues);

  return finalizeReadiness(blockingIssues);
}

export function assessHandbookReadiness(handbook: Handbook): PublishReadiness {
  const blockingIssues: string[] = [];

  if (!hasText(handbook.title)) blockingIssues.push('Missing title');
  if (!hasText(handbook.slug)) blockingIssues.push('Missing slug');
  if (!hasText(handbook.description)) blockingIssues.push('Missing description');
  if (!hasText(handbook.body)) blockingIssues.push('Missing body');
  if (!hasText(handbook.cover_image)) blockingIssues.push('Missing cover image');
  if (!hasText(handbook.file_url)) blockingIssues.push('Missing handbook file');
  if (!hasText(handbook.author)) blockingIssues.push('Missing author');

  checkPublishTiming(handbook.status, handbook.published_at, blockingIssues);

  return finalizeReadiness(blockingIssues);
}

export function assessDownloadReadiness(download: Download): PublishReadiness {
  const blockingIssues: string[] = [];
  const advisoryIssues: string[] = [];

  if (!hasText(download.title)) blockingIssues.push('Missing title');
  if (!hasText(download.slug)) blockingIssues.push('Missing slug');
  if (!hasText(download.description)) blockingIssues.push('Missing description');
  if (!hasText(download.category)) blockingIssues.push('Missing category');
  if (!hasText(download.file_url)) blockingIssues.push('Missing file');
  if (!hasText(download.file_type)) blockingIssues.push('Missing file type');
  if (!download.file_size || download.file_size < 1) {
    blockingIssues.push('Missing file size');
  }
  if (!hasText(download.cover_image)) advisoryIssues.push('No cover image');

  return finalizeReadiness(blockingIssues, advisoryIssues);
}

export function summarizePublishReadiness(items: PublishReadiness[]) {
  return items.reduce(
    (summary, item) => {
      summary[item.status] += 1;
      return summary;
    },
    { ready: 0, warning: 0, blocked: 0 } as Record<PublishReadinessStatus, number>,
  );
}
