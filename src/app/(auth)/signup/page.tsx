import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand/BrandMark';
import { SignupForm } from './SignupForm';
import type { TierId } from './TierSelector';
import { normalizeInternalPath } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Join the Movement',
  description: 'Create your account at The Black Male Journal. Access the archive and support independent media for Black men.',
  openGraph: {
    title: 'Join the Movement',
    description: 'Create your account at The Black Male Journal. Access the archive and support independent media for Black men.',
  },
  twitter: {
    card: 'summary',
    title: 'Join the Movement',
    description: 'Create your account at The Black Male Journal. Access the archive and support independent media for Black men.',
  },
};

interface SignupPageProps {
  searchParams: Promise<{ error?: string; tier?: string; next?: string }>;
}

const KNOWN_ERRORS: Record<string, string> = {
  'User already registered': 'An account with this email already exists.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters.',
};

const VALID_TIERS = new Set(['free', 'basic', 'premium']);

function resolveError(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return KNOWN_ERRORS[raw] ?? 'Something went wrong. Please try again.';
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const error = resolveError(params.error);
  const tier = VALID_TIERS.has(params.tier ?? '') ? (params.tier as TierId) : undefined;
  const nextHref = normalizeInternalPath(params.next, '/portal');

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <BrandMark size={48} color="var(--bmj-red)" />
          </div>
          <h1 className="mb-2 font-display text-4xl text-bmj-white">
            JOIN THE MOVEMENT
          </h1>
          <p className="font-body text-sm text-bmj-tan">
            Choose your membership. Access the archive.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
            <p className="font-body text-sm text-bmj-red">{error}</p>
          </div>
        )}

        <SignupForm
          preselectedTier={tier}
          nextHref={nextHref !== '/portal' ? nextHref : undefined}
        />
      </div>
    </div>
  );
}
