'use server';

import { PATHS } from '@/lib/paths';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  appendBulkMessage,
  parseBulkContentStatus,
  parseBulkSelectedIds,
  resolveBulkReturnPath,
} from '@/lib/admin-bulk-actions';
import { buildAdminActivitySummary } from '@/lib/admin-activity';
import { parsePublishedAtInput } from '@/lib/admin-publish-time';
import {
  bulkUpdateHandbookStatuses,
  createAdminActivityLogEntry,
  createHandbook,
  getHandbookById,
  updateHandbook,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const handbookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  lens: z.enum(['health', 'politics', 'culture', 'entertainment', 'business']),
  description: z.string().max(500).default(''),
  body: z.string().min(1, 'Body is required'),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  status: z
    .enum(['draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'])
    .default('draft'),
  cover_image: z.string().optional(),
  file_url: z.string().optional(),
  published_at: z.string().optional(),
});

// ── Helpers ─────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ── Create ──────────────────────────────────────────────────────────────────────

export async function createHandbookAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const raw = Object.fromEntries(formData.entries());

  const parsed = handbookSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_HANDBOOKS}/new?error=${encodeURIComponent(firstError)}`);
  }

  const {
    title,
    slug,
    lens,
    description,
    body,
    access_tier,
    status,
    cover_image,
    file_url,
    published_at,
  } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_HANDBOOKS}/new?error=Invalid+publish+time`);
  }

  if (status === 'scheduled' && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_HANDBOOKS}/new?error=Scheduled+content+needs+a+publish+time`);
  }

  const handbook = await createHandbook({
    title,
    slug: finalSlug,
    lens,
    description,
    body,
    access_tier,
    status,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
    file_url: file_url?.trim() || null,
    published_at: parsedPublishedAt,
  });

  if (!handbook) {
    redirect(`${PATHS.ADMIN_HANDBOOKS}/new?error=Failed+to+create+handbook`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'handbook',
    entity_id: handbook.id,
    entity_title: handbook.title,
    action: 'created',
    summary: buildAdminActivitySummary({
      action: 'created',
      entityType: 'handbook',
      next: {
        title: handbook.title,
        slug: handbook.slug,
        status: handbook.status,
        publishedAt: handbook.published_at ?? null,
      },
    }),
    metadata: {
      next: {
        title: handbook.title,
        slug: handbook.slug,
        status: handbook.status,
        publishedAt: handbook.published_at ?? null,
        lens: handbook.lens,
        accessTier: handbook.access_tier,
        fileUrl: handbook.file_url,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_HANDBOOKS);
  redirect(PATHS.ADMIN_HANDBOOKS);
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateHandbookAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  if (!id) {
    redirect(`${PATHS.ADMIN_HANDBOOKS}?error=Handbook+ID+is+required`);
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = handbookSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_HANDBOOKS}/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const {
    title,
    slug,
    lens,
    description,
    body,
    access_tier,
    status,
    cover_image,
    file_url,
    published_at,
  } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_HANDBOOKS}/${id}/edit?error=Invalid+publish+time`);
  }

  if (status === 'scheduled' && !parsedPublishedAt) {
    redirect(
      `${PATHS.ADMIN_HANDBOOKS}/${id}/edit?error=Scheduled+content+needs+a+publish+time`,
    );
  }

  const previousHandbook = await getHandbookById(id);

  const handbook = await updateHandbook(id, {
    title,
    slug: finalSlug,
    lens,
    description,
    body,
    access_tier,
    status,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
    file_url: file_url?.trim() || null,
    published_at: parsedPublishedAt ?? undefined,
  });

  if (!handbook) {
    redirect(`${PATHS.ADMIN_HANDBOOKS}/${id}/edit?error=Failed+to+update+handbook`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'handbook',
    entity_id: handbook.id,
    entity_title: handbook.title,
    action: 'updated',
    summary: buildAdminActivitySummary({
      action: 'updated',
      entityType: 'handbook',
      previous: previousHandbook
        ? {
            title: previousHandbook.title,
            slug: previousHandbook.slug,
            status: previousHandbook.status,
            publishedAt: previousHandbook.published_at ?? null,
          }
        : null,
      next: {
        title: handbook.title,
        slug: handbook.slug,
        status: handbook.status,
        publishedAt: handbook.published_at ?? null,
      },
    }),
    metadata: {
      previous: previousHandbook
        ? {
            title: previousHandbook.title,
            slug: previousHandbook.slug,
            status: previousHandbook.status,
            publishedAt: previousHandbook.published_at ?? null,
            lens: previousHandbook.lens,
            accessTier: previousHandbook.access_tier,
            fileUrl: previousHandbook.file_url,
          }
        : null,
      next: {
        title: handbook.title,
        slug: handbook.slug,
        status: handbook.status,
        publishedAt: handbook.published_at ?? null,
        lens: handbook.lens,
        accessTier: handbook.access_tier,
        fileUrl: handbook.file_url,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_HANDBOOKS);
  redirect(PATHS.ADMIN_HANDBOOKS);
}

export async function bulkUpdateHandbookStatusAction(
  formData: FormData,
): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const returnPath = resolveBulkReturnPath(
    formData.get('return_path'),
    PATHS.ADMIN_HANDBOOKS,
  );
  const selectedIds = parseBulkSelectedIds(formData);
  const nextStatus = parseBulkContentStatus(formData.get('bulk_status'));

  if (selectedIds.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Select at least one handbook before running a bulk action.',
      }),
    );
  }

  if (!nextStatus) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Choose a valid bulk status before applying the action.',
      }),
    );
  }

  const result = await bulkUpdateHandbookStatuses(selectedIds, nextStatus);

  if (!result || result.updated.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Failed to update the selected handbooks.',
      }),
    );
  }

  const updatedById = new Map(result.updated.map((handbook) => [handbook.id, handbook]));

  await Promise.all(
    result.previous.map((previousHandbook) => {
      const nextHandbook = updatedById.get(previousHandbook.id);
      if (!nextHandbook) return Promise.resolve(null);

      return createAdminActivityLogEntry({
        actor_user_id: actor.userId,
        actor_email: actor.member.email,
        actor_role: actor.member.role,
        entity_type: 'handbook',
        entity_id: nextHandbook.id,
        entity_title: nextHandbook.title,
        action: 'updated',
        summary: buildAdminActivitySummary({
          action: 'updated',
          entityType: 'handbook',
          previous: {
            title: previousHandbook.title,
            slug: previousHandbook.slug,
            status: previousHandbook.status,
            publishedAt: previousHandbook.published_at ?? null,
          },
          next: {
            title: nextHandbook.title,
            slug: nextHandbook.slug,
            status: nextHandbook.status,
            publishedAt: nextHandbook.published_at ?? null,
          },
        }),
        metadata: {
          previous: {
            title: previousHandbook.title,
            slug: previousHandbook.slug,
            status: previousHandbook.status,
            publishedAt: previousHandbook.published_at ?? null,
            lens: previousHandbook.lens,
            accessTier: previousHandbook.access_tier,
            fileUrl: previousHandbook.file_url,
          },
          next: {
            title: nextHandbook.title,
            slug: nextHandbook.slug,
            status: nextHandbook.status,
            publishedAt: nextHandbook.published_at ?? null,
            lens: nextHandbook.lens,
            accessTier: nextHandbook.access_tier,
            fileUrl: nextHandbook.file_url,
          },
          bulk: true,
        },
      });
    }),
  );

  revalidatePath(PATHS.ADMIN);
  revalidatePath(PATHS.ADMIN_HANDBOOKS);
  redirect(
    appendBulkMessage(returnPath, {
      success: `Updated ${result.updated.length} handbook${result.updated.length === 1 ? '' : 's'}.`,
    }),
  );
}
