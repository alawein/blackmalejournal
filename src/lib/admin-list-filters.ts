import { getLensTheme } from '@/lib/lens-theme';
import type { ContentStatus, Lens } from '@/lib/supabase/types';

export const ADMIN_CONTENT_STATUS_TABS: Array<{
  label: string;
  value: ContentStatus | undefined;
}> = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

const ADMIN_LENS_VALUES: Lens[] = [
  'health',
  'politics',
  'culture',
  'entertainment',
  'business',
];

export const ADMIN_LENS_OPTIONS = ADMIN_LENS_VALUES.map((value) => ({
  value,
  label: getLensTheme(value).label,
}));
