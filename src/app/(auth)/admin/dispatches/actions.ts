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
  bulkUpdateDispatchStatuses,
  createAdminActivityLogEntry,
  createDispatch,
  getDispatchById,
  updateDispatch,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const dispatchSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  lens: z.enum(['health', 'politics', 'culture', 'entertainment', 'business']),
  excerpt: z.string().max(500).default(''),
  body: z.string().min(1, 'Body is required'),
  status: z
    .enum(['draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'])
    .default('draft'),
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

export async function createDispatchAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const raw = Object.fromEntries(formData.entries());

  const parsed = dispatchSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_DISPATCHES}/new?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, lens, excerpt, body, status, cover_image, published_at } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_DISPATCHES}/new?error=Invalid+publish+time`);
  }

  if (status === 'scheduled' && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_DISPATCHES}/new?error=Scheduled+content+needs+a+publish+time`);
  }

  const dispatch = await createDispatch({
    title,
    slug: finalSlug,
    lens,
    excerpt,
    body,
    status,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
    published_at: parsedPublishedAt,
  });

  if (!dispatch) {
    redirect(`${PATHS.ADMIN_DISPATCHES}/new?error=Failed+to+create+dispatch`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'dispatch',
    entity_id: dispatch.id,
    entity_title: dispatch.title,
    action: 'created',
    summary: buildAdminActivitySummary({
      action: 'created',
      entityType: 'dispatch',
      next: {
        title: dispatch.title,
        slug: dispatch.slug,
        status: dispatch.status,
        publishedAt: dispatch.published_at ?? null,
      },
    }),
    metadata: {
      next: {
        title: dispatch.title,
        slug: dispatch.slug,
        status: dispatch.status,
        publishedAt: dispatch.published_at ?? null,
        lens: dispatch.lens,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_DISPATCHES);
  redirect(PATHS.ADMIN_DISPATCHES);
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateDispatchAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  if (!id) {
    redirect(`${PATHS.ADMIN_DISPATCHES}?error=Dispatch+ID+is+required`);
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = dispatchSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_DISPATCHES}/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, lens, excerpt, body, status, cover_image, published_at } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_DISPATCHES}/${id}/edit?error=Invalid+publish+time`);
  }

  if (status === 'scheduled' && !parsedPublishedAt) {
    redirect(
      `${PATHS.ADMIN_DISPATCHES}/${id}/edit?error=Scheduled+content+needs+a+publish+time`,
    );
  }

  const previousDispatch = await getDispatchById(id);

  const dispatch = await updateDispatch(id, {
    title,
    slug: finalSlug,
    lens,
    excerpt,
    body,
    status,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
    published_at: parsedPublishedAt ?? undefined,
  });

  if (!dispatch) {
    redirect(`${PATHS.ADMIN_DISPATCHES}/${id}/edit?error=Failed+to+update+dispatch`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'dispatch',
    entity_id: dispatch.id,
    entity_title: dispatch.title,
    action: 'updated',
    summary: buildAdminActivitySummary({
      action: 'updated',
      entityType: 'dispatch',
      previous: previousDispatch
        ? {
            title: previousDispatch.title,
            slug: previousDispatch.slug,
            status: previousDispatch.status,
            publishedAt: previousDispatch.published_at ?? null,
          }
        : null,
      next: {
        title: dispatch.title,
        slug: dispatch.slug,
        status: dispatch.status,
        publishedAt: dispatch.published_at ?? null,
      },
    }),
    metadata: {
      previous: previousDispatch
        ? {
            title: previousDispatch.title,
            slug: previousDispatch.slug,
            status: previousDispatch.status,
            publishedAt: previousDispatch.published_at ?? null,
            lens: previousDispatch.lens,
          }
        : null,
      next: {
        title: dispatch.title,
        slug: dispatch.slug,
        status: dispatch.status,
        publishedAt: dispatch.published_at ?? null,
        lens: dispatch.lens,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_DISPATCHES);
  redirect(PATHS.ADMIN_DISPATCHES);
}

export async function bulkUpdateDispatchStatusAction(
  formData: FormData,
): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const returnPath = resolveBulkReturnPath(
    formData.get('return_path'),
    PATHS.ADMIN_DISPATCHES,
  );
  const selectedIds = parseBulkSelectedIds(formData);
  const nextStatus = parseBulkContentStatus(formData.get('bulk_status'));

  if (selectedIds.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Select at least one dispatch before running a bulk action.',
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

  const result = await bulkUpdateDispatchStatuses(selectedIds, nextStatus);

  if (!result || result.updated.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Failed to update the selected dispatches.',
      }),
    );
  }

  const updatedById = new Map(result.updated.map((dispatch) => [dispatch.id, dispatch]));

  await Promise.all(
    result.previous.map((previousDispatch) => {
      const nextDispatch = updatedById.get(previousDispatch.id);
      if (!nextDispatch) return Promise.resolve(null);

      return createAdminActivityLogEntry({
        actor_user_id: actor.userId,
        actor_email: actor.member.email,
        actor_role: actor.member.role,
        entity_type: 'dispatch',
        entity_id: nextDispatch.id,
        entity_title: nextDispatch.title,
        action: 'updated',
        summary: buildAdminActivitySummary({
          action: 'updated',
          entityType: 'dispatch',
          previous: {
            title: previousDispatch.title,
            slug: previousDispatch.slug,
            status: previousDispatch.status,
            publishedAt: previousDispatch.published_at ?? null,
          },
          next: {
            title: nextDispatch.title,
            slug: nextDispatch.slug,
            status: nextDispatch.status,
            publishedAt: nextDispatch.published_at ?? null,
          },
        }),
        metadata: {
          previous: {
            title: previousDispatch.title,
            slug: previousDispatch.slug,
            status: previousDispatch.status,
            publishedAt: previousDispatch.published_at ?? null,
            lens: previousDispatch.lens,
          },
          next: {
            title: nextDispatch.title,
            slug: nextDispatch.slug,
            status: nextDispatch.status,
            publishedAt: nextDispatch.published_at ?? null,
            lens: nextDispatch.lens,
          },
          bulk: true,
        },
      });
    }),
  );

  revalidatePath(PATHS.ADMIN);
  revalidatePath(PATHS.ADMIN_DISPATCHES);
  redirect(
    appendBulkMessage(returnPath, {
      success: `Updated ${result.updated.length} dispatch${result.updated.length === 1 ? '' : 'es'}.`,
    }),
  );
}
