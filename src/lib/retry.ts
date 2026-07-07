type RetryOptions = {
  attempts?: number;
  delayMs?: number;
  jitterMs?: number;
  isRetryable?: (error: unknown) => boolean;
  label?: string;
};

const DEFAULT_OPTIONS = {
  attempts: 3,
  delayMs: 150,
  jitterMs: 35,
} as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableDefault() {
  return true;
}

function normalizeOptions(
  input?: RetryOptions,
): Required<Omit<RetryOptions, 'isRetryable'>> & { isRetryable: (error: unknown) => boolean } {
  const attempts = input?.attempts ?? DEFAULT_OPTIONS.attempts;
  const delayMs = input?.delayMs ?? DEFAULT_OPTIONS.delayMs;
  const jitterMs = input?.jitterMs ?? DEFAULT_OPTIONS.jitterMs;
  return {
    attempts: Math.max(1, Math.floor(attempts)),
    delayMs: Math.max(0, Math.floor(delayMs)),
    jitterMs: Math.max(0, Math.floor(jitterMs)),
    isRetryable: input?.isRetryable ?? isRetryableDefault,
    label: input?.label ?? 'external-call',
  };
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const opts = normalizeOptions(options);
  let attempt = 0;
  let lastError: unknown;

  while (attempt < opts.attempts) {
    attempt += 1;
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!opts.isRetryable(error) || attempt >= opts.attempts) {
        throw error;
      }

      const jitter = Math.random() * opts.jitterMs * ((attempt % 2 === 0) ? -1 : 1);
      const waitMs = Math.max(0, opts.delayMs * attempt + jitter);
      console.warn(`[${opts.label}] retry attempt ${attempt}/${opts.attempts}`, {
        message: (error instanceof Error ? error.message : String(error)),
      });
      await sleep(waitMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Operation failed');
}
