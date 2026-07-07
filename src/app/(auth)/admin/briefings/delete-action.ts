'use server';

import { PATHS } from '@/lib/paths';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { buildAdminActivitySummary } from '@/lib/admin-activity';
import {
  createAdminActivityLogEntry,
  deleteBriefing,
  getBriefingById,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteBriefingAction(id: string): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const briefing = await getBriefingById(id);
  const success = await deleteBriefing(id);
  if (!success) {
    redirect(`${PATHS.ADMIN_BRIEFINGS}?error=Failed+to+delete+briefing`);
  }

  if (briefing) {
    await createAdminActivityLogEntry({
      actor_user_id: actor.userId,
      actor_email: actor.member.email,
      actor_role: actor.member.role,
      entity_type: 'briefing',
      entity_id: briefing.id,
      entity_title: briefing.title,
      action: 'deleted',
      summary: buildAdminActivitySummary({
        action: 'deleted',
        entityType: 'briefing',
        previous: {
          title: briefing.title,
          slug: briefing.slug,
          status: briefing.status,
          publishedAt: briefing.published_at ?? null,
        },
      }),
      metadata: {
        previous: {
          title: briefing.title,
          slug: briefing.slug,
          status: briefing.status,
          publishedAt: briefing.published_at ?? null,
          issueNumber: briefing.issue_number,
        },
      },
    });
  }

  revalidatePath(PATHS.ADMIN_BRIEFINGS);
  redirect(PATHS.ADMIN_BRIEFINGS);
}
