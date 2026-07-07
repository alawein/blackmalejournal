import Link from 'next/link';
import { Heart } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { SUPPORT_PAYMENT_METHODS } from '@/lib/seo';

const QUICK_SUPPORT_METHODS = SUPPORT_PAYMENT_METHODS.slice(0, 2);

export function SupportCard() {
  return (
    <div className="surface-panel-strong p-8">
      <div className="mb-6 flex items-center gap-3">
        <Heart size={20} className="text-bmj-red" />
        <h3 className="font-label text-sm uppercase tracking-label text-bmj-white">
          Support the Mission
        </h3>
      </div>
      <p className="mb-6 font-body text-sm leading-relaxed text-bmj-cream/80">
        The Black Male Journal runs on community support. Every contribution
        fuels independent media for Black men.
      </p>

      <Link
        href={PATHS.SUPPORT}
        className="mb-6 block bg-bmj-red py-3.5 text-center font-label text-xs uppercase tracking-label text-bmj-white transition-all hover:bg-bmj-crimson hover:translate-y-[-1px]"
      >
        Fund the Mission
      </Link>

      <div className="flex justify-between text-center">
        {QUICK_SUPPORT_METHODS.map((method) => (
          <div key={method.label}>
            <span className="block font-label text-micro uppercase tracking-label text-bmj-tan">
              {method.label}
            </span>
            <span className="font-mono text-xs text-bmj-cream">
              {method.handle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
