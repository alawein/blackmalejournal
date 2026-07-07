import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/supabase/access';
import { isTierUpgrade } from '@/lib/membership';
import { getMemberById } from '@/lib/supabase/queries';
import { SubscriptionManager } from '@/components/portal/SubscriptionManager';
import { SettingsForm } from './SettingsForm';
import { signOut } from '../../actions';
import type { PaidMemberTier } from '@/lib/supabase/types';
import { normalizeInternalPath, PATHS } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your profile, subscription, and account settings.',
  robots: { index: false, follow: false },
};

interface SettingsPageProps {
  searchParams: Promise<{ error?: string; message?: string; next?: string; upgrade?: string }>;
}

const KNOWN_ERRORS: Record<string, string> = {
  'New password should be different from the old password.':
    'New password must be different from your current password.',
};

const KNOWN_MESSAGES: Record<string, string> = {
  'Profile updated': 'Profile updated successfully.',
  'Password updated': 'Password updated successfully.',
};

function resolveError(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return KNOWN_ERRORS[raw] ?? 'Something went wrong. Please try again.';
}

function resolveMessage(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return KNOWN_MESSAGES[raw] ?? undefined;
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const params = await searchParams;
  const error = resolveError(params.error);
  const message = resolveMessage(params.message);
  const nextHref = normalizeInternalPath(params.next, PATHS.PORTAL);
  const requestedTier: PaidMemberTier | undefined =
    params.upgrade === 'basic' || params.upgrade === 'premium'
      ? params.upgrade
      : undefined;

  const user = await getAuthUser();

  if (!user) redirect(PATHS.LOGIN);

  const member = await getMemberById(user.id);
  const tier = member?.tier ?? 'free';
  const displayName = (user.user_metadata?.display_name as string) || '';
  const requestedUpgrade =
    requestedTier && isTierUpgrade(tier, requestedTier) ? requestedTier : undefined;

  return (
    <div className="mx-auto max-w-article px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={PATHS.PORTAL}
        className="mb-6 inline-block font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
      >
        &larr; Back to Portal
      </Link>

      <h1 className="mb-8 font-display text-4xl text-bmj-white">SETTINGS</h1>

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

      {requestedUpgrade && (
        <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
          <p className="font-body text-sm text-bmj-cream">
            Your account is ready. Complete checkout to activate the{' '}
            <span className="font-label uppercase tracking-widest text-bmj-white">
              {requestedUpgrade}
            </span>{' '}
            plan.
          </p>
        </div>
      )}

      {/* Profile */}
      <section className="mb-10 border border-bmj-tan/20 bg-bmj-brown p-8">
        <h2 className="mb-6 font-display text-2xl text-bmj-white">PROFILE</h2>
        <SettingsForm displayName={displayName} email={user.email ?? ''} />
      </section>

      {/* Subscription */}
      <section className="mb-10 border border-bmj-tan/20 bg-bmj-brown p-8">
        <h2 className="mb-4 font-display text-2xl text-bmj-white">
          SUBSCRIPTION
        </h2>
        <SubscriptionManager
          tier={tier}
          hasSubscription={!!member?.stripe_subscription_id}
          requestedTier={requestedUpgrade}
          nextHref={nextHref !== '/portal' ? nextHref : undefined}
        />
      </section>

      {nextHref !== '/portal' && (
        <section className="mb-10 border border-bmj-tan/20 bg-bmj-brown p-8">
          <h2 className="mb-4 font-display text-2xl text-bmj-white">NEXT STEP</h2>
          <p className="mb-4 font-body text-sm text-bmj-cream/80">
            When your access is active, continue back to the content you were trying
            to open.
          </p>
          <Link
            href={nextHref}
            className="inline-flex items-center border border-bmj-tan/40 px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
          >
            Return to Requested Content
          </Link>
        </section>
      )}

      {/* Log Out */}
      <section className="border border-bmj-tan/20 bg-bmj-brown p-8">
        <h2 className="mb-4 font-display text-2xl text-bmj-white">SESSION</h2>
        <form action={signOut}>
          <button
            type="submit"
            className="border border-bmj-red/40 px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-red transition-colors hover:bg-bmj-red hover:text-bmj-white"
          >
            Log Out
          </button>
        </form>
      </section>
    </div>
  );
}
