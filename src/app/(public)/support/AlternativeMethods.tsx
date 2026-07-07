import { ExternalLink } from 'lucide-react';
import { SUPPORT_PAYMENT_METHODS, SUPPORT_PATREON_URL } from '@/lib/seo';

export function AlternativeMethods() {
  return (
    <div className="space-y-6">
      <h2 className="font-label text-xs uppercase tracking-widest text-bmj-tan">
        More Ways to Support
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SUPPORT_PAYMENT_METHODS.map((method) => (
          <a
            key={method.label}
            href={method.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-bmj-tan/20 bg-bmj-brown px-4 py-3 transition-colors hover:border-bmj-red/40"
          >
            <div>
              <span className="block font-label text-xs uppercase tracking-widest text-bmj-cream">
                {method.label}
              </span>
              <span className="mt-0.5 block font-mono text-stamp text-bmj-tan">
                {method.handle}
              </span>
            </div>
            <ExternalLink size={14} className="shrink-0 text-bmj-tan/50" />
          </a>
        ))}
      </div>

      <a
        href={SUPPORT_PATREON_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-bmj-amber/30 bg-bmj-brown px-4 py-4 text-center transition-colors hover:border-bmj-amber/60"
      >
        <span className="block font-label text-sm uppercase tracking-widest text-bmj-amber">
          Join the Inner Circle on Patreon
        </span>
        <span className="mt-1 block font-body text-xs text-bmj-cream/60">
          Early content, private resources, and direct support for the work
        </span>
      </a>
    </div>
  );
}
