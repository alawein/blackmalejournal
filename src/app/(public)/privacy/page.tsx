import type { Metadata } from "next";
import { StarDivider } from "@/components/ui/StarDivider";
import { PATHS } from '@/lib/paths';
import { CONTACT_EMAILS } from '@/lib/seo';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How The Black Male Journal collects, uses, and protects your data.",
  openGraph: {
    title: "Privacy Policy",
    description:
      "How The Black Male Journal collects, uses, and protects your data.",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy",
    description:
      "How The Black Male Journal collects, uses, and protects your data.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-article px-6 py-16">
      <p className="mb-2 font-label text-xs uppercase tracking-widest text-bmj-tan">
        Legal
      </p>
      <h1 className="mb-4 font-display text-5xl uppercase text-bmj-white md:text-6xl">
        PRIVACY POLICY
      </h1>
      <p className="mb-10 font-mono text-xs text-bmj-tan">
        Last updated: March 15, 2026
      </p>

      <p className="mb-8 font-body text-lg leading-article text-bmj-cream/90">
        The Black Male Journal (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) respects your privacy and is committed to protecting
        the personal information you share with us. This policy explains what
        data we collect, why we collect it, and how we handle it.
      </p>

      <StarDivider className="my-10" />

      {/* What We Collect */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          WHAT DATA WE COLLECT
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          We collect information you provide directly when you:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 font-body text-lg leading-article text-bmj-cream/90">
          <li>Create an account (email address, password)</li>
          <li>
            Subscribe to a membership tier (name, payment information via
            Stripe)
          </li>
          <li>Sign up for our newsletter (email address)</li>
          <li>Submit a contact form (name, email, message content)</li>
          <li>
            Interact with our site (pages visited, time on site, device type)
          </li>
        </ul>
      </div>

      {/* How We Use It */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          HOW WE USE YOUR DATA
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 font-body text-lg leading-article text-bmj-cream/90">
          <li>To provide and maintain your account and subscription</li>
          <li>To process payments and manage billing through Stripe</li>
          <li>
            To send you the Weekend Briefing and other content you have opted
            into
          </li>
          <li>To respond to your inquiries and support requests</li>
          <li>
            To understand how our site is used and improve the experience
          </li>
        </ul>
      </div>

      {/* Email Communications */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          EMAIL COMMUNICATIONS
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          When you subscribe to our newsletter or create an account, you may
          receive periodic emails including the Weekend Briefing, new article
          alerts, and membership updates. Every email includes an unsubscribe
          link. We will never sell your email address to third parties.
        </p>
      </div>

      {/* Payment Processing */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          PAYMENT PROCESSING
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          All payments are processed securely through{" "}
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            Stripe
          </a>
          . We never store your full credit card number, CVV, or banking details
          on our servers. Stripe handles all payment data in compliance with
          PCI-DSS standards. We retain only your Stripe customer ID and
          subscription status to manage your membership.
        </p>
      </div>

      {/* Analytics */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          ANALYTICS
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          We use privacy-focused analytics to understand how visitors interact
          with our site. We do not use Google Analytics. Our analytics do not
          track individual users across websites, do not use cookies for
          tracking, and comply with GDPR, CCPA, and PECR regulations.
        </p>
      </div>

      {/* Third-Party Services */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          THIRD-PARTY SERVICES
        </h2>
        <p className="mb-4 font-body text-lg leading-article text-bmj-cream/90">
          We use a limited number of third-party services to operate this
          platform:
        </p>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-article text-bmj-cream/90">
          <li>
            <strong className="text-bmj-white">Stripe</strong> — Payment
            processing and subscription management
          </li>
          <li>
            <strong className="text-bmj-white">Supabase</strong> — Database
            and authentication services
          </li>
          <li>
            <strong className="text-bmj-white">Vercel</strong> — Website
            hosting and deployment
          </li>
        </ul>
        <p className="mt-4 font-body text-lg leading-article text-bmj-cream/90">
          Each service has its own privacy policy. We share only the minimum
          data necessary for each service to function.
        </p>
      </div>

      {/* Data Retention */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          DATA RETENTION
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          We retain your account data for as long as your account is active. If
          you cancel your subscription, we keep your account information for 90
          days in case you wish to resubscribe, after which it is permanently
          deleted. Newsletter subscribers can unsubscribe at any time, and their
          email address will be removed from our mailing list within 48 hours.
        </p>
      </div>

      {/* Your Rights */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          YOUR RIGHTS
        </h2>
        <p className="mb-4 font-body text-lg leading-article text-bmj-cream/90">
          You have the right to:
        </p>
        <ul className="list-disc space-y-2 pl-6 font-body text-lg leading-article text-bmj-cream/90">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent for email communications at any time</li>
          <li>Export your data in a portable format</li>
        </ul>
      </div>

      <StarDivider className="my-10" />

      {/* Contact */}
      <div>
        <h2 className="mb-4 font-display text-2xl uppercase text-bmj-white">
          CONTACT US
        </h2>
        <p className="font-body text-lg leading-article text-bmj-cream/90">
          For any privacy-related questions or requests, contact us at{" "}
          <a
            href={`mailto:${CONTACT_EMAILS.privacy}`}
            className="text-bmj-amber underline underline-offset-2 transition-colors hover:text-bmj-cream"
          >
            {CONTACT_EMAILS.privacy}
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
