'use server';

import { PATHS } from '@/lib/paths';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { buildAdminActivitySummary } from '@/lib/admin-activity';
import {
  createAdminActivityLogEntry,
  deleteHandbook,
  getHandbookById,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteHandbookAction(id: string): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const handbook = await getHandbookById(id);
  const success = await deleteHandbook(id);
  if (!success) {
    redirect(`${PATHS.ADMIN_HANDBOOKS}?error=Failed+to+delete+handbook`);
  }

  if (handbook) {
    await createAdminActivityLogEntry({
      actor_user_id: actor.userId,
      actor_email: actor.member.email,
      actor_role: actor.member.role,
      entity_type: 'handbook',
      entity_id: handbook.id,
      entity_title: handbook.title,
      action: 'deleted',
      summary: buildAdminActivitySummary({
        action: 'deleted',
        entityType: 'handbook',
        previous: {
          title: handbook.title,
          slug: handbook.slug,
          status: handbook.status,
          publishedAt: handbook.published_at ?? null,
        },
      }),
      metadata: {
        previous: {
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
  }

  revalidatePath(PATHS.ADMIN_HANDBOOKS);
  redirect(PATHS.ADMIN_HANDBOOKS);
}
