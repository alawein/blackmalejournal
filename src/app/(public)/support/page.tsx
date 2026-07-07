import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand/BrandMark';
import { StarDivider } from '@/components/ui/StarDivider';
import { SupportFlow } from './SupportFlow';
import { AlternativeMethods } from './AlternativeMethods';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export const metadata: Metadata = {
  title: 'Support the Mission',
  description:
    'Fund independent media for Black men. No corporate sponsors. No advertisers. Just us.',
  openGraph: {
    title: 'Support the Mission',
    description:
      'Fund independent media for Black men. No corporate sponsors. No advertisers. Just us.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support the Mission',
    description:
      'Fund independent media for Black men. No corporate sponsors. No advertisers. Just us.',
  },
};

interface SupportPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const { status } = await searchParams;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      {status === 'success' && (
        <div className="mb-8 border border-bmj-red/30 bg-bmj-brown p-6 text-center">
          <p className="font-display text-2xl uppercase text-bmj-cream">
            Thank You
          </p>
          <p className="mt-2 font-body text-sm text-bmj-tan">
            Your support keeps The Black Male Journal independent. The Chairman salutes you.
          </p>
        </div>
      )}
      {status === 'cancel' && (
        <div className="mb-8 border border-bmj-tan/20 bg-bmj-brown p-4 text-center">
          <p className="font-body text-sm text-bmj-tan">
            Checkout was not completed. You can try again below.
          </p>
        </div>
      )}

      <ScrollReveal as="div">
        <div className="mb-6">
          <BrandMark size={40} color="var(--bmj-red)" />
        </div>
        <h1 className="mb-2 font-display text-5xl uppercase text-bmj-white md:text-7xl">
          Fund the Mission
        </h1>
        <p className="mb-10 max-w-lg font-body text-sm leading-relaxed text-bmj-cream/70">
          No corporate sponsors. No advertisers. No compromise. The Black Male
          Journal runs on the direct support of readers who believe independent
          media for Black men matters. Every dollar funds reporting, analysis, and
          the Weekend Briefing.
        </p>
      </ScrollReveal>

      <ScrollReveal as="div" delay={0.1}>
        <SupportFlow />
      </ScrollReveal>

      <StarDivider className="my-12" />

      <ScrollReveal as="div" delay={0.1}>
        <AlternativeMethods />
      </ScrollReveal>
    </section>
  );
}
