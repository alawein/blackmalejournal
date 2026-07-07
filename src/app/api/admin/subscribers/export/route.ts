import { NextResponse } from 'next/server';
import { getAdminActor } from '@/lib/admin-auth';
import { getAllSubscribers } from '@/lib/supabase/admin-queries';

function escapeCsvValue(value: string): string {
  if (/[,"\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const actor = await getAdminActor(['admin', 'editor']);
  if (!actor.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (!actor.member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter');
  const q = searchParams.get('q') ?? undefined;
  const active =
    filter === 'active' ? true : filter === 'unsubscribed' ? false : undefined;

  const subscribers = await getAllSubscribers({
    active,
    query: q,
    limit: 5000,
  });

  const rows = [
    ['email', 'source', 'subscribed_at', 'unsubscribed_at'],
    ...subscribers.map((subscriber) => [
      subscriber.email,
      subscriber.source ?? '',
      subscriber.subscribed_at,
      subscriber.unsubscribed_at ?? '',
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
    .join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bmj-subscribers.csv"',
    },
  });
}
