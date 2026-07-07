'use server';

import { PATHS } from '@/lib/paths';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  appendBulkMessage,
  parseBulkAccessTier,
  parseBulkSelectedIds,
  resolveBulkReturnPath,
} from '@/lib/admin-bulk-actions';
import { buildAdminActivitySummary } from '@/lib/admin-activity';
import { parsePublishedAtInput } from '@/lib/admin-publish-time';
import {
  bulkUpdateDownloadAccessTiers,
  createAdminActivityLogEntry,
  createDownload,
  getDownloadById,
  updateDownload,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const downloadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  description: z.string().max(500).default(''),
  category: z.string().min(1, 'Category is required'),
  file_url: z.string().min(1, 'File URL is required'),
  file_type: z.string().min(1, 'File type is required'),
  file_size: z.coerce.number().int().positive('File size required'),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  cover_image: z.string().optional(),
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

export async function createDownloadAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const raw = Object.fromEntries(formData.entries());

  const parsed = downloadSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_DOWNLOADS}/new?error=${encodeURIComponent(firstError)}`);
  }

  const {
    title,
    slug,
    description,
    category,
    file_url,
    file_type,
    file_size,
    access_tier,
    cover_image,
    published_at,
  } = parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_DOWNLOADS}/new?error=Invalid+publish+time`);
  }

  const download = await createDownload({
    title,
    slug: finalSlug,
    description,
    category,
    file_url,
    file_type,
    file_size,
    access_tier,
    cover_image: cover_image?.trim() || null,
    published_at: parsedPublishedAt,
  });

  if (!download) {
    redirect(`${PATHS.ADMIN_DOWNLOADS}/new?error=Failed+to+create+download`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'download',
    entity_id: download.id,
    entity_title: download.title,
    action: 'created',
    summary: buildAdminActivitySummary({
      action: 'created',
      entityType: 'download',
      next: {
        title: download.title,
        slug: download.slug,
        publishedAt: download.published_at ?? null,
      },
    }),
    metadata: {
      next: {
        title: download.title,
        slug: download.slug,
        publishedAt: download.published_at ?? null,
        category: download.category,
        accessTier: download.access_tier,
        fileType: download.file_type,
        fileSize: download.file_size,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_DOWNLOADS);
  redirect(PATHS.ADMIN_DOWNLOADS);
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateDownloadAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  if (!id) {
    redirect(`${PATHS.ADMIN_DOWNLOADS}?error=Download+ID+is+required`);
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = downloadSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_DOWNLOADS}/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const {
    title,
    slug,
    description,
    category,
    file_url,
    file_type,
    file_size,
    access_tier,
    cover_image,
    published_at,
  } = parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_DOWNLOADS}/${id}/edit?error=Invalid+publish+time`);
  }

  const previousDownload = await getDownloadById(id);

  const download = await updateDownload(id, {
    title,
    slug: finalSlug,
    description,
    category,
    file_url,
    file_type,
    file_size,
    access_tier,
    cover_image: cover_image?.trim() || null,
    published_at: parsedPublishedAt ?? undefined,
  });

  if (!download) {
    redirect(`${PATHS.ADMIN_DOWNLOADS}/${id}/edit?error=Failed+to+update+download`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'download',
    entity_id: download.id,
    entity_title: download.title,
    action: 'updated',
    summary: buildAdminActivitySummary({
      action: 'updated',
      entityType: 'download',
      previous: previousDownload
        ? {
            title: previousDownload.title,
            slug: previousDownload.slug,
            publishedAt: previousDownload.published_at ?? null,
          }
        : null,
      next: {
        title: download.title,
        slug: download.slug,
        publishedAt: download.published_at ?? null,
      },
    }),
    metadata: {
      previous: previousDownload
        ? {
            title: previousDownload.title,
            slug: previousDownload.slug,
            publishedAt: previousDownload.published_at ?? null,
            category: previousDownload.category,
            accessTier: previousDownload.access_tier,
            fileType: previousDownload.file_type,
            fileSize: previousDownload.file_size,
          }
        : null,
      next: {
        title: download.title,
        slug: download.slug,
        publishedAt: download.published_at ?? null,
        category: download.category,
        accessTier: download.access_tier,
        fileType: download.file_type,
        fileSize: download.file_size,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_DOWNLOADS);
  redirect(PATHS.ADMIN_DOWNLOADS);
}

export async function bulkUpdateDownloadAccessTierAction(
  formData: FormData,
): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const returnPath = resolveBulkReturnPath(
    formData.get('return_path'),
    PATHS.ADMIN_DOWNLOADS,
  );
  const selectedIds = parseBulkSelectedIds(formData);
  const nextAccessTier = parseBulkAccessTier(formData.get('bulk_access_tier'));

  if (selectedIds.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Select at least one download before running a bulk action.',
      }),
    );
  }

  if (!nextAccessTier) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Choose a valid access tier before applying the action.',
      }),
    );
  }

  const result = await bulkUpdateDownloadAccessTiers(selectedIds, nextAccessTier);

  if (!result || result.updated.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Failed to update the selected downloads.',
      }),
    );
  }

  const updatedById = new Map(result.updated.map((download) => [download.id, download]));

  await Promise.all(
    result.previous.map((previousDownload) => {
      const nextDownload = updatedById.get(previousDownload.id);
      if (!nextDownload) return Promise.resolve(null);

      const summary =
        previousDownload.access_tier !== nextDownload.access_tier
          ? `Updated download "${nextDownload.title}": access tier ${previousDownload.access_tier} -> ${nextDownload.access_tier}.`
          : buildAdminActivitySummary({
              action: 'updated',
              entityType: 'download',
              previous: {
                title: previousDownload.title,
                slug: previousDownload.slug,
                publishedAt: previousDownload.published_at ?? null,
              },
              next: {
                title: nextDownload.title,
                slug: nextDownload.slug,
                publishedAt: nextDownload.published_at ?? null,
              },
            });

      return createAdminActivityLogEntry({
        actor_user_id: actor.userId,
        actor_email: actor.member.email,
        actor_role: actor.member.role,
        entity_type: 'download',
        entity_id: nextDownload.id,
        entity_title: nextDownload.title,
        action: 'updated',
        summary,
        metadata: {
          previous: {
            title: previousDownload.title,
            slug: previousDownload.slug,
            publishedAt: previousDownload.published_at ?? null,
            accessTier: previousDownload.access_tier,
            category: previousDownload.category,
            fileType: previousDownload.file_type,
          },
          next: {
            title: nextDownload.title,
            slug: nextDownload.slug,
            publishedAt: nextDownload.published_at ?? null,
            accessTier: nextDownload.access_tier,
            category: nextDownload.category,
            fileType: nextDownload.file_type,
          },
          bulk: true,
        },
      });
    }),
  );

  revalidatePath(PATHS.ADMIN);
  revalidatePath(PATHS.ADMIN_DOWNLOADS);
  redirect(
    appendBulkMessage(returnPath, {
      success: `Updated ${result.updated.length} download${result.updated.length === 1 ? '' : 's'}.`,
    }),
  );
}
