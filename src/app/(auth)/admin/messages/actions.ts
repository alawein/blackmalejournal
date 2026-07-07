'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdminActor } from '@/lib/admin-auth';
import { updateContactSubmission } from '@/lib/supabase/admin-queries';
import { PATHS, normalizeInternalPath } from '@/lib/paths';

const messageUpdateSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  status: z.enum(['new', 'in_progress', 'resolved', 'spam']),
  internal_notes: z.string().optional(),
  returnTo: z.string().optional(),
});

export async function updateContactSubmissionAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin', 'editor']);
  const raw = Object.fromEntries(formData.entries());
  const parsed = messageUpdateSchema.safeParse(raw);

  const redirectTo = normalizeInternalPath(
    (formData.get('returnTo') as string | null) ?? PATHS.ADMIN_MESSAGES,
    PATHS.ADMIN_MESSAGES,
  );

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${redirectTo}?error=${encodeURIComponent(firstError)}`);
  }

  const { id, status, internal_notes } = parsed.data;
  const updated = await updateContactSubmission(id, {
    status,
    internal_notes,
    handled_by: actor.userId,
  });

  if (!updated) {
    redirect(`${redirectTo}?error=Failed+to+update+message`);
  }

  revalidatePath(PATHS.ADMIN_MESSAGES);
  redirect(`${redirectTo}?message=Message+updated`);
}
