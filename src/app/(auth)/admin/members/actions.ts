'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdminActor } from '@/lib/admin-auth';
import {
  countAdminMembers,
  getAdminMemberById,
  updateAdminMember,
} from '@/lib/supabase/admin-queries';
import { PATHS, normalizeInternalPath } from '@/lib/paths';

const memberUpdateSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  tier: z.enum(['free', 'basic', 'premium']),
  role: z.enum(['member', 'editor', 'admin']),
  returnTo: z.string().optional(),
});

export async function updateMemberAction(formData: FormData): Promise<void> {
  const actor = await requireAdminActor(['admin']);
  const raw = Object.fromEntries(formData.entries());
  const parsed = memberUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    const returnTo = normalizeInternalPath(formData.get('returnTo') as string | null, PATHS.ADMIN_MEMBERS);
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${returnTo}?error=${encodeURIComponent(firstError)}`);
  }

  const { memberId, tier, role, returnTo } = parsed.data;
  const redirectTo = normalizeInternalPath(returnTo, `${PATHS.ADMIN_MEMBERS}/${memberId}`);
  const existing = await getAdminMemberById(memberId);

  if (!existing) {
    redirect(`${redirectTo}?error=Member+not+found`);
  }

  if (existing.role === 'admin' && role !== 'admin') {
    const adminCount = await countAdminMembers();
    if (adminCount <= 1) {
      redirect(`${redirectTo}?error=Cannot+demote+the+last+admin`);
    }
  }

  if (existing.id === actor.userId && role !== 'admin') {
    redirect(`${redirectTo}?error=You+cannot+remove+your+own+admin+role`);
  }

  const updated = await updateAdminMember(memberId, { tier, role });
  if (!updated) {
    redirect(`${redirectTo}?error=Failed+to+update+member`);
  }

  revalidatePath(PATHS.ADMIN_MEMBERS);
  revalidatePath(`${PATHS.ADMIN_MEMBERS}/${memberId}`);
  redirect(`${redirectTo}?message=Member+updated`);
}
