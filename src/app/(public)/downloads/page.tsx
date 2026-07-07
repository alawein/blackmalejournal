import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getDownloads, getHandbooks, getMemberById } from '@/lib/supabase/queries';
import { HandbookCard } from '@/components/content/HandbookCard';
import { getAuthUser } from '@/lib/supabase/access';
import { StarDivider } from '@/components/ui/StarDivider';
import { EmptyState } from '@/components/ui/EmptyState';
import { DownloadCard } from '@/components/content/DownloadCard';
import { DownloadCategoryTabs } from '@/components/content/DownloadCategoryTabs';

export const metadata: Metadata = {
  title: 'Downloads',
  description:
    'Templates, worksheets, and toolkits for the disciplined man. Premium member resources.',
  openGraph: {
    title: 'Downloads',
    description:
      'Templates, worksheets, and toolkits for the disciplined man. Premium member resources.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downloads',
    description:
      'Templates, worksheets, and toolkits for the disciplined man. Premium member resources.',
  },
};

const VALID_CATEGORIES = new Set<string>([
  'template',
  'worksheet',
  'guide',
  'toolkit',
  'handbook',
]);

interface DownloadsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function DownloadsPage({ searchParams }: DownloadsPageProps) {
  const { category: rawCategory } = await searchParams;

  const activeCategory = VALID_CATEGORIES.has(rawCategory ?? '')
    ? rawCategory!
    : undefined;

  const isHandbookCategory = activeCategory === 'handbook';

  // Fetch appropriate data based on category (parallel when both needed)
  const needsDownloads = !isHandbookCategory;
  const needsHandbooks = isHandbookCategory || !activeCategory;

  const [downloads, handbooks] = await Promise.all([
    needsDownloads ? getDownloads({ category: activeCategory }) : Promise.resolve([]),
    needsHandbooks ? getHandbooks({}) : Promise.resolve([]),
  ]);

  // Determine the user's tier with a single auth + member lookup
  const TIER_RANK: Record<string, number> = { free: 0, basic: 1, premium: 2 };
  let userTierRank = 0;

  const user = await getAuthUser();
  if (user) {
    const member = await getMemberById(user.id);
    userTierRank = TIER_RANK[member?.tier ?? 'free'] ?? 0;
  }

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl text-bmj-white">Downloads</h1>
      <p className="mt-2 max-w-xl font-body text-lg text-bmj-cream/70">
        Templates, worksheets, and toolkits for the disciplined man. Premium
        member resources.
      </p>
      <StarDivider className="mb-6" />

      <div className="mb-8">
        <Suspense fallback={<div className="h-10 border-b border-bmj-tan/20" />}>
          <DownloadCategoryTabs activeCategory={activeCategory ?? 'all'} />
        </Suspense>
      </div>

      {downloads.length === 0 && handbooks.length === 0 ? (
        <EmptyState
          heading="No downloads available"
          description="Downloadable resources are on the way. Check back soon."
          actionLabel="Browse articles"
          actionHref="/articles"
        />
      ) : (
        <div className="space-y-4">
          {/* Handbook cards (when handbook tab or All tab) */}
          {handbooks.length > 0 && (
            <div className="space-y-6">
              {!isHandbookCategory && handbooks.length > 0 && downloads.length > 0 && (
                <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
                  Handbooks
                </p>
              )}
              {handbooks.map((handbook) => (
                <HandbookCard
                  key={handbook.id}
                  title={handbook.title}
                  slug={handbook.slug}
                  lens={handbook.lens}
                  description={handbook.description}
                  accessTier={handbook.access_tier}
                  publishedAt={handbook.published_at}
                  coverImage={handbook.cover_image}
                />
              ))}
            </div>
          )}

          {/* Download cards */}
          {downloads.length > 0 && (
            <div className="space-y-4">
              {!isHandbookCategory && handbooks.length > 0 && (
                <p className="mt-8 font-label text-xs uppercase tracking-widest text-bmj-tan">
                  Downloads
                </p>
              )}
              {downloads.map((dl) => {
                const requiredRank = TIER_RANK[dl.access_tier] ?? 0;
                const userHasAccess = userTierRank >= requiredRank;
                return (
                  <DownloadCard
                    key={dl.id}
                    title={dl.title}
                    slug={dl.slug}
                    description={dl.description}
                    category={dl.category}
                    fileType={dl.file_type}
                    fileSize={dl.file_size}
                    accessTier={dl.access_tier}
                    hasAccess={userHasAccess}
                    fileUrl={dl.file_url}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
