'use client';

import { BrandMark } from '@/components/brand/BrandMark';
import { PATHS } from '@/lib/paths';
import { Button, ButtonLink } from '@/components/ui/Button';

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-6 py-24 text-center">
      <BrandMark size={48} color="var(--bmj-red)" className="mb-8 opacity-40" />

      <p className="mb-4 font-mono text-xs uppercase tracking-label-max text-bmj-tan">
        Portal Error
      </p>

      <h1 className="mb-6 font-display text-5xl leading-none text-bmj-white sm:text-7xl">
        ACCESS INTERRUPTED
      </h1>

      <div className="mx-auto mb-8 h-[3px] w-24 bg-bmj-red" />

      <p className="mx-auto mb-12 max-w-md font-body text-lg leading-relaxed text-bmj-cream/70">
        Something went wrong loading this page. Try again or return to your portal.
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Button onClick={reset} variant="secondary">
          Try Again
        </Button>
        <ButtonLink href={PATHS.PORTAL} variant="ghost">
          Back to Portal
        </ButtonLink>
      </div>
    </div>
  );
}
