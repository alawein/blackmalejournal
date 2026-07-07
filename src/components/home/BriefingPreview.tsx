// src/components/home/BriefingPreview.tsx
import { BriefingCard } from "@/components/content/BriefingCard";
import { PageHeader } from "@/components/layout/PageHeader";
import type { BriefingListItem } from "@/lib/supabase/types";

interface BriefingPreviewProps {
  briefing: BriefingListItem | null;
}

export function BriefingPreview({ briefing }: BriefingPreviewProps) {
  return (
    <section className="bg-bmj-deep-black py-20">
      <div className="page-shell-tight">
        <PageHeader
          as="h2"
          tone="section"
          align="center"
          title="Latest Briefing"
          label="Flagship Publication"
          description="The weekly issue that sets the publication’s temperature: doctrine, analysis, and disciplined commentary."
          dividerPosition="top"
          dividerClassName="mb-10"
        />

        {briefing ? (
          <div className="mt-12 mx-auto max-w-article">
            <BriefingCard briefing={briefing} />
          </div>
        ) : (
          <div className="section-empty-state">
            <p className="section-empty-state-text">
              The next briefing is in preparation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
