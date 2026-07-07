import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { getBriefings } from '@/lib/supabase/queries';
import { PageHeader } from '@/components/layout/PageHeader';
import { BriefingCard } from '@/components/content/BriefingCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PATHS, withQuery } from '@/lib/paths';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Weekend Briefing',
  description:
    'A weekly dispatch across five lenses of the Black male experience.',
  openGraph: {
    title: 'Weekend Briefing',
    description:
      'A weekly dispatch across five lenses of the Black male experience.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weekend Briefing',
    description:
      'A weekly dispatch across five lenses of the Black male experience.',
  },
};

const PAGE_SIZE = 10;

interface BriefingsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BriefingsPage({ searchParams }: BriefingsPageProps) {
  const { page: rawPage } = await searchParams;
  const parsedPage = parseInt(rawPage ?? '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);

  const offset = (page - 1) * PAGE_SIZE;
  const briefings = await getBriefings({ limit: PAGE_SIZE + 1, offset });

  const hasNext = briefings.length > PAGE_SIZE;
  const hasPrev = page > 1;
  const visible = briefings.slice(0, PAGE_SIZE);

  return (
    <div className="page-shell py-16">
      <PageHeader
        label="Flagship Publication"
        title="Weekend Briefing"
        icon={<BookOpen size={28} className="text-bmj-red" aria-hidden="true" />}
        description="A weekly dispatch across five lenses of the Black male experience."
        dividerClassName="mb-12"
      />

      {/* Briefing list */}
      {visible.length === 0 ? (
        <EmptyState
          heading="No briefings published yet"
          description="The first dispatch is being prepared."
        />
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((briefing) => (
              <BriefingCard key={briefing.id} briefing={briefing} />
            ))}
          </div>

          {(hasNext || hasPrev) && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {hasPrev && (
                <Link
                  href={withQuery(PATHS.BRIEFINGS, {
                    page: page > 2 ? String(page - 1) : undefined,
                  })}
                  className="btn-ghost"
                >
                  Newer briefings
                </Link>
              )}
              {hasNext && (
                <Link
                  href={withQuery(PATHS.BRIEFINGS, { page: String(page + 1) })}
                  className="btn-ghost"
                >
                  Older briefings
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
