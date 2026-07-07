import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/access';
import { getMemberById } from '@/lib/supabase/queries';
import { createBillingPortalSession } from '@/lib/stripe/helpers';

export async function POST() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const member = await getMemberById(user.id);

  if (!member?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 });
  }

  try {
    const url = await createBillingPortalSession(member.stripe_customer_id);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[manage-billing]', err);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 },
    );
  }
}
