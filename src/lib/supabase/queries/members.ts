import { createClient } from '@/lib/supabase/server';
import type { Member, MemberTier } from '@/lib/supabase/types';
import { executeUpdate, fetchSingle } from './_shared';

export async function getMemberById(userId: string): Promise<Member | null> {
  const supabase = await createClient();
  const query = supabase
    .from('members')
    .select('*')
    .eq('id', userId)
    .single();

  return fetchSingle<Member>(query, 'getMemberById');
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const supabase = await createClient();
  const query = supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .single();

  return fetchSingle<Member>(query, 'getMemberByEmail');
}

export async function updateMemberTier(
  userId: string,
  tier: MemberTier,
  stripeData?: { customerId: string; subscriptionId: string },
): Promise<void> {
  const supabase = await createClient();
  const payload = stripeData
    ? {
        tier,
        stripe_customer_id: stripeData.customerId,
        stripe_subscription_id: stripeData.subscriptionId,
      }
    : { tier };

  await executeUpdate(
    supabase
      .from('members')
      .update(payload)
      .eq('id', userId),
    'updateMemberTier',
  );
}
