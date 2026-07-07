function normalizeInput(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

export function formatPublishedAtForInput(iso: string | null | undefined): string {
  const normalized = normalizeInput(iso);
  if (!normalized) return '';

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 16);
}

export function parsePublishedAtInput(
  value: string | null | undefined,
): string | null {
  const normalized = normalizeInput(value);
  if (!normalized) return null;

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    return null;
  }

  const iso = new Date(`${normalized}:00Z`);
  if (Number.isNaN(iso.getTime())) return null;

  return iso.toISOString();
}
