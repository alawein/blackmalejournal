const LOCAL_SITE_URL = 'http://localhost:3000';

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function normalizeOrigin(value: string | undefined | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return stripTrailingSlash(trimmed);
  }

  if (trimmed.startsWith('localhost') || trimmed.startsWith('127.0.0.1')) {
    return `http://${stripTrailingSlash(trimmed)}`;
  }

  return `https://${stripTrailingSlash(trimmed)}`;
}

export function resolveSiteUrl(): string {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeOrigin(process.env.VERCEL_URL) ??
    LOCAL_SITE_URL
  );
}

export const SITE_URL = resolveSiteUrl();
