import {
  cn,
  formatDate,
  generateSlug,
  truncateText,
  calculateReadingTime,
  getLensColor,
  getLensEmoji,
  extractTags,
  getCategoryLabel,
} from '@/lib/utils';
import type { Article, Lens } from '@/lib/supabase/types';

// ── cn (Tailwind class merge) ────────────────────────────────────────────────

describe('cn', () => {
  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'end')).toBe('base end');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});

// ── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a date string to uppercase US format', () => {
    // Use T12:00 to avoid UTC midnight rolling back a day in local timezones
    const result = formatDate('2026-03-15T12:00:00');
    expect(result).toMatch(/MARCH\s+15,\s+2026/);
  });

  it('accepts a Date object', () => {
    const result = formatDate(new Date(2026, 0, 1)); // Month is 0-indexed, local time
    expect(result).toMatch(/JANUARY\s+1,\s+2026/);
  });

  it('returns uppercase output', () => {
    const result = formatDate('2026-07-04');
    expect(result).toBe(result.toUpperCase());
  });
});

// ── generateSlug ─────────────────────────────────────────────────────────────

describe('generateSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('strips special characters', () => {
    expect(generateSlug("What's Up? Great!")).toBe('whats-up-great');
  });

  it('collapses multiple spaces', () => {
    expect(generateSlug('too   many   spaces')).toBe('too-many-spaces');
  });

  it('trims leading and trailing whitespace', () => {
    expect(generateSlug('  padded  ')).toBe('padded');
  });

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('');
  });
});

// ── truncateText ─────────────────────────────────────────────────────────────

describe('truncateText', () => {
  it('returns text unchanged if under maxLength', () => {
    expect(truncateText('short', 100)).toBe('short');
  });

  it('truncates at word boundary with ellipsis', () => {
    // maxLength=15 slices "The quick brown", last space at index 9 → "The quick…"
    const result = truncateText('The quick brown fox jumps over', 15);
    expect(result).toBe('The quick\u2026');
  });

  it('returns text at exact maxLength without truncation', () => {
    expect(truncateText('exact', 5)).toBe('exact');
  });

  it('handles single long word by cutting mid-word', () => {
    const result = truncateText('superlongword', 5);
    expect(result).toBe('super\u2026');
  });
});

// ── calculateReadingTime ─────────────────────────────────────────────────────

describe('calculateReadingTime', () => {
  it('returns 1 for very short text', () => {
    expect(calculateReadingTime('hello world')).toBe(1);
  });

  it('returns 1 for 200 words (rounds to 1)', () => {
    const words = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(1);
  });

  it('returns 2 for ~400 words', () => {
    const words = Array(400).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(2);
  });

  it('never returns less than 1', () => {
    expect(calculateReadingTime('')).toBeGreaterThanOrEqual(1);
  });
});

// ── getLensColor ──────────────────────────────────────────────────────────────

describe('getLensColor', () => {
  const lenses: Lens[] = ['health', 'politics', 'culture', 'entertainment', 'business'];

  it.each(lenses)('returns text, border, and bg for "%s"', (lens) => {
    const colors = getLensColor(lens);
    expect(colors).toHaveProperty('text');
    expect(colors).toHaveProperty('border');
    expect(colors).toHaveProperty('bg');
  });

  it('returns amber classes for health', () => {
    expect(getLensColor('health').text).toBe('text-bmj-amber');
  });

  it('returns tan classes for culture', () => {
    expect(getLensColor('culture').text).toBe('text-bmj-tan');
  });

  it('returns red classes for politics', () => {
    expect(getLensColor('politics').text).toBe('text-bmj-red');
  });

  it('returns purple classes for entertainment', () => {
    expect(getLensColor('entertainment').text).toBe('text-bmj-purple');
  });

  it('returns olive classes for business', () => {
    expect(getLensColor('business').text).toBe('text-bmj-olive');
  });
});

// ── getLensEmoji ──────────────────────────────────────────────────────────────

describe('getLensEmoji', () => {
  it('returns a string for each lens', () => {
    expect(typeof getLensEmoji('health')).toBe('string');
    expect(typeof getLensEmoji('politics')).toBe('string');
    expect(typeof getLensEmoji('culture')).toBe('string');
    expect(typeof getLensEmoji('entertainment')).toBe('string');
    expect(typeof getLensEmoji('business')).toBe('string');
  });
});

// ── extractTags ──────────────────────────────────────────────────────────────

describe('extractTags', () => {
  const makeArticle = (tags: string[]): Article => ({
    id: '1',
    title: 'Test',
    slug: 'test',
    lens: 'health',
    tags,
    excerpt: '',
    body: '',
    featured: false,
    access_tier: 'free',
    status: 'published',
    author: 'The Chairman',
    cover_image: null,
    published_at: '2026-01-01',
    created_at: '2026-01-01',
  });

  it('returns sorted unique tags', () => {
    const articles = [
      makeArticle(['discipline', 'fitness']),
      makeArticle(['fitness', 'mindset']),
    ];
    expect(extractTags(articles)).toEqual(['discipline', 'fitness', 'mindset']);
  });

  it('returns empty array for no articles', () => {
    expect(extractTags([])).toEqual([]);
  });

  it('returns empty array when articles have no tags', () => {
    expect(extractTags([makeArticle([])])).toEqual([]);
  });
});

// ── getCategoryLabel ─────────────────────────────────────────────────────────

describe('getCategoryLabel', () => {
  it('returns display label for known category', () => {
    expect(getCategoryLabel('martial-arts')).toBe('Martial Arts');
    expect(getCategoryLabel('mental-health')).toBe('Mental Health');
  });

  it('falls back to raw category for unknown values', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown');
  });
});
