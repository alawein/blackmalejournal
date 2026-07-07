import type { Metadata } from "next";
import { StarDivider } from "@/components/ui/StarDivider";
import { PATHS } from '@/lib/paths';
import { CONTACT_EMAILS } from '@/lib/seo';

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using The Black Male Journal platform.",
  openGraph: {
    title: "Terms of Service",
    description:
      "Terms and conditions for using The Black Male Journal platform.",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service",
    description:
      "Terms and conditions for using The Black Male Journal platform.",
  },
};

export default function TermsOfServicePage() {
  return (
    <section className="mx-auto max-w-article px-6 py-16">
      <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
        Legal
      </p>
      <h1 className="mb-4 font-display text-5xl uppercase text-bmj-white md:text-6xl">
        TERMS OF SERVICE
      </h1>
      <p className="mb-10 font-mono text-xs text-bmj-tan">
        Last updated: March 15, 2026
      </p>

      <p className="mb-8 font-body text-lg leading-article text-bmj-cream/90">
        By accessing or using The Black Male Journal (&ldquo;the
        platform&rdquo;), you agree to be bound by these Terms of Service. If
        you do not agree with any part of these terms, you may not use the
        platform.
      </p>

      <StarDivider className="my-10" />

      {/* Account Terms */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          ACCOUNT TERMS
        </h2>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-article text-bmj-cream/90">
          <li>You must provide a valid email address to create an account.</li>
          <li>
            You are responsible for maintaining the security of your account
            and password.
          </li>
          <li>
            You are responsible for all activity that occurs under your
            account.
          </li>
          <li>You must be at least 18 years old to create an account.</li>
          <li>
            One person or legal entity may not maintain more than one account.
          </li>
        </ul>
      </div>

      {/* Subscription & Billing */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          SUBSCRIPTION AND BILLING
        </h2>
        <p className="mb-4 font-body text-lg leading-article text-bmj-cream/90">
          Paid subscriptions are billed in advance on a monthly or annual
          basis. All payments are processed securely through{" "}
          <a
            href="https://stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            Stripe
          </a>
          .
        </p>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-article text-bmj-cream/90">
          <li>
            Subscription fees are non-refundable except as required by law.
          </li>
          <li>
            You may cancel your subscription at any time. Access continues
            until the end of the current billing period.
          </li>
          <li>
            We reserve the right to change subscription pricing with 30 days
            notice to existing subscribers.
          </li>
          <li>
            Failed payments may result in temporary suspension of premium
            access until payment is resolved.
          </li>
        </ul>
      </div>

      {/* Content Ownership */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          CONTENT OWNERSHIP
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          All content published on The Black Male Journal — including articles,
          briefings, images, graphics, and videos — is the intellectual
          property of The Black Male Journal unless otherwise stated. You may
          not reproduce, distribute, or create derivative works from our
          content without explicit written permission. Brief quotations for
          commentary, criticism, or news reporting are permitted under fair
          use, provided proper attribution is given.
        </p>
      </div>

      {/* Acceptable Use */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          ACCEPTABLE USE
        </h2>
        <p className="mb-4 font-body text-lg leading-article text-bmj-cream/90">
          When using the platform, you agree not to:
        </p>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-article text-bmj-cream/90">
          <li>
            Share your account credentials or premium content with
            non-subscribers
          </li>
          <li>
            Use automated systems to scrape, copy, or redistribute content
          </li>
          <li>
            Harass, threaten, or abuse other members of the community
          </li>
          <li>
            Upload malicious code or attempt to compromise the platform
          </li>
          <li>
            Impersonate The Black Male Journal or its representatives
          </li>
          <li>Use the platform for any unlawful purpose</li>
        </ul>
      </div>

      {/* Termination */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          TERMINATION
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          We reserve the right to suspend or terminate your account at our
          discretion if you violate these terms. You may delete your account at
          any time by contacting us. Upon termination, your right to access
          paid content ceases immediately. We are not obligated to provide
          refunds for the remaining subscription period in cases of termination
          for violations of these terms.
        </p>
      </div>

      {/* Disclaimers */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          DISCLAIMERS
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          The content published on The Black Male Journal is for informational
          and educational purposes only. It does not constitute medical, legal,
          financial, or professional advice. Health-related content under our
          Health lens is not a substitute for professional medical consultation.
          We make no warranties about the completeness, reliability, or
          accuracy of the information provided. Your use of the platform is at
          your own risk.
        </p>
      </div>

      <StarDivider className="my-10" />

      {/* Contact */}
      <div>
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          CONTACT
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          Questions about these terms? Reach us at{" "}
          <a
            href={`mailto:${CONTACT_EMAILS.support}`}
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            {CONTACT_EMAILS.support}
          </a>{" "}
          or through our{" "}
          <a
            href={PATHS.CONTACT}
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            contact page
          </a>
          .
        </p>
      </div>
    </section>
  );
}
