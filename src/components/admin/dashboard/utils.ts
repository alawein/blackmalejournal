import type { AdminContentEntity } from '@/lib/admin-insights';

export const contentLabels: Record<AdminContentEntity, string> = {
  article: 'Article',
  briefing: 'Briefing',
  dispatch: 'Dispatch',
  handbook: 'Handbook',
};

export function formatDate(iso: string | null): string {
  if (!iso) return 'No date set';

  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
