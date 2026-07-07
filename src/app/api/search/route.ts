import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { searchContentFTS } from '@/lib/supabase/queries';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

const VALID_LENSES = new Set(['health', 'politics', 'culture', 'entertainment', 'business']);
const VALID_TYPES = new Set(['article', 'briefing', 'dispatch', 'handbook']);

function parseCommaSeparated(value: string | null, validSet: Set<string>): string[] | undefined {
  if (!value) return undefined;
  const filtered = value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => validSet.has(s));
  return filtered.length > 0 ? filtered : undefined;
}

export async function GET(request: Request) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success } = await limiter.check(30, ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters.' },
      { status: 400 },
    );
  }

  const lens = parseCommaSeparated(searchParams.get('lens'), VALID_LENSES);
  const types = parseCommaSeparated(searchParams.get('type'), VALID_TYPES);

  const rawSort = searchParams.get('sort');
  const sort: 'relevance' | 'date' =
    rawSort === 'date' || rawSort === 'relevance' ? rawSort : 'relevance';

  const rawLimit = parseInt(searchParams.get('limit') ?? '', 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 30;

  const results = await searchContentFTS(query, { lens, types, sort, limit });
  return NextResponse.json({ results, query: query.trim() });
}
