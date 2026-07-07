import { NextResponse } from 'next/server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { normalizeEmailAddress } from '@/lib/email';
import { subscribeToNewsletter } from '@/lib/supabase/queries';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

const subscribeSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').transform(normalizeEmailAddress),
  source: z.string().optional().transform((s) => s?.trim()),
});

export async function POST(request: Request) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success } = await limiter.check(5, ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = subscribeSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Validation failed';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { email, source } = result.data;

  try {
    await subscribeToNewsletter(email, source || 'website');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[newsletter/subscribe]', err);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }
}
