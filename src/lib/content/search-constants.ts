import { FileText, BookOpen, Newspaper, Send } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import type { SearchContentType } from '@/lib/supabase/types';

export const SEARCH_TYPE_ICONS = {
  article: FileText,
  briefing: Newspaper,
  handbook: BookOpen,
  dispatch: Send,
} as const;

export const SEARCH_TYPE_PATHS = {
  article: PATHS.ARTICLES,
  briefing: PATHS.BRIEFINGS,
  handbook: PATHS.HANDBOOKS,
  dispatch: PATHS.BLOG,
} as const;

export const SEARCH_TYPE_LABELS: Record<SearchContentType, string> = {
  article: 'Article',
  briefing: 'Briefing',
  handbook: 'Handbook',
  dispatch: 'Dispatch',
};

export const SEARCH_SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Newest first' },
] as const;

export type SearchSortValue = (typeof SEARCH_SORT_OPTIONS)[number]['value'];
