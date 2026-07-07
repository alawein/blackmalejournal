import type { AccessTier, ContentStatus } from '@/lib/supabase/types';
import { appendQuery, normalizeInternalPath } from '@/lib/paths';

export type BulkContentStatus = Exclude<ContentStatus, 'scheduled'>;

export const ADMIN_BULK_STATUS_OPTIONS: Array<{
  label: string;
  value: BulkContentStatus;
}> = [
  { label: 'Move to Draft', value: 'draft' },
  { label: 'Move to Review', value: 'review' },
  { label: 'Publish Now', value: 'published' },
  { label: 'Archive', value: 'archived' },
  { label: 'Withdraw', value: 'withdrawn' },
];

export const ADMIN_BULK_DOWNLOAD_TIER_OPTIONS: Array<{
  label: string;
  value: AccessTier;
}> = [
  { label: 'Set Free', value: 'free' },
  { label: 'Set Basic', value: 'basic' },
  { label: 'Set Premium', value: 'premium' },
];

const BULK_STATUS_VALUES = new Set<BulkContentStatus>(
  ADMIN_BULK_STATUS_OPTIONS.map((option) => option.value),
);

const BULK_TIER_VALUES = new Set<AccessTier>(
  ADMIN_BULK_DOWNLOAD_TIER_OPTIONS.map((option) => option.value),
);

export function parseBulkSelectedIds(formData: FormData): string[] {
  return [...new Set(
    formData
      .getAll('selected_ids')
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean),
  )];
}

export function parseBulkContentStatus(
  value: FormDataEntryValue | null,
): BulkContentStatus | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim() as BulkContentStatus;
  return BULK_STATUS_VALUES.has(trimmed) ? trimmed : null;
}

export function parseBulkAccessTier(
  value: FormDataEntryValue | null,
): AccessTier | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim() as AccessTier;
  return BULK_TIER_VALUES.has(trimmed) ? trimmed : null;
}

export function resolveBulkReturnPath(
  value: FormDataEntryValue | null,
  fallback: string,
): string {
  return normalizeInternalPath(value, fallback);
}

export function appendBulkMessage(
  path: string,
  params: { error?: string; success?: string },
): string {
  return appendQuery(path, params);
}
