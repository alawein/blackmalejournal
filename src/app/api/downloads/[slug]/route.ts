import { NextResponse } from 'next/server';
import { checkContentAccess } from '@/lib/supabase/access';
import { getDownloadBySlug } from '@/lib/supabase/queries';
import { resolveDownloadAssetUrl } from '@/lib/storage-assets';

interface DownloadRouteProps {
  params: Promise<{ slug: string }>;
}

export async function GET(_: Request, { params }: DownloadRouteProps) {
  const { slug } = await params;
  const download = await getDownloadBySlug(slug);

  if (!download) {
    return NextResponse.json({ error: 'Download not found' }, { status: 404 });
  }

  const { hasAccess } = await checkContentAccess(download.access_tier);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const url = await resolveDownloadAssetUrl(download.file_url);
  if (!url) {
    return NextResponse.json({ error: 'Download file unavailable' }, { status: 404 });
  }

  return NextResponse.redirect(url);
}
