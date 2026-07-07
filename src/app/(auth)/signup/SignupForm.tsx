'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signup } from '../actions';
import { TierSelector, type TierId } from './TierSelector';
import { PATHS, withQuery } from '@/lib/paths';
import { Button } from '@/components/ui/Button';

interface SignupFormProps {
  preselectedTier?: TierId;
  nextHref?: string;
}

export function SignupForm({ preselectedTier, nextHref }: SignupFormProps) {
  const [selectedTier, setSelectedTier] = useState<TierId>(preselectedTier ?? 'free');

  return (
    <div className="space-y-8">
      {/* Tier selection */}
      <TierSelector selectedTier={selectedTier} onSelect={setSelectedTier} />

      {/* Signup form */}
      <div className="mx-auto max-w-md border border-bmj-red/20 bg-bmj-brown p-8">
        <form action={signup} className="space-y-4">
          <input type="hidden" name="tier" value={selectedTier} />
          {nextHref && <input type="hidden" name="next" value={nextHref} />}

          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              autoComplete="name"
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              aria-describedby="password-hint"
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="Create a password"
            />
            <p
              id="password-hint"
              role="note"
              className="mt-1 font-mono text-xs text-bmj-tan/60"
            >
              Minimum 6 characters
            </p>
          </div>

          {selectedTier !== 'free' && (
            <div className="border border-bmj-amber/30 bg-bmj-amber/10 p-3">
              <p className="font-label text-xs uppercase tracking-widest text-bmj-amber">
                Selected: {selectedTier} plan
              </p>
              <p className="mt-1 font-body text-xs text-bmj-tan">
                You&apos;ll be directed to payment after signup.
              </p>
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-bmj-tan">
          Already a member?{' '}
          <Link
            href={withQuery(PATHS.LOGIN, { next: nextHref })}
            className="text-bmj-red hover:text-bmj-cream"
          >
            Log in &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
