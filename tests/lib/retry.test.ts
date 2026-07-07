import { withRetry } from '@/lib/retry';

describe('withRetry', () => {
  it('returns the first successful attempt', async () => {
    let calls = 0;
    const value = await withRetry(async () => {
      calls += 1;
      if (calls < 2) throw new Error('temporary');
      return 'ok';
    }, { attempts: 3, delayMs: 1, jitterMs: 0 });

    expect(value).toBe('ok');
    expect(calls).toBe(2);
  });

  it('throws when retries are exhausted', async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new Error('fail');
        },
        { attempts: 2, delayMs: 1, jitterMs: 0 },
      ),
    ).rejects.toThrow('fail');
    expect(calls).toBe(2);
  });

  it('does not retry when isRetryable returns false', async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new Error('bad');
        },
        { attempts: 5, delayMs: 1, jitterMs: 0, isRetryable: () => false },
      ),
    ).rejects.toThrow('bad');
    expect(calls).toBe(1);
  });
});
