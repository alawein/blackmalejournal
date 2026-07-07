'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login, signInWithMagicLink } from '../actions';
import { PATHS, withQuery } from '@/lib/paths';
import { Button } from '@/components/ui/Button';

interface LoginFormProps {
  nextHref?: string;
}

export function LoginForm({ nextHref }: LoginFormProps) {
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  return (
    <div className="border border-bmj-red/20 bg-bmj-brown p-8">
      <div
        className="mb-6 flex gap-4 border-b border-bmj-tan/20 pb-4"
        role="tablist"
        aria-label="Login method"
      >
        <button
          type="button"
          role="tab"
          id="login-tab-password"
          aria-selected={mode === 'password'}
          aria-controls="login-panel-password"
          tabIndex={mode === 'password' ? 0 : -1}
          onClick={() => setMode('password')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'password'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          id="login-tab-magic"
          aria-selected={mode === 'magic'}
          aria-controls="login-panel-magic"
          tabIndex={mode === 'magic' ? 0 : -1}
          onClick={() => setMode('magic')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'magic'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Magic Link
        </button>
      </div>

      <div
        role="tabpanel"
        id="login-panel-password"
        aria-labelledby="login-tab-password"
        hidden={mode !== 'password'}
      >
        <form action={login} className="space-y-4">
          {nextHref && <input type="hidden" name="next" value={nextHref} />}
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
              autoComplete="current-password"
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth>
            Log In
          </Button>
        </form>
      </div>

      <div
        role="tabpanel"
        id="login-panel-magic"
        aria-labelledby="login-tab-magic"
        hidden={mode !== 'magic'}
      >
        <form action={signInWithMagicLink} className="space-y-4">
          {nextHref && <input type="hidden" name="next" value={nextHref} />}
          <div>
            <label
              htmlFor="magic-email"
              className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
            >
              Email
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth>
            Send Magic Link
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center font-body text-sm text-bmj-tan">
        Don&apos;t have an account?{' '}
        <Link
          href={withQuery(PATHS.SIGNUP, { next: nextHref })}
          className="text-bmj-red hover:text-bmj-cream"
        >
          Join the movement &rarr;
        </Link>
      </p>
    </div>
  );
}
