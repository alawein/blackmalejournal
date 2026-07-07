import {
  formatPublishedAtForInput,
  parsePublishedAtInput,
} from '@/lib/admin-publish-time';

describe('admin publish time helpers', () => {
  it('formats ISO timestamps for datetime-local inputs in UTC', () => {
    expect(formatPublishedAtForInput('2026-03-25T17:45:00.000Z')).toBe(
      '2026-03-25T17:45',
    );
  });

  it('returns an empty string when formatting an empty value', () => {
    expect(formatPublishedAtForInput(null)).toBe('');
  });

  it('parses datetime-local values into ISO timestamps in UTC', () => {
    expect(parsePublishedAtInput('2026-03-25T17:45')).toBe(
      '2026-03-25T17:45:00.000Z',
    );
  });

  it('returns null for empty or invalid publish time input', () => {
    expect(parsePublishedAtInput('')).toBeNull();
    expect(parsePublishedAtInput('2026-03-25 17:45')).toBeNull();
  });
});
