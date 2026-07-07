'use client';

import { useState } from 'react';
import { isValidEmailAddress, normalizeEmailAddress } from '@/lib/email';

interface NewsletterFormProps {
  source?: string;
}

export function NewsletterForm({ source = 'footer' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const normalizedEmail = normalizeEmailAddress(email);

  const validationError = touched && email.length > 0 && !isValidEmailAddress(normalizedEmail)
    ? 'Enter a valid email address.'
    : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmailAddress(normalizedEmail)) {
      setTouched(true);
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setEmail('');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="font-body text-sm text-bmj-cream" role="status">
        You&apos;re in. Watch your inbox.
      </p>
    );
  }

  const inputId = `newsletter-email-${source}`;
  const errorId = `newsletter-error-${source}`;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2"
      aria-label="Newsletter signup"
    >
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="your@email.com"
        required
        autoComplete="email"
        spellCheck={false}
        disabled={status === 'loading'}
        aria-invalid={!!validationError || status === 'error'}
        aria-describedby={(validationError || status === 'error') ? errorId : undefined}
        className={`border bg-bmj-black px-4 py-2 font-mono text-sm text-bmj-cream placeholder-bmj-tan/50 outline-none transition-colors disabled:opacity-50 ${
          validationError || status === 'error'
            ? 'border-bmj-red'
            : 'border-bmj-tan/30 focus:border-bmj-red'
        }`}
      />
      <button
        type="submit"
        disabled={status === 'loading' || !!validationError}
        className="bg-bmj-red px-4 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {(validationError || (status === 'error' && errorMsg)) && (
        <p id={errorId} className="font-mono text-xs text-bmj-red" role="alert">
          {validationError || errorMsg}
        </p>
      )}
    </form>
  );
}
