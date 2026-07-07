import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PATHS } from '@/lib/paths';
import { getAdminMemberById } from '@/lib/supabase/admin-queries';
import { updateMemberAction } from '../actions';

export const metadata: Metadata = {
  title: 'Member Detail — Admin',
  robots: { index: false, follow: false },
};

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function MemberDetailPage({
  params,
  searchParams,
}: MemberDetailPageProps) {
  const { id } = await params;
  const { error, message } = await searchParams;
  const member = await getAdminMemberById(id);

  if (!member) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={PATHS.ADMIN_MEMBERS}
        className="mb-6 inline-block font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
      >
        &larr; Back to Members
      </Link>

      <h1 className="font-display text-3xl tracking-widest text-bmj-white">MEMBER DETAIL</h1>
      <p className="mt-2 font-mono text-sm text-bmj-tan">{member.email}</p>

      {error && (
        <div className="mt-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
          <p className="font-body text-sm text-bmj-red">{error}</p>
        </div>
      )}

      {message && (
        <div className="mt-6 border border-bmj-amber/40 bg-bmj-amber/10 p-4">
          <p className="font-body text-sm text-bmj-amber">{message}</p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-bmj-tan/20 bg-bmj-brown p-8">
          <h2 className="mb-6 font-display text-2xl text-bmj-white">ACCESS CONTROL</h2>
          <form action={updateMemberAction} className="space-y-6">
            <input type="hidden" name="memberId" value={member.id} />
            <input type="hidden" name="returnTo" value={`${PATHS.ADMIN_MEMBERS}/${member.id}`} />

            <div>
              <label htmlFor="tier" className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
                Tier
              </label>
              <select
                id="tier"
                name="tier"
                defaultValue={member.tier}
                className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label htmlFor="role" className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue={member.role}
                className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
              >
                <option value="member">Member</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-bmj-red px-6 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
            >
              Save Changes
            </button>
          </form>
        </section>

        <section className="border border-bmj-tan/20 bg-bmj-brown p-8">
          <h2 className="mb-6 font-display text-2xl text-bmj-white">ACCOUNT RECORD</h2>
          <dl className="space-y-4">
            <div>
              <dt className="font-label text-micro uppercase tracking-widest text-bmj-tan">Member ID</dt>
              <dd className="mt-1 break-all font-mono text-sm text-bmj-cream">{member.id}</dd>
            </div>
            <div>
              <dt className="font-label text-micro uppercase tracking-widest text-bmj-tan">Joined</dt>
              <dd className="mt-1 font-mono text-sm text-bmj-cream">{formatDate(member.created_at)}</dd>
            </div>
            <div>
              <dt className="font-label text-micro uppercase tracking-widest text-bmj-tan">Stripe Customer</dt>
              <dd className="mt-1 break-all font-mono text-sm text-bmj-cream/80">
                {member.stripe_customer_id ?? 'Not connected'}
              </dd>
            </div>
            <div>
              <dt className="font-label text-micro uppercase tracking-widest text-bmj-tan">Stripe Subscription</dt>
              <dd className="mt-1 break-all font-mono text-sm text-bmj-cream/80">
                {member.stripe_subscription_id ?? 'Not connected'}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
