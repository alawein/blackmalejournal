const PUBLIC_CONTENT_STATUSES = ['published', 'scheduled'] as const;

type PublicVisibilityQuery = {
  in(column: string, values: readonly string[]): PublicVisibilityQuery;
  lte(column: string, value: string): PublicVisibilityQuery;
};

export function applyPublicContentVisibility<TQuery>(
  query: TQuery & PublicVisibilityQuery,
  nowIso = new Date().toISOString(),
): TQuery {
  const withStatus = query.in('status', PUBLIC_CONTENT_STATUSES);
  const withDate = withStatus.lte('published_at', nowIso);
  return withDate as TQuery;
}

export async function fetchRows<T>(
  query: PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>,
  label: string,
): Promise<T[]> {
  const { data, error } = await query;
  if (error) {
    console.error(`[${label}]`, error.message);
    return [];
  }

  return (data ?? []) as T[];
}

export async function fetchSingle<T>(
  query: PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>,
  label: string,
): Promise<T | null> {
  const { data, error } = await query;
  if (error) {
    console.error(`[${label}]`, error.message);
    return null;
  }

  return (data ?? null) as T | null;
}

export async function executeUpdate(
  query: PromiseLike<{
    error: { message: string } | null;
  }>,
  label: string,
  options: { throwOnError?: boolean } = {},
): Promise<void> {
  const { error } = await query;
  if (error) {
    console.error(`[${label}]`, error.message);
    if (options.throwOnError) {
      throw error;
    }
  }
}
