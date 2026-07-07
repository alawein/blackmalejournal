import { NextResponse } from 'next/server';
import { checkContentAccess } from '@/lib/supabase/access';
import { getHandbookBySlug } from '@/lib/supabase/queries';
import { resolveDownloadAssetUrl } from '@/lib/storage-assets';

interface HandbookDownloadRouteProps {
  params: Promise<{ slug: string }>;
}

export async function GET(_: Request, { params }: HandbookDownloadRouteProps) {
  const { slug } = await params;
  const handbook = await getHandbookBySlug(slug);

  if (!handbook || !handbook.file_url) {
    return NextResponse.json({ error: 'Handbook file not found' }, { status: 404 });
  }

  const { hasAccess } = await checkContentAccess(handbook.access_tier);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const url = await resolveDownloadAssetUrl(handbook.file_url);
  if (!url) {
    return NextResponse.json({ error: 'Handbook file unavailable' }, { status: 404 });
  }

  return NextResponse.redirect(url);
}
