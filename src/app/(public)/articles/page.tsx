import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getArticlesForListing, getArticleTagFacets } from '@/lib/supabase/queries';
import { ButtonLink } from '@/components/ui/Button';
import { extractTags, calculateReadingTime } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArticleCard } from '@/components/content/ArticleCard';
import NewspaperGrid from '@/components/content/NewspaperGrid';
import { LensFilterTabs } from '@/components/content/LensFilterTabs';
import { LensSection } from '@/components/content/LensSection';
import { TagFilterRow } from '@/components/content/TagFilterRow';
import type { ArticleListItem, Lens } from '@/lib/supabase/types';
import { PATHS, withQuery } from '@/lib/paths';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Long-form articles across five lenses — health, politics, culture, entertainment, and business — for Black men.',
  openGraph: {
    title: 'Articles',
    description:
      'Long-form articles across five lenses — health, politics, culture, entertainment, and business — for Black men.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles',
    description:
      'Long-form articles across five lenses — health, politics, culture, entertainment, and business — for Black men.',
  },
};

const VALID_LENSES = new Set<string>(['health', 'politics', 'culture', 'entertainment', 'business']);
const PAGE_SIZE = 9;

interface ArticlesPageProps {
  searchParams: Promise<{ lens?: string; tag?: string; page?: string }>;
}

function ArticleCardGrid({ articles }: { articles: ArticleListItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          title={article.title}
          slug={article.slug}
          lens={article.lens}
          excerpt={article.excerpt}
          readingTime={calculateReadingTime(article.excerpt)}
          publishedAt={article.published_at}
          coverImage={article.cover_image}
          isPremium={article.access_tier !== 'free'}
          isFeatured={article.featured}
        />
      ))}
    </div>
  );
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { lens: rawLens, tag, page: rawPage } = await searchParams;

  const activeLens = VALID_LENSES.has(rawLens ?? '')
    ? (rawLens as Lens)
    : undefined;
  const activeTag = tag ?? null;
  const parsedPage = parseInt(rawPage ?? '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  const offset = (page - 1) * PAGE_SIZE;
  const articles = await getArticlesForListing({
    lens: activeLens,
    tag: activeTag ?? undefined,
    limit: PAGE_SIZE + 1,
    offset,
  });

  const hasNext = articles.length > PAGE_SIZE;
  const hasPrev = page > 1;
  const visible = articles.slice(0, PAGE_SIZE);

  const tagFacetRows = await getArticleTagFacets({
    lens: activeLens,
    limit: 200,
  });
  const tags = extractTags(tagFacetRows);

  // Split visible articles into newspaper grid (first 3) and standard grid (rest)
  const newspaperArticles = visible.slice(0, 3);
  const remainingArticles = visible.slice(3);

  const content = (
    <div className="page-shell py-16">
      <PageHeader
        label="The Archive"
        title="Articles"
        description="Long-form argument across five lenses. This is the slow record of the publication."
        dividerClassName="mb-8"
      />

      {/* Filters */}
      <div className="surface-panel mb-8 space-y-4 p-4 sm:p-6">
        <Suspense fallback={<div className="h-10 border-b border-bmj-tan/20" />}>
          <LensFilterTabs activeLens={activeLens ?? 'all'} />
        </Suspense>
        <Suspense fallback={<div className="h-8" />}>
          <TagFilterRow tags={tags} activeTag={activeTag} />
        </Suspense>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <EmptyState
          heading="No articles found"
          description="Try selecting a different lens or clearing the tag filter."
          actionLabel="Clear filters"
          actionHref="/articles"
        />
      ) : (
        <>
          {newspaperArticles.length >= 3 ? (
            <NewspaperGrid articles={newspaperArticles} />
          ) : (
            <ArticleCardGrid articles={newspaperArticles} />
          )}

          {remainingArticles.length > 0 && (
            <div className="mt-6">
              <ArticleCardGrid articles={remainingArticles} />
            </div>
          )}

          {(hasNext || hasPrev) && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {hasPrev && (
                <ButtonLink
                  href={withQuery(PATHS.ARTICLES, {
                    lens: activeLens ?? undefined,
                    tag: activeTag ?? undefined,
                    page: page > 2 ? String(page - 1) : undefined,
                  })}
                  variant="ghost"
                >
                  Newer articles
                </ButtonLink>
              )}
              {hasNext && (
                <ButtonLink
                  href={withQuery(PATHS.ARTICLES, {
                    lens: activeLens ?? undefined,
                    tag: activeTag ?? undefined,
                    page: String(page + 1),
                  })}
                  variant="ghost"
                >
                  Older articles
                </ButtonLink>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  if (activeLens) {
    return (
      <LensSection lens={activeLens} accentBorder={false} tintedBackground={false}>
        {content}
      </LensSection>
    );
  }

  return content;
}
