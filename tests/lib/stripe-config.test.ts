import { getPriceIdForTier, getTierFromPriceId } from '@/lib/stripe/config';

// ── getPriceIdForTier ────────────────────────────────────────────────────────

describe('getPriceIdForTier', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      STRIPE_BASIC_PRICE_ID: 'price_basic_123',
      STRIPE_PREMIUM_PRICE_ID: 'price_premium_456',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns basic price ID for basic tier', () => {
    expect(getPriceIdForTier('basic')).toBe('price_basic_123');
  });

  it('returns premium price ID for premium tier', () => {
    expect(getPriceIdForTier('premium')).toBe('price_premium_456');
  });

  it('throws when env var is missing', () => {
    delete process.env.STRIPE_BASIC_PRICE_ID;
    expect(() => getPriceIdForTier('basic')).toThrow(
      'Missing STRIPE_BASIC_PRICE_ID env var',
    );
  });
});

// ── getTierFromPriceId ───────────────────────────────────────────────────────

describe('getTierFromPriceId', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      STRIPE_BASIC_PRICE_ID: 'price_basic_123',
      STRIPE_PREMIUM_PRICE_ID: 'price_premium_456',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns "basic" for matching basic price ID', () => {
    expect(getTierFromPriceId('price_basic_123')).toBe('basic');
  });

  it('returns "premium" for matching premium price ID', () => {
    expect(getTierFromPriceId('price_premium_456')).toBe('premium');
  });

  it('returns null for unknown price ID', () => {
    expect(getTierFromPriceId('price_unknown_789')).toBeNull();
  });
});
