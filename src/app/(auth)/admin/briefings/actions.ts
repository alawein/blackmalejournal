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
  bulkUpdateBriefingStatuses,
  createAdminActivityLogEntry,
  createBriefing,
  getBriefingById,
  updateBriefing,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';
import type { BriefingSection } from '@/lib/supabase/types';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const briefingSchema = z.object({
  issue_number: z.coerce.number().int().positive('Issue number required'),
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  status: z
    .enum(['draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'])
    .default('draft'),
  cover_image: z.string().optional(),
  sections_json: z.string().min(1, 'At least one section required'),
  published_at: z.string().optional(),
});

// ── Helpers ─────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseSections(raw: string): BriefingSection[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    for (const section of parsed) {
      if (typeof section.title !== 'string' || typeof section.body !== 'string') {
        return null;
      }
    }
    return parsed as BriefingSection[];
  } catch {
    return null;
  }
}

// ── Create ──────────────────────────────────────────────────────────────────────

export async function createBriefingAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const raw = Object.fromEntries(formData.entries());

  const parsed = briefingSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_BRIEFINGS}/new?error=${encodeURIComponent(firstError)}`);
  }

  const {
    issue_number,
    title,
    slug,
    access_tier,
    status,
    cover_image,
    sections_json,
    published_at,
  } =
    parsed.data;

  const sections = parseSections(sections_json);
  if (!sections) {
    redirect(`${PATHS.ADMIN_BRIEFINGS}/new?error=Invalid+sections+JSON`);
  }

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_BRIEFINGS}/new?error=Invalid+publish+time`);
  }

  if (status === 'scheduled' && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_BRIEFINGS}/new?error=Scheduled+content+needs+a+publish+time`);
  }

  const briefing = await createBriefing({
    issue_number,
    title,
    slug: finalSlug,
    sections,
    access_tier,
    status,
    cover_image: cover_image?.trim() || null,
    published_at: parsedPublishedAt,
  });

  if (!briefing) {
    redirect(`${PATHS.ADMIN_BRIEFINGS}/new?error=Failed+to+create+briefing`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'briefing',
    entity_id: briefing.id,
    entity_title: briefing.title,
    action: 'created',
    summary: buildAdminActivitySummary({
      action: 'created',
      entityType: 'briefing',
      next: {
        title: briefing.title,
        slug: briefing.slug,
        status: briefing.status,
        publishedAt: briefing.published_at ?? null,
      },
    }),
    metadata: {
      next: {
        title: briefing.title,
        slug: briefing.slug,
        status: briefing.status,
        publishedAt: briefing.published_at ?? null,
        issueNumber: briefing.issue_number,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_BRIEFINGS);
  redirect(PATHS.ADMIN_BRIEFINGS);
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateBriefingAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  if (!id) {
    redirect(`${PATHS.ADMIN_BRIEFINGS}?error=Briefing+ID+is+required`);
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = briefingSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_BRIEFINGS}/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const {
    issue_number,
    title,
    slug,
    access_tier,
    status,
    cover_image,
    sections_json,
    published_at,
  } =
    parsed.data;

  const sections = parseSections(sections_json);
  if (!sections) {
    redirect(`${PATHS.ADMIN_BRIEFINGS}/${id}/edit?error=Invalid+sections+JSON`);
  }

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_BRIEFINGS}/${id}/edit?error=Invalid+publish+time`);
  }

  if (status === 'scheduled' && !parsedPublishedAt) {
    redirect(
      `${PATHS.ADMIN_BRIEFINGS}/${id}/edit?error=Scheduled+content+needs+a+publish+time`,
    );
  }

  const previousBriefing = await getBriefingById(id);

  const briefing = await updateBriefing(id, {
    issue_number,
    title,
    slug: finalSlug,
    sections,
    access_tier,
    status,
    cover_image: cover_image?.trim() || null,
    published_at: parsedPublishedAt ?? undefined,
  });

  if (!briefing) {
    redirect(`${PATHS.ADMIN_BRIEFINGS}/${id}/edit?error=Failed+to+update+briefing`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'briefing',
    entity_id: briefing.id,
    entity_title: briefing.title,
    action: 'updated',
    summary: buildAdminActivitySummary({
      action: 'updated',
      entityType: 'briefing',
      previous: previousBriefing
        ? {
            title: previousBriefing.title,
            slug: previousBriefing.slug,
            status: previousBriefing.status,
            publishedAt: previousBriefing.published_at ?? null,
          }
        : null,
      next: {
        title: briefing.title,
        slug: briefing.slug,
        status: briefing.status,
        publishedAt: briefing.published_at ?? null,
      },
    }),
    metadata: {
      previous: previousBriefing
        ? {
            title: previousBriefing.title,
            slug: previousBriefing.slug,
            status: previousBriefing.status,
            publishedAt: previousBriefing.published_at ?? null,
            issueNumber: previousBriefing.issue_number,
          }
        : null,
      next: {
        title: briefing.title,
        slug: briefing.slug,
        status: briefing.status,
        publishedAt: briefing.published_at ?? null,
        issueNumber: briefing.issue_number,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_BRIEFINGS);
  redirect(PATHS.ADMIN_BRIEFINGS);
}

export async function bulkUpdateBriefingStatusAction(
  formData: FormData,
): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const returnPath = resolveBulkReturnPath(
    formData.get('return_path'),
    PATHS.ADMIN_BRIEFINGS,
  );
  const selectedIds = parseBulkSelectedIds(formData);
  const nextStatus = parseBulkContentStatus(formData.get('bulk_status'));

  if (selectedIds.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Select at least one briefing before running a bulk action.',
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

  const result = await bulkUpdateBriefingStatuses(selectedIds, nextStatus);

  if (!result || result.updated.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Failed to update the selected briefings.',
      }),
    );
  }

  const updatedById = new Map(result.updated.map((briefing) => [briefing.id, briefing]));

  await Promise.all(
    result.previous.map((previousBriefing) => {
      const nextBriefing = updatedById.get(previousBriefing.id);
      if (!nextBriefing) return Promise.resolve(null);

      return createAdminActivityLogEntry({
        actor_user_id: actor.userId,
        actor_email: actor.member.email,
        actor_role: actor.member.role,
        entity_type: 'briefing',
        entity_id: nextBriefing.id,
        entity_title: nextBriefing.title,
        action: 'updated',
        summary: buildAdminActivitySummary({
          action: 'updated',
          entityType: 'briefing',
          previous: {
            title: previousBriefing.title,
            slug: previousBriefing.slug,
            status: previousBriefing.status,
            publishedAt: previousBriefing.published_at ?? null,
          },
          next: {
            title: nextBriefing.title,
            slug: nextBriefing.slug,
            status: nextBriefing.status,
            publishedAt: nextBriefing.published_at ?? null,
          },
        }),
        metadata: {
          previous: {
            title: previousBriefing.title,
            slug: previousBriefing.slug,
            status: previousBriefing.status,
            publishedAt: previousBriefing.published_at ?? null,
            issueNumber: previousBriefing.issue_number,
          },
          next: {
            title: nextBriefing.title,
            slug: nextBriefing.slug,
            status: nextBriefing.status,
            publishedAt: nextBriefing.published_at ?? null,
            issueNumber: nextBriefing.issue_number,
          },
          bulk: true,
        },
      });
    }),
  );

  revalidatePath(PATHS.ADMIN);
  revalidatePath(PATHS.ADMIN_BRIEFINGS);
  redirect(
    appendBulkMessage(returnPath, {
      success: `Updated ${result.updated.length} briefing${result.updated.length === 1 ? '' : 's'}.`,
    }),
  );
}
