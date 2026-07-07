import {
  buildSearchPattern,
  normalizeBulkIds,
  sortRowsByIds,
} from '@/lib/supabase/admin-queries/shared';

// ── buildSearchPattern ──────────────────────────────────────────────────────

describe('buildSearchPattern', () => {
  it('returns null for null input', () => {
    expect(buildSearchPattern(null as unknown as undefined)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(buildSearchPattern(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(buildSearchPattern('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(buildSearchPattern('   ')).toBeNull();
  });

  it('wraps normal string with %', () => {
    expect(buildSearchPattern('discipline')).toBe('%discipline%');
  });

  it('trims leading/trailing whitespace', () => {
    expect(buildSearchPattern('  morning  ')).toBe('%morning%');
  });

  it('escapes % characters', () => {
    expect(buildSearchPattern('100%')).toBe('%100\\%%');
  });

  it('escapes _ characters', () => {
    expect(buildSearchPattern('hello_world')).toBe('%hello\\_world%');
  });

  it('escapes \\ characters', () => {
    expect(buildSearchPattern('back\\slash')).toBe('%back\\\\slash%');
  });

  it('escapes multiple special characters', () => {
    expect(buildSearchPattern('a%b_c\\d')).toBe('%a\\%b\\_c\\\\d%');
  });
});

// ── normalizeBulkIds ────────────────────────────────────────────────────────

describe('normalizeBulkIds', () => {
  it('deduplicates IDs', () => {
    expect(normalizeBulkIds(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('trims whitespace from IDs', () => {
    expect(normalizeBulkIds(['  art-1 ', ' art-2  '])).toEqual(['art-1', 'art-2']);
  });

  it('filters empty strings', () => {
    expect(normalizeBulkIds(['art-1', '', '  ', 'art-2'])).toEqual(['art-1', 'art-2']);
  });

  it('preserves first-occurrence order', () => {
    expect(normalizeBulkIds(['c', 'a', 'b', 'a', 'c'])).toEqual(['c', 'a', 'b']);
  });

  it('returns empty array for all-empty input', () => {
    expect(normalizeBulkIds(['', '  ', ''])).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeBulkIds([])).toEqual([]);
  });
});

// ── sortRowsByIds ───────────────────────────────────────────────────────────

describe('sortRowsByIds', () => {
  it('sorts rows to match ID order', () => {
    const rows = [
      { id: 'b', name: 'Beta' },
      { id: 'a', name: 'Alpha' },
      { id: 'c', name: 'Charlie' },
    ];
    const sorted = sortRowsByIds(rows, ['c', 'a', 'b']);
    expect(sorted.map((r) => r.id)).toEqual(['c', 'a', 'b']);
  });

  it('skips missing rows gracefully', () => {
    const rows = [
      { id: 'a', name: 'Alpha' },
      { id: 'c', name: 'Charlie' },
    ];
    const sorted = sortRowsByIds(rows, ['c', 'b', 'a']);
    expect(sorted.map((r) => r.id)).toEqual(['c', 'a']);
  });

  it('returns empty array for empty rows', () => {
    expect(sortRowsByIds([], ['a', 'b'])).toEqual([]);
  });

  it('returns empty array for empty IDs', () => {
    expect(sortRowsByIds([], [])).toEqual([]);
  });

  it('preserves rows when IDs list is empty (rows have MAX_SAFE_INTEGER order)', () => {
    const rows = [{ id: 'a' }, { id: 'b' }];
    const sorted = sortRowsByIds(rows, []);
    expect(sorted).toHaveLength(2);
  });

  it('does not mutate the original array', () => {
    const rows = [{ id: 'b' }, { id: 'a' }];
    const original = [...rows];
    sortRowsByIds(rows, ['a', 'b']);
    expect(rows).toEqual(original);
  });
});
