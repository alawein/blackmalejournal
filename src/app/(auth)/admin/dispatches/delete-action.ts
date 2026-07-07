'use server';

import { PATHS } from '@/lib/paths';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { buildAdminActivitySummary } from '@/lib/admin-activity';
import {
  createAdminActivityLogEntry,
  deleteDispatch,
  getDispatchById,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteDispatchAction(id: string): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const dispatch = await getDispatchById(id);
  const success = await deleteDispatch(id);
  if (!success) {
    redirect(`${PATHS.ADMIN_DISPATCHES}?error=Failed+to+delete+dispatch`);
  }

  if (dispatch) {
    await createAdminActivityLogEntry({
      actor_user_id: actor.userId,
      actor_email: actor.member.email,
      actor_role: actor.member.role,
      entity_type: 'dispatch',
      entity_id: dispatch.id,
      entity_title: dispatch.title,
      action: 'deleted',
      summary: buildAdminActivitySummary({
        action: 'deleted',
        entityType: 'dispatch',
        previous: {
          title: dispatch.title,
          slug: dispatch.slug,
          status: dispatch.status,
          publishedAt: dispatch.published_at ?? null,
        },
      }),
      metadata: {
        previous: {
          title: dispatch.title,
          slug: dispatch.slug,
          status: dispatch.status,
          publishedAt: dispatch.published_at ?? null,
          lens: dispatch.lens,
        },
      },
    });
  }

  revalidatePath(PATHS.ADMIN_DISPATCHES);
  redirect(PATHS.ADMIN_DISPATCHES);
}
