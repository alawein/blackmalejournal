import { createAdminClient } from '@/lib/supabase/admin';
import { withRetry } from '@/lib/retry';

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max unique tokens tracked
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

interface MemoryRateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitRpcRow {
  success: boolean;
  remaining: number;
}

const memoryStore = new Map<string, MemoryRateLimitBucket>();

function clampToken(rawToken: string): string {
  const normalized = String(rawToken ?? '').trim();
  return normalized.slice(0, 128);
}

function shouldUseDistributedStore(): boolean {
  if (process.env.NODE_ENV === 'test') return false;
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function nextWindowStart(now: number, interval: number): number {
  return Math.floor(now / interval) * interval;
}

async function callIncrementRateLimit(
  bucketKey: string,
  token: string,
  limit: number,
  resetAt: string,
): Promise<RateLimitResult> {
  const supabase = createAdminClient();

  // increment_rate_limit RPC is defined in
  // supabase/migrations/20260424000000_create_atomic_rate_limit.sql.
  // Not in the generated schema types; cast via unknown is intentional.
  const { data, error } = await (supabase as unknown as {
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: RateLimitRpcRow[] | null; error: Error | null }>;
  }).rpc('increment_rate_limit', {
    p_bucket_key: bucketKey,
    p_token: token,
    p_limit: limit,
    p_reset_at: resetAt,
  });

  if (error) throw error;

  const row = data?.[0];
  if (!row) throw new Error('increment_rate_limit returned no row');

  return { success: row.success, remaining: row.remaining };
}

async function getDistributedLimit(
  token: string,
  interval: number,
  limit: number,
): Promise<RateLimitResult | null> {
  const now = Date.now();
  const windowStart = nextWindowStart(now, interval);
  const resetAt = new Date(windowStart + interval).toISOString();
  const bucketKey = `${windowStart}:${token}`;

  try {
    return await withRetry(
      () => callIncrementRateLimit(bucketKey, token, limit, resetAt),
      { attempts: 3, delayMs: 50, jitterMs: 25, label: 'rate-limit-rpc' },
    );
  } catch (error) {
    console.error('[rateLimit] RPC failed after retries, falling back to in-memory', error);
    return null;
  }
}

function getMemoryLimit(
  token: string,
  interval: number,
  uniqueTokenPerInterval: number,
  limit: number,
): RateLimitResult {
  const now = Date.now();
  if (memoryStore.size > uniqueTokenPerInterval) {
    for (const [key, bucket] of memoryStore) {
      if (now > bucket.resetAt) memoryStore.delete(key);
    }
  }

  const bucket = memoryStore.get(token);
  if (!bucket || now > bucket.resetAt) {
    memoryStore.set(token, { count: 1, resetAt: now + interval });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;

  return {
    async check(limit: number, token: string): Promise<RateLimitResult> {
      const safeToken = clampToken(token);
      if (!safeToken) {
        return { success: false, remaining: 0 };
      }

      if (shouldUseDistributedStore()) {
        const result = await getDistributedLimit(safeToken, interval, limit);
        if (result) return result;
      }

      return getMemoryLimit(safeToken, interval, uniqueTokenPerInterval, limit);
    },
  };
}
