// src/components/layout/Footer.tsx
import Link from "next/link";
import { NewsletterForm } from './NewsletterForm';
import { BrandMark } from '@/components/brand/BrandMark';
import { ButtonLink } from '@/components/ui/Button';
import { FOOTER_NAV_LINKS, SOCIAL_LINKS } from '@/lib/nav';
import { PATHS } from '@/lib/paths';
import {
  SITE_NAME,
  SITE_TAGLINE,
  SUPPORT_PAYMENT_METHODS,
  SUPPORT_PATREON_URL,
} from '@/lib/seo';

type SupportPaymentMethod = (typeof SUPPORT_PAYMENT_METHODS)[number];

/** Same URLs as `SUPPORT_PAYMENT_METHODS`; footer prefers this display order. */
const FOOTER_DIRECT_SUPPORT_METHODS: SupportPaymentMethod[] = (
  ['PayPal', 'CashApp', 'Venmo'] as const
).map((label) => {
  const method = SUPPORT_PAYMENT_METHODS.find((m) => m.label === label);
  if (!method) {
    throw new Error(`Footer: missing SUPPORT_PAYMENT_METHODS entry for ${label}`);
  }
  return method;
});

export function Footer() {
  return (
    <footer className="accent-border-top bg-bmj-deep-black">
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Column 1 — Brand */}
          <div className="surface-panel flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <BrandMark size={28} color="var(--bmj-red)" />
              <div className="flex flex-col">
                <span className="font-display text-lg uppercase tracking-wordmark text-bmj-white">
                  {SITE_NAME}
                </span>
                <p className="mt-1 font-label text-xs uppercase tracking-label text-bmj-tan/70">
                  {SITE_TAGLINE}
                </p>
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed text-bmj-cream/70">
              Independent media house. Revolutionary masculinist platform covering
              five lenses of Black male life.
            </p>

            {/* Patreon — patronage channel */}
            <div className="pt-2">
              <p className="mb-2 font-label text-xs uppercase tracking-label text-bmj-tan">
                Support the Work
              </p>
              <ButtonLink
                href={SUPPORT_PATREON_URL}
                external
                variant="amber"
                size="sm"
              >
                Patreon — Join the Inner Circle
              </ButtonLink>
            </div>

            {/* Direct support */}
            <div className="pt-2">
              <p className="mb-2 font-label text-xs uppercase tracking-label text-bmj-tan">
                Direct Support
              </p>
              <div className="flex flex-wrap gap-3">
                {FOOTER_DIRECT_SUPPORT_METHODS.map((method) => (
                  <a
                    key={method.label}
                    href={method.href}
                    className="font-label text-xs uppercase tracking-label text-bmj-tan transition-colors hover:text-bmj-cream"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {method.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 — Navigation */}
          <nav aria-label="Footer navigation" className="surface-panel p-6">
            <h3 className="mb-4 font-label text-xs uppercase tracking-label text-bmj-tan">
              Navigate
            </h3>
            <ul className="flex flex-col gap-2">
              {FOOTER_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-bmj-cream/80 no-underline transition-colors hover:text-bmj-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3 — Connect */}
          <div className="surface-panel p-6">
            <h3 className="mb-4 font-label text-xs uppercase tracking-label text-bmj-tan">
              Connect
            </h3>

            {/* Social icons */}
            <div className="mb-6 flex gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="border border-bmj-tan/20 p-2 text-bmj-tan transition-[border-color,color,background-color,box-shadow] duration-200 hover:border-bmj-red/50 hover:bg-bmj-black/30 hover:text-bmj-cream hover:shadow-[0_0_8px_rgba(192,40,31,0.3)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={20} aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* Newsletter signup */}
            <h4 className="mb-3 font-label text-xs uppercase tracking-label text-bmj-tan">
              Newsletter
            </h4>
            <NewsletterForm source="footer" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-bmj-tan/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-bmj-tan">
            © 2026 {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href={PATHS.PRIVACY}
              className="font-mono text-xs text-bmj-tan no-underline transition-colors hover:text-bmj-cream"
            >
              Privacy Policy
            </Link>
            <Link
              href={PATHS.TERMS}
              className="font-mono text-xs text-bmj-tan no-underline transition-colors hover:text-bmj-cream"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
