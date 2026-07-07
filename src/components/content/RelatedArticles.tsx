import { ArticleCard } from './ArticleCard';
import { StarDivider } from '@/components/ui/StarDivider';
import { calculateReadingTime } from '@/lib/utils';
import type { ArticleListItem, Lens } from '@/lib/supabase/types';

interface RelatedArticlesProps {
  articles: ArticleListItem[];
  lens: Lens;
}

export function RelatedArticles({ articles, lens }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  const lensLabel = lens.charAt(0).toUpperCase() + lens.slice(1);

  return (
    <section aria-label="Related articles">
      <StarDivider />
      <h2 className="mb-8 font-display text-2xl text-bmj-white">
        More from {lensLabel}
      </h2>
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
          />
        ))}
      </div>
    </section>
  );
}
