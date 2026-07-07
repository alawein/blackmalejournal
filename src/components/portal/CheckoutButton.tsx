'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  tier: 'basic' | 'premium';
  className?: string;
  children: React.ReactNode;
  returnTo?: string;
}

export function CheckoutButton({
  tier,
  className,
  children,
  returnTo,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, returnTo }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Could not start checkout. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Could not start checkout. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <span role="status">Redirecting...</span>
        ) : (
          children
        )}
      </button>
      {error && (
        <p role="alert" className="font-body text-xs text-bmj-red">
          {error}
        </p>
      )}
    </div>
  );
}
