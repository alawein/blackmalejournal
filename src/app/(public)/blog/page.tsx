import type { Metadata } from 'next';
import { getDispatchesForListing } from '@/lib/supabase/queries';
import { ButtonLink } from '@/components/ui/Button';
import { StarDivider } from '@/components/ui/StarDivider';
import { DispatchCard } from '@/components/content/DispatchCard';
import { PATHS, withQuery } from '@/lib/paths';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Dispatches',
  description:
    'Short dispatches, updates, and commentary from The Chairman.',
  openGraph: {
    title: 'Dispatches',
    description:
      'Short dispatches, updates, and commentary from The Chairman.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dispatches',
    description:
      'Short dispatches, updates, and commentary from The Chairman.',
  },
};

const PAGE_SIZE = 10;

interface DispatchesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DispatchesPage({
  searchParams,
}: DispatchesPageProps) {
  const { page: rawPage } = await searchParams;
  const parsedPage = parseInt(rawPage ?? '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  const offset = (page - 1) * PAGE_SIZE;
  const dispatches = await getDispatchesForListing({
    limit: PAGE_SIZE + 1,
    offset,
  });

  const hasNext = dispatches.length > PAGE_SIZE;
  const hasPrev = page > 1;
  const visible = dispatches.slice(0, PAGE_SIZE);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl text-bmj-white">Dispatches</h1>
      <p className="mt-2 max-w-xl font-body text-lg text-bmj-cream/70">
        Short posts, updates, and commentary from The Chairman.
      </p>
      <StarDivider className="mb-12" />

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-label text-bmj-tan">No dispatches yet.</p>
          <p className="mt-2 font-body text-sm text-bmj-tan">
            The first dispatch is being drafted.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((dispatch) => (
              <DispatchCard
                key={dispatch.id}
                title={dispatch.title}
                slug={dispatch.slug}
                lens={dispatch.lens}
                excerpt={dispatch.excerpt}
                publishedAt={dispatch.published_at}
              />
            ))}
          </div>

          {(hasNext || hasPrev) && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {hasPrev && (
                <ButtonLink
                  href={withQuery(PATHS.BLOG, {
                    page: page > 2 ? String(page - 1) : undefined,
                  })}
                  variant="ghost"
                >
                  &larr; Newer posts
                </ButtonLink>
              )}
              {hasNext && (
                <ButtonLink
                  href={withQuery(PATHS.BLOG, { page: String(page + 1) })}
                  variant="ghost"
                >
                  Older posts &rarr;
                </ButtonLink>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
