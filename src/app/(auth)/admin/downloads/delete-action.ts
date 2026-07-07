'use server';

import { PATHS } from '@/lib/paths';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { buildAdminActivitySummary } from '@/lib/admin-activity';
import {
  createAdminActivityLogEntry,
  deleteDownload,
  getDownloadById,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';

export async function deleteDownloadAction(id: string): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const download = await getDownloadById(id);
  const success = await deleteDownload(id);
  if (!success) {
    redirect(`${PATHS.ADMIN_DOWNLOADS}?error=Failed+to+delete+download`);
  }

  if (download) {
    await createAdminActivityLogEntry({
      actor_user_id: actor.userId,
      actor_email: actor.member.email,
      actor_role: actor.member.role,
      entity_type: 'download',
      entity_id: download.id,
      entity_title: download.title,
      action: 'deleted',
      summary: buildAdminActivitySummary({
        action: 'deleted',
        entityType: 'download',
        previous: {
          title: download.title,
          slug: download.slug,
          publishedAt: download.published_at ?? null,
        },
      }),
      metadata: {
        previous: {
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
  }

  revalidatePath(PATHS.ADMIN_DOWNLOADS);
  redirect(PATHS.ADMIN_DOWNLOADS);
}
