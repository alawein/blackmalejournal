// src/app/(public)/page.tsx
import type { Metadata } from "next";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ThreeLenses } from "@/components/home/ThreeLenses";
import { BriefingPreview } from "@/components/home/BriefingPreview";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { LatestDispatches } from "@/components/home/LatestDispatches";
import { RotatingQuote } from "@/components/home/RotatingQuote";
import { JoinCTA } from "@/components/home/JoinCTA";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import PosterBlock from "@/components/content/PosterBlock";
import {
  getLatestBriefing,
  getFeaturedArticles,
  getLatestDispatches,
} from "@/lib/supabase/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  description:
    "Independent media house and revolutionary masculinist platform covering five lenses of Black male life.",
  openGraph: {
    title: "The Black Male Journal",
    description:
      "Independent media house and revolutionary masculinist platform covering five lenses of Black male life.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Black Male Journal",
    description:
      "Independent media house and revolutionary masculinist platform covering five lenses of Black male life.",
  },
};

export default async function HomePage() {
  const [briefing, articles, dispatches] = await Promise.all([
    getLatestBriefing(),
    getFeaturedArticles(5),
    getLatestDispatches(3),
  ]);

  return (
    <>
      <HeroBanner />
      <ScrollReveal>
        <ThreeLenses />
      </ScrollReveal>
      <ScrollReveal>
        <BriefingPreview briefing={briefing} />
      </ScrollReveal>
      <ScrollReveal>
        <PosterBlock
          title="The Architecture of Power"
          lens="politics"
          excerpt="A deep analysis of institutional power dynamics and the deliberate architecture of disenfranchisement."
          linkUrl="/articles"
        />
      </ScrollReveal>
      <ScrollReveal>
        <LatestDispatches dispatches={dispatches} />
      </ScrollReveal>
      <ScrollReveal>
        <FeaturedCarousel articles={articles} />
      </ScrollReveal>
      <ScrollReveal>
        <RotatingQuote />
      </ScrollReveal>
      <ScrollReveal>
        <JoinCTA />
      </ScrollReveal>
    </>
  );
}
