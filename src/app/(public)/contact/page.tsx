import type { Metadata } from 'next';
import { Mail, MessageCircle } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { StarDivider } from '@/components/ui/StarDivider';
import { StylizedImage } from '@/components/ui/StylizedImage';
import { SOCIAL_LINKS } from '@/lib/nav';
import { CONTACT_EMAILS } from '@/lib/seo';
import { PLACEHOLDERS } from '@/lib/placeholders';
import { ContactForm } from './ContactForm';
import { SupportCard } from './SupportCard';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export const metadata: Metadata = {
  title: 'Connect',
  description:
    'Reach the Chairman. Contact The Black Male Journal for inquiries, collaborations, and press.',
  openGraph: {
    title: 'Connect',
    description:
      'Reach the Chairman. Contact The Black Male Journal for inquiries, collaborations, and press.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Connect',
    description:
      'Reach the Chairman. Contact The Black Male Journal for inquiries, collaborations, and press.',
  },
};

const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? '#';

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-content px-6 py-16">
      {/* Split-layout hero */}
      <ScrollReveal as="div">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left — tagline, brand mark, stylized image */}
          <div className="flex flex-col">
            <div className="mb-6">
              <BrandMark size={48} color="var(--bmj-red)" />
            </div>
            <span className="font-label text-xs uppercase tracking-label text-bmj-tan">
              Reach the Chairman
            </span>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] text-bmj-white md:text-7xl">
              Connect
            </h1>
            <p className="mt-6 max-w-md font-body text-sm italic leading-relaxed text-bmj-cream/80">
              &ldquo;Speak the Truth. Navigate the Consequences.&rdquo;
            </p>
            <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-bmj-cream/70">
              Questions, ideas, collaborations, or just want to build with us — reach
              out. The Chairman reads every message.
            </p>

            {/* Stylized image anchor */}
            <div className="mt-8 max-w-md">
              <StylizedImage
                src={PLACEHOLDERS.cover}
                alt=""
                width={560}
                height={420}
                effect="halftone-heavy"
                grain
                dots
                aspect="video"
                className="border border-bmj-red/30"
              />
            </div>
          </div>

          {/* Right — form on a paper-texture panel */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-grain-texture opacity-[0.05] mix-blend-overlay"
            />
            <div className="relative border border-bmj-tan/20 bg-bmj-brown/50 p-6 sm:p-8 surface-panel">
              <h2 className="mb-6 font-label text-xs uppercase tracking-label text-bmj-tan">
                Send a Message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </ScrollReveal>

      <StarDivider className="my-16" />

      {/* Direct contact + socials + support */}
      <ScrollReveal as="div" delay={0.1}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr_1fr]">
          <div>
            <h2 className="mb-4 font-label text-xs uppercase tracking-label text-bmj-tan">
              Direct
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-bmj-red" />
                <a
                  href={`mailto:${CONTACT_EMAILS.general}`}
                  className="font-mono text-sm text-bmj-cream transition-colors hover:text-bmj-red"
                >
                  {CONTACT_EMAILS.general}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-bmj-red" />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-bmj-cream transition-colors hover:text-bmj-red"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-label text-xs uppercase tracking-label text-bmj-tan">
              Follow
            </h2>
            <div className="flex flex-wrap gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-bmj-tan transition-colors hover:text-bmj-cream"
                >
                  <Icon size={18} />
                  <span className="font-label text-xs uppercase tracking-label">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <SupportCard />
        </div>
      </ScrollReveal>
    </section>
  );
}
