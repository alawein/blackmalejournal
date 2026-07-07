import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand/BrandMark';
import { LoginForm } from './LoginForm';
import { normalizeInternalPath } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to The Black Male Journal to access your member portal, premium content, and the full archive.',
  openGraph: {
    title: 'Log In',
    description: 'Log in to The Black Male Journal to access your member portal, premium content, and the full archive.',
  },
  twitter: {
    card: 'summary',
    title: 'Log In',
    description: 'Log in to The Black Male Journal to access your member portal, premium content, and the full archive.',
  },
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; redirect?: string; next?: string }>;
}

const KNOWN_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Invalid email or password. Please try again.',
  'Email not confirmed': 'Please confirm your email before logging in.',
  'Could not authenticate': 'Authentication failed. Please try again.',
};

const KNOWN_MESSAGES: Record<string, string> = {
  'Check your email for the magic link': 'Check your email for the magic link.',
};

function resolveError(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return KNOWN_ERRORS[raw] ?? 'Something went wrong. Please try again.';
}

function resolveMessage(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return KNOWN_MESSAGES[raw] ?? undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = resolveError(params.error);
  const message = resolveMessage(params.message);
  const nextHref = normalizeInternalPath(params.next ?? params.redirect, '/portal');

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <BrandMark size={48} color="var(--bmj-red)" />
          </div>
          <h1 className="mb-2 font-display text-4xl text-bmj-white">LOG IN</h1>
          <p className="font-body text-sm text-bmj-tan">
            Welcome back to the movement.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
            <p className="font-body text-sm text-bmj-red">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 border border-bmj-amber/40 bg-bmj-amber/10 p-4">
            <p className="font-body text-sm text-bmj-amber">{message}</p>
          </div>
        )}

        <LoginForm nextHref={nextHref !== '/portal' ? nextHref : undefined} />
      </div>
    </div>
  );
}
