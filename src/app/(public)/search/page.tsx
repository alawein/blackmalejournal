import type { Metadata } from 'next';
import Link from 'next/link';
import { searchContentFTS } from '@/lib/supabase/queries';
import { LensBadge } from '@/components/brand/LensBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SEARCH_TYPE_ICONS, SEARCH_TYPE_PATHS, SEARCH_SORT_OPTIONS } from '@/lib/content/search-constants';
import type { Lens, SearchResult, SearchContentType } from '@/lib/supabase/types';
import type { SearchSortValue } from '@/lib/content/search-constants';
import { PATHS, withQuery } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Search — The Black Male Journal',
};

const VALID_LENSES: Set<string> = new Set<string>(['health', 'politics', 'culture', 'entertainment', 'business']);
const VALID_TYPES: Set<string> = new Set<string>(['article', 'briefing', 'dispatch', 'handbook']);
const VALID_SORTS: Set<string> = new Set<string>(SEARCH_SORT_OPTIONS.map((o) => o.value));

function parseCsv(raw: string | undefined, valid: Set<string>): string[] {
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter((s) => valid.has(s));
}

function parseSort(raw: string | undefined): SearchSortValue {
  if (raw && VALID_SORTS.has(raw)) return raw as SearchSortValue;
  return 'relevance';
}

function relevanceLabel(score: number | undefined): string | null {
  if (score == null) return null;
  if (score > 0.3) return 'Strong match';
  if (score > 0.1) return 'Partial match';
  return null;
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; lens?: string; type?: string; sort?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const activeLenses = parseCsv(params.lens, VALID_LENSES);
  const activeTypes = parseCsv(params.type, VALID_TYPES);
  const activeSort = parseSort(params.sort);

  const hasFilters = activeLenses.length > 0 || activeTypes.length > 0 || activeSort !== 'relevance';

  const results: SearchResult[] = query.length >= 2
    ? await searchContentFTS(query, {
        lens: activeLenses.length > 0 ? activeLenses : undefined,
        types: activeTypes.length > 0 ? activeTypes : undefined,
        sort: activeSort,
      })
    : [];

  const sortLabel = SEARCH_SORT_OPTIONS.find((o) => o.value === activeSort)?.label?.toLowerCase() ?? 'relevance';

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <h1 className="font-display text-5xl text-bmj-white">Search</h1>
      <StarDivider />

      <form action="/search" method="GET" className="mb-12">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search articles, briefings, handbooks..."
            className="flex-1 border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder-bmj-tan/50 outline-none focus:border-bmj-red"
            aria-label="Search"
          />
          <button
            type="submit"
            className="bg-bmj-red px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <SearchFilters
          query={query}
          activeLenses={activeLenses}
          activeTypes={activeTypes}
          activeSort={activeSort}
        />
      )}

      {query && (
        <p className="mb-8 font-mono text-xs text-bmj-tan">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          {' '}by {sortLabel}
        </p>
      )}

      <div className="space-y-1">
        {results.map((result: SearchResult) => {
          const Icon = SEARCH_TYPE_ICONS[result.type] ?? SEARCH_TYPE_ICONS.article;
          const href = `${SEARCH_TYPE_PATHS[result.type] ?? '/articles'}/${result.slug}`;
          const matchLabel = relevanceLabel(result.relevance);
          return (
            <Link
              key={`${result.type}-${result.slug}`}
              href={href}
              className="flex items-start gap-4 border-b border-bmj-tan/10 py-6 no-underline transition-colors hover:bg-bmj-brown/50"
            >
              <Icon size={18} className="mt-1 shrink-0 text-bmj-tan" aria-hidden="true" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-micro uppercase tracking-widest text-bmj-tan">{result.type}</span>
                  {result.lens && <LensBadge lens={result.lens as Lens} />}
                  {result.accessTier && result.accessTier !== 'free' && (
                    <span className="rounded-sm bg-bmj-amber/20 px-2 py-0.5 font-label text-micro uppercase tracking-widest text-bmj-amber">
                      {result.accessTier}
                    </span>
                  )}
                  {matchLabel && (
                    <span className="font-mono text-micro text-bmj-tan/60">{matchLabel}</span>
                  )}
                </div>
                <h2 className="mt-1 font-display text-xl text-bmj-white">{result.title}</h2>
                {result.excerpt && (
                  <p className="mt-1 line-clamp-2 font-body text-sm text-bmj-cream/70">{result.excerpt}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {query && results.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-body text-lg text-bmj-cream">No results found.</p>
          {hasFilters ? (
            <p className="mt-2 font-body text-sm text-bmj-tan">
              Try removing some filters.{' '}
              <Link href={withQuery(PATHS.SEARCH, { q: query })} className="text-bmj-red">
                Clear filters
              </Link>
            </p>
          ) : (
            <p className="mt-2 font-body text-sm text-bmj-tan">
              Try different keywords or browse our{' '}
              <Link href={PATHS.ARTICLES} className="text-bmj-red">articles</Link>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
