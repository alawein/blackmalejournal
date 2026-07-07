'use client';

import Link from 'next/link';
import { LENS_THEMES } from '@/lib/lens-theme';
import { SEARCH_TYPE_LABELS, SEARCH_SORT_OPTIONS } from '@/lib/content/search-constants';
import type { Lens, SearchContentType } from '@/lib/supabase/types';
import type { SearchSortValue } from '@/lib/content/search-constants';
import { PATHS, withQuery } from '@/lib/paths';

type SearchFiltersProps = {
  query: string;
  activeLenses: string[];
  activeTypes: string[];
  activeSort: SearchSortValue;
};

const VALID_LENSES: Lens[] = ['health', 'politics', 'culture', 'entertainment', 'business'];
const VALID_TYPES: SearchContentType[] = ['article', 'briefing', 'dispatch', 'handbook'];

function buildHref(
  query: string,
  lenses: string[],
  types: string[],
  sort: string,
): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (lenses.length > 0) params.set('lens', lenses.join(','));
  if (types.length > 0) params.set('type', types.join(','));
  if (sort && sort !== 'relevance') params.set('sort', sort);
  const qs = params.toString();
  return qs ? `${PATHS.SEARCH}?${qs}` : PATHS.SEARCH;
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function SearchFilters({
  query,
  activeLenses,
  activeTypes,
  activeSort,
}: SearchFiltersProps) {
  const hasFilters = activeLenses.length > 0 || activeTypes.length > 0 || activeSort !== 'relevance';

  return (
    <div className="mb-10 space-y-4 border border-bmj-tan/20 p-4" role="search" aria-label="Filter results">
      {/* Lens pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-label text-xs uppercase tracking-widest text-bmj-tan">Lens</span>
        {VALID_LENSES.map((lens) => {
          const isActive = activeLenses.includes(lens);
          const theme = LENS_THEMES[lens];
          return (
            <Link
              key={lens}
              href={buildHref(query, toggleItem(activeLenses, lens), activeTypes, activeSort)}
              aria-pressed={isActive}
              className={`filter-chip no-underline ${
                isActive ? 'filter-chip-active' : 'filter-chip-inactive'
              }`}
            >
              {theme.label}
            </Link>
          );
        })}
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-label text-xs uppercase tracking-widest text-bmj-tan">Type</span>
        {VALID_TYPES.map((type) => {
          const isActive = activeTypes.includes(type);
          return (
            <Link
              key={type}
              href={buildHref(query, activeLenses, toggleItem(activeTypes, type), activeSort)}
              aria-pressed={isActive}
              className={`filter-chip no-underline ${
                isActive ? 'filter-chip-active' : 'filter-chip-inactive'
              }`}
            >
              {SEARCH_TYPE_LABELS[type]}
            </Link>
          );
        })}
      </div>

      {/* Sort + clear */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="font-label text-xs uppercase tracking-widest text-bmj-tan">Sort</span>
          <select
            value={activeSort}
            onChange={(e) => {
              window.location.href = buildHref(query, activeLenses, activeTypes, e.target.value);
            }}
            className="border border-bmj-tan/30 bg-bmj-black px-3 py-1 font-mono text-xs text-bmj-cream outline-none focus:border-bmj-red"
          >
            {SEARCH_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {hasFilters && (
          <Link
            href={withQuery(PATHS.SEARCH, { q: query || undefined })}
            className="font-label text-xs uppercase tracking-widest text-bmj-red hover:text-bmj-red/80"
          >
            Clear all
          </Link>
        )}
      </div>
    </div>
  );
}
