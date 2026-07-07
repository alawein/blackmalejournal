import { getSignedUrl } from '@/lib/supabase/storage';

export function isAbsoluteUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function resolveDownloadAssetUrl(
  pathOrUrl: string | null | undefined,
): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (isAbsoluteUrl(pathOrUrl)) return pathOrUrl;
  return getSignedUrl('downloads', pathOrUrl);
}
