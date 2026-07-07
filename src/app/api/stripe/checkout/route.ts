import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/access';
import { createCheckoutSession } from '@/lib/stripe/helpers';
import { normalizeInternalPath } from '@/lib/paths';

export async function POST(request: Request) {
  const user = await getAuthUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: { tier?: string; returnTo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const tier = body.tier;
  const returnTo = normalizeInternalPath(body.returnTo, '/portal');

  if (tier !== 'basic' && tier !== 'premium') {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  try {
    const url = await createCheckoutSession(user.id, user.email, tier, returnTo);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[checkout]', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
