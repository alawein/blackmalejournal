import type { Metadata } from 'next';
import Link from 'next/link';
import { StarDivider } from '@/components/ui/StarDivider';
import { PATHS } from '@/lib/paths';
import { CONTACT_EMAILS } from '@/lib/seo';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Editorial Ethics',
  description:
    'The editorial standards, independence principles, and accountability framework of The Black Male Journal.',
  openGraph: {
    title: 'Editorial Ethics — The Black Male Journal',
    description:
      'The editorial standards, independence principles, and accountability framework of The Black Male Journal.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Editorial Ethics — The Black Male Journal',
    description:
      'The editorial standards, independence principles, and accountability framework of The Black Male Journal.',
  },
};

export default function EthicsPage() {
  return (
    <section className="mx-auto max-w-content px-6 py-16">
      <PageHeader
        label="Standards"
        title="Editorial Ethics"
        description="The principles that govern everything we publish."
        dividerClassName="mb-12"
      />

      {/* Independence */}
      <div className="max-w-article space-y-6">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Principle I
        </p>
        <h2 className="font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Independence
        </h2>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          We accept no corporate sponsors. We carry no advertisers. We answer to
          no editorial board, no investors, and no algorithm. The Black Male
          Journal is funded by its readers and governed by the discipline of a
          singular editorial vision. Independence is not a marketing angle — it
          is the condition under which honest work becomes possible.
        </p>
      </div>

      <StarDivider className="my-12" />

      {/* Accuracy & Rigor */}
      <div className="max-w-article space-y-6">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Principle II
        </p>
        <h2 className="font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Accuracy & Rigor
        </h2>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          Every claim published in this journal is either grounded in verifiable
          evidence or clearly marked as analysis, opinion, or commentary. We do
          not traffic in speculation presented as fact. When we make an error, we
          correct it publicly, promptly, and without equivocation. The correction
          is appended to the original piece with a clear note explaining what
          changed and why.
        </p>
      </div>

      <StarDivider className="my-12" />

      {/* Corrections Policy */}
      <div className="max-w-article space-y-6">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Principle III
        </p>
        <h2 className="font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Corrections Policy
        </h2>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          If you identify a factual error in any published piece, contact the
          Chairman directly at {CONTACT_EMAILS.general}. All credible
          corrections will be investigated within 48 hours. Confirmed errors will
          be corrected in the original text with a dated correction note. We do
          not silently edit published work.
        </p>
      </div>

      <StarDivider className="my-12" />

      {/* Conflicts of Interest */}
      <div className="max-w-article space-y-6">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Principle IV
        </p>
        <h2 className="font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Conflicts of Interest
        </h2>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          The Chairman discloses any material relationship that could reasonably
          be perceived as influencing editorial judgment. The Black Male Journal
          does not publish paid content, sponsored posts, or affiliate-driven
          recommendations without explicit disclosure. When a piece discusses a
          product, service, or organization in which the publication or its
          author has a financial interest, that interest is stated clearly.
        </p>
      </div>

      <StarDivider className="my-12" />

      {/* Attribution & Sources */}
      <div className="max-w-article space-y-6">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Principle V
        </p>
        <h2 className="font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Attribution & Sources
        </h2>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          We credit our sources. When quoting or building on the work of other
          writers, researchers, or institutions, we cite them explicitly. We do
          not pass off others&apos; ideas as our own. We protect confidential
          sources when the information serves the public interest and the source
          faces genuine risk of harm.
        </p>
      </div>

      <StarDivider className="my-12" />

      {/* CTA */}
      <div className="max-w-article space-y-6">
        <p className="font-label text-xs uppercase tracking-widest text-bmj-tan">
          Questions
        </p>
        <h2 className="font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Hold Us Accountable
        </h2>
        <p className="font-body text-base leading-relaxed text-bmj-cream/80">
          These are not aspirational principles. They are operational
          commitments. If you believe we have fallen short of any standard stated
          on this page, we want to hear about it.
        </p>
        <Link
          href={PATHS.CONTACT}
          className="inline-block bg-bmj-red px-8 py-4 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          Contact Us
        </Link>
      </div>
    </section>
  );
}
