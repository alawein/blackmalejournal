import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getMemberById } from '@/lib/supabase/queries';
import { includesTier } from '@/lib/membership';
import type { AccessTier } from '@/lib/supabase/types';

export type AuthUserRef = { id: string; email?: string };

function toAuthUserRef(user: User): AuthUserRef {
  return { id: user.id, email: user.email ?? undefined };
}

/** Per-request dedupe for `supabase.auth.getUser()` across layouts and content gates. */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Checks whether the current user has access to content at the given tier.
 * Returns { hasAccess, user } — user is null if not authenticated.
 */
export async function checkContentAccess(requiredTier: AccessTier): Promise<{
  hasAccess: boolean;
  user: AuthUserRef | null;
}> {
  if (requiredTier === 'free') {
    return { hasAccess: true, user: null };
  }

  const authUser = await getAuthUser();

  if (!authUser) {
    return { hasAccess: false, user: null };
  }

  const member = await getMemberById(authUser.id);
  const hasAccess = member ? includesTier(member.tier, requiredTier) : false;

  return { hasAccess, user: toAuthUserRef(authUser) };
}
