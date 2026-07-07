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
  bulkUpdateArticleStatuses,
  createAdminActivityLogEntry,
  createArticle,
  getArticleById,
  updateArticle,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  lens: z.enum(['health', 'politics', 'culture', 'entertainment', 'business']),
  tags: z.string().default(''),
  excerpt: z.string().max(500).default(''),
  body: z.string().min(1, 'Body is required'),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  status: z
    .enum(['draft', 'review', 'scheduled', 'published', 'archived', 'withdrawn'])
    .default('draft'),
  featured: z.coerce.boolean().default(false),
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

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// ── Create ──────────────────────────────────────────────────────────────────────

export async function createArticleAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const raw = Object.fromEntries(formData.entries());

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_ARTICLES}/new?error=${encodeURIComponent(firstError)}`);
  }

  const {
    title,
    slug,
    lens,
    tags,
    excerpt,
    body,
    access_tier,
    status,
    featured,
    cover_image,
    published_at,
  } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_ARTICLES}/new?error=Invalid+publish+time`);
  }

  if (status === 'scheduled' && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_ARTICLES}/new?error=Scheduled+content+needs+a+publish+time`);
  }

  const article = await createArticle({
    title,
    slug: finalSlug,
    lens,
    tags: parseTags(tags),
    excerpt,
    body,
    access_tier,
    status,
    featured,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
    published_at: parsedPublishedAt,
  });

  if (!article) {
    redirect(`${PATHS.ADMIN_ARTICLES}/new?error=Failed+to+create+article`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'article',
    entity_id: article.id,
    entity_title: article.title,
    action: 'created',
    summary: buildAdminActivitySummary({
      action: 'created',
      entityType: 'article',
      next: {
        title: article.title,
        slug: article.slug,
        status: article.status,
        publishedAt: article.published_at ?? null,
      },
    }),
    metadata: {
      next: {
        title: article.title,
        slug: article.slug,
        status: article.status,
        publishedAt: article.published_at ?? null,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_ARTICLES);
  redirect(PATHS.ADMIN_ARTICLES);
}

// ── Update ──────────────────────────────────────────────────────────────────────

export async function updateArticleAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  if (!id) {
    redirect(`${PATHS.ADMIN_ARTICLES}?error=Article+ID+is+required`);
  }

  const raw = Object.fromEntries(formData.entries());

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_ARTICLES}/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const {
    title,
    slug,
    lens,
    tags,
    excerpt,
    body,
    access_tier,
    status,
    featured,
    cover_image,
    published_at,
  } =
    parsed.data;

  const finalSlug = slug?.trim() || generateSlug(title);
  const parsedPublishedAt = parsePublishedAtInput(published_at);

  if (published_at?.trim() && !parsedPublishedAt) {
    redirect(`${PATHS.ADMIN_ARTICLES}/${id}/edit?error=Invalid+publish+time`);
  }

  if (status === 'scheduled' && !parsedPublishedAt) {
    redirect(
      `${PATHS.ADMIN_ARTICLES}/${id}/edit?error=Scheduled+content+needs+a+publish+time`,
    );
  }

  const previousArticle = await getArticleById(id);

  const article = await updateArticle(id, {
    title,
    slug: finalSlug,
    lens,
    tags: parseTags(tags),
    excerpt,
    body,
    access_tier,
    status,
    featured,
    author: 'The Chairman',
    cover_image: cover_image?.trim() || null,
    published_at: parsedPublishedAt ?? undefined,
  });

  if (!article) {
    redirect(`${PATHS.ADMIN_ARTICLES}/${id}/edit?error=Failed+to+update+article`);
  }

  await createAdminActivityLogEntry({
    actor_user_id: actor.userId,
    actor_email: actor.member.email,
    actor_role: actor.member.role,
    entity_type: 'article',
    entity_id: article.id,
    entity_title: article.title,
    action: 'updated',
    summary: buildAdminActivitySummary({
      action: 'updated',
      entityType: 'article',
      previous: previousArticle
        ? {
            title: previousArticle.title,
            slug: previousArticle.slug,
            status: previousArticle.status,
            publishedAt: previousArticle.published_at ?? null,
          }
        : null,
      next: {
        title: article.title,
        slug: article.slug,
        status: article.status,
        publishedAt: article.published_at ?? null,
      },
    }),
    metadata: {
      previous: previousArticle
        ? {
            title: previousArticle.title,
            slug: previousArticle.slug,
            status: previousArticle.status,
            publishedAt: previousArticle.published_at ?? null,
          }
        : null,
      next: {
        title: article.title,
        slug: article.slug,
        status: article.status,
        publishedAt: article.published_at ?? null,
      },
    },
  });

  revalidatePath(PATHS.ADMIN_ARTICLES);
  redirect(PATHS.ADMIN_ARTICLES);
}

export async function bulkUpdateArticleStatusAction(
  formData: FormData,
): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const returnPath = resolveBulkReturnPath(
    formData.get('return_path'),
    PATHS.ADMIN_ARTICLES,
  );
  const selectedIds = parseBulkSelectedIds(formData);
  const nextStatus = parseBulkContentStatus(formData.get('bulk_status'));

  if (selectedIds.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Select at least one article before running a bulk action.',
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

  const result = await bulkUpdateArticleStatuses(selectedIds, nextStatus);

  if (!result || result.updated.length === 0) {
    redirect(
      appendBulkMessage(returnPath, {
        error: 'Failed to update the selected articles.',
      }),
    );
  }

  const updatedById = new Map(result.updated.map((article) => [article.id, article]));

  await Promise.all(
    result.previous.map((previousArticle) => {
      const nextArticle = updatedById.get(previousArticle.id);
      if (!nextArticle) return Promise.resolve(null);

      return createAdminActivityLogEntry({
        actor_user_id: actor.userId,
        actor_email: actor.member.email,
        actor_role: actor.member.role,
        entity_type: 'article',
        entity_id: nextArticle.id,
        entity_title: nextArticle.title,
        action: 'updated',
        summary: buildAdminActivitySummary({
          action: 'updated',
          entityType: 'article',
          previous: {
            title: previousArticle.title,
            slug: previousArticle.slug,
            status: previousArticle.status,
            publishedAt: previousArticle.published_at ?? null,
          },
          next: {
            title: nextArticle.title,
            slug: nextArticle.slug,
            status: nextArticle.status,
            publishedAt: nextArticle.published_at ?? null,
          },
        }),
        metadata: {
          previous: {
            title: previousArticle.title,
            slug: previousArticle.slug,
            status: previousArticle.status,
            publishedAt: previousArticle.published_at ?? null,
          },
          next: {
            title: nextArticle.title,
            slug: nextArticle.slug,
            status: nextArticle.status,
            publishedAt: nextArticle.published_at ?? null,
          },
          bulk: true,
        },
      });
    }),
  );

  revalidatePath(PATHS.ADMIN);
  revalidatePath(PATHS.ADMIN_ARTICLES);
  redirect(
    appendBulkMessage(returnPath, {
      success: `Updated ${result.updated.length} article${result.updated.length === 1 ? '' : 's'}.`,
    }),
  );
}
