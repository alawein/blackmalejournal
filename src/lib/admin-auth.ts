import { PATHS } from '@/lib/paths';
import { redirect } from 'next/navigation';
import type { Member, MemberRole } from '@/lib/supabase/types';
import { getAuthUser } from '@/lib/supabase/access';
import { getMemberById } from '@/lib/supabase/queries';

export async function getAdminActor(
  allowedRoles: MemberRole[] = ['admin', 'editor'],
): Promise<{ userId: string; member: Member | null }> {
  const user = await getAuthUser();

  if (!user) return { userId: '', member: null };

  const member = await getMemberById(user.id);
  if (!member || !allowedRoles.includes(member.role)) {
    return { userId: user.id, member: null };
  }

  return { userId: user.id, member };
}

export async function requireAdminActor(
  allowedRoles: MemberRole[] = ['admin', 'editor'],
): Promise<{ userId: string; member: Member }> {
  const actor = await getAdminActor(allowedRoles);

  if (!actor.userId) {
    redirect(`${PATHS.LOGIN}?redirect=${PATHS.ADMIN}`);
  }

  if (!actor.member) {
    redirect(`${PATHS.PORTAL}?error=unauthorized`);
  }

  return actor as { userId: string; member: Member };
}
