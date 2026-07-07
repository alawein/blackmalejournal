import type { AdminActivityAction, AdminActivityEntityType } from '@/lib/supabase/types';

export type ActivitySnapshot = {
  title: string;
  slug?: string | null;
  status?: string | null;
  publishedAt?: string | null;
};

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) return 'not set';
  return `${new Date(iso).toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

function entityLabel(entityType: AdminActivityEntityType): string {
  return entityType;
}

function sentenceCase(action: AdminActivityAction): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function buildAdminActivitySummary({
  action,
  entityType,
  previous,
  next,
}: {
  action: AdminActivityAction;
  entityType: AdminActivityEntityType;
  previous?: ActivitySnapshot | null;
  next?: ActivitySnapshot | null;
}): string {
  const label = entityLabel(entityType);

  if (action === 'created' && next) {
    return `Created ${label} "${next.title}"${next.status ? ` as ${next.status}` : ''}.`;
  }

  if (action === 'deleted' && previous) {
    return `Deleted ${label} "${previous.title}".`;
  }

  if (action === 'updated' && previous && next) {
    const changes: string[] = [];

    if (previous.title !== next.title) {
      changes.push(`retitled "${previous.title}" to "${next.title}"`);
    }

    if (previous.status !== next.status && next.status) {
      changes.push(
        `status ${previous.status ?? 'unset'} -> ${next.status}`,
      );
    }

    if (previous.publishedAt !== next.publishedAt) {
      changes.push(
        `publish time ${formatPublishedAt(previous.publishedAt)} -> ${formatPublishedAt(next.publishedAt)}`,
      );
    }

    if (previous.slug !== next.slug && next.slug) {
      changes.push(`slug -> ${next.slug}`);
    }

    if (changes.length === 0) {
      return `Updated ${label} "${next.title}".`;
    }

    return `Updated ${label} "${next.title}": ${changes.join('; ')}.`;
  }

  if (next?.title) {
    return `${sentenceCase(action)} ${label} "${next.title}".`;
  }

  if (previous?.title) {
    return `${sentenceCase(action)} ${label} "${previous.title}".`;
  }

  return `${sentenceCase(action)} ${label}.`;
}
