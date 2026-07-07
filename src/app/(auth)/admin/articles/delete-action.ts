'use server';

import { PATHS } from '@/lib/paths';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { buildAdminActivitySummary } from '@/lib/admin-activity';
import {
  createAdminActivityLogEntry,
  deleteArticle,
  getArticleById,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteArticleAction(id: string): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const article = await getArticleById(id);
  const success = await deleteArticle(id);
  if (!success) {
    redirect(`${PATHS.ADMIN_ARTICLES}?error=Failed+to+delete+article`);
  }

  if (article) {
    await createAdminActivityLogEntry({
      actor_user_id: actor.userId,
      actor_email: actor.member.email,
      actor_role: actor.member.role,
      entity_type: 'article',
      entity_id: article.id,
      entity_title: article.title,
      action: 'deleted',
      summary: buildAdminActivitySummary({
        action: 'deleted',
        entityType: 'article',
        previous: {
          title: article.title,
          slug: article.slug,
          status: article.status,
          publishedAt: article.published_at ?? null,
        },
      }),
      metadata: {
        previous: {
          title: article.title,
          slug: article.slug,
          status: article.status,
          publishedAt: article.published_at ?? null,
        },
      },
    });
  }

  revalidatePath(PATHS.ADMIN_ARTICLES);
  redirect(PATHS.ADMIN_ARTICLES);
}
