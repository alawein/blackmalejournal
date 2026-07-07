// src/components/home/LatestDispatches.tsx
import { DispatchCard } from '@/components/content/DispatchCard';
import { ButtonLink } from '@/components/ui/Button';
import { PATHS } from '@/lib/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import type { DispatchListItem } from '@/lib/supabase/types';

interface LatestDispatchesProps {
  dispatches: DispatchListItem[];
}

export function LatestDispatches({ dispatches }: LatestDispatchesProps) {
  return (
    <section className="bg-bmj-black py-20">
      <div className="page-shell-tight">
        <PageHeader
          as="h2"
          tone="section"
          align="center"
          title="Latest Dispatches"
          label="Field Notes"
          description="Short-form argument and rapid-response analysis from the running edge of the publication."
          dividerPosition="top"
          dividerClassName="mb-10"
        />

        {dispatches.length > 0 ? (
          <div className="mt-12 mx-auto max-w-article space-y-4">
            {dispatches.map((dispatch, i) => (
              <ScrollReveal key={dispatch.id} delay={i * 0.08} direction="up">
                <DispatchCard
                  title={dispatch.title}
                  slug={dispatch.slug}
                  lens={dispatch.lens}
                  excerpt={dispatch.excerpt}
                  publishedAt={dispatch.published_at}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="section-empty-state">
            <p className="section-empty-state-text">Dispatches coming soon.</p>
          </div>
        )}

        {dispatches.length > 0 && (
          <div className="mt-10 text-center">
            <ButtonLink href={PATHS.BLOG} variant="ghost">
              All Dispatches &rarr;
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
