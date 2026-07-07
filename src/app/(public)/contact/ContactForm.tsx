'use client';

import { useState } from 'react';

const SUBJECTS = [
  'General Inquiry',
  'Membership Question',
  'Content Submission',
  'Partnership / Collaboration',
  'Press / Media',
  'Report an Issue',
];

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStatus('error');
        return;
      }

      setStatus('success');
      form.reset();
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-bmj-red/20 bg-bmj-brown p-8 text-center">
        <p className="font-display text-2xl uppercase text-bmj-cream">
          Message Sent
        </p>
        <p className="mt-2 font-body text-sm text-bmj-tan">
          The Chairman will respond.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 font-label text-xs uppercase tracking-widest text-bmj-red transition-colors hover:text-bmj-cream"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  const hasError = status === 'error';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="contact-name"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'contact-form-error' : undefined}
          autoComplete="name"
          className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'contact-form-error' : undefined}
          autoComplete="email"
          spellCheck={false}
          className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Subject
        </label>
        <select
          id="contact-subject"
          name="subject"
          required
          defaultValue=""
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'contact-form-error' : undefined}
          className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
        >
          <option value="" disabled className="text-bmj-tan/50">
            Select a subject
          </option>
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          minLength={10}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'contact-form-error' : undefined}
          className="w-full resize-none border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
          placeholder="What's on your mind?"
        />
      </div>

      {hasError && (
        <p
          id="contact-form-error"
          className="font-mono text-xs text-bmj-red"
          role="alert"
        >
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
