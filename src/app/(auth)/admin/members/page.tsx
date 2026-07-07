import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import {
  getAllMembers,
  getMemberAdminInsights,
  getMemberCount,
} from '@/lib/supabase/admin-queries';
import { PATHS } from '@/lib/paths';
import type { MemberTier, MemberRole } from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Members — Admin',
  robots: { index: false, follow: false },
};

const tierStyles: Record<MemberTier, string> = {
  free: 'bg-bmj-tan/20 text-bmj-tan',
  basic: 'bg-bmj-amber/20 text-bmj-amber',
  premium: 'bg-bmj-red/20 text-bmj-red',
};

function TierBadge({ tier }: { tier: MemberTier }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-label text-micro uppercase tracking-widest ${tierStyles[tier]}`}
    >
      {tier}
    </span>
  );
}

const roleStyles: Record<MemberRole, string> = {
  member: 'bg-bmj-tan/10 text-bmj-tan/70',
  editor: 'bg-bmj-amber/10 text-bmj-amber/70',
  admin: 'bg-bmj-red/10 text-bmj-red/70',
};

function RoleBadge({ role }: { role: MemberRole }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-label text-micro uppercase tracking-widest ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const TIER_TABS: { label: string; value: string | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Free', value: 'free' },
  { label: 'Basic', value: 'basic' },
  { label: 'Premium', value: 'premium' },
];

const ROLE_FILTERS: { label: string; value: string | undefined }[] = [
  { label: 'All Roles', value: undefined },
  { label: 'Members', value: 'member' },
  { label: 'Editors', value: 'editor' },
  { label: 'Admins', value: 'admin' },
];

interface MembersAdminPageProps {
  searchParams: Promise<{
    tier?: string;
    role?: string;
    q?: string;
    error?: string;
    message?: string;
  }>;
}

export default async function MembersAdminPage({
  searchParams,
}: MembersAdminPageProps) {
  const { tier, role, q, error, message } = await searchParams;

  const validTiers: MemberTier[] = ['free', 'basic', 'premium'];
  const validRoles: MemberRole[] = ['member', 'editor', 'admin'];
  const activeTier = validTiers.includes(tier as MemberTier)
    ? (tier as MemberTier)
    : undefined;
  const activeRole = validRoles.includes(role as MemberRole)
    ? (role as MemberRole)
    : undefined;

  const [members, totalCount, insights] = await Promise.all([
    getAllMembers({
      tier: activeTier,
      role: activeRole,
      query: q,
    }),
    getMemberCount(),
    getMemberAdminInsights(),
  ]);

  function makeHref(nextTier?: string, nextRole = activeRole, nextQuery = q) {
    const params = new URLSearchParams();
    if (nextTier) params.set('tier', nextTier);
    if (nextRole) params.set('role', nextRole);
    if (nextQuery) params.set('q', nextQuery);
    const query = params.toString();
    return query ? `${PATHS.ADMIN_MEMBERS}?${query}` : PATHS.ADMIN_MEMBERS;
  }

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl tracking-widest text-bmj-white">
          MEMBERS
        </h1>
        <p className="mt-1 font-mono text-sm text-bmj-tan">
          {totalCount} {totalCount === 1 ? 'member' : 'members'} total
        </p>
      </div>

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

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard
          label="Paying Members"
          value={insights.paying}
          helper={`${insights.basic} basic · ${insights.premium} premium`}
          tone="success"
        />
        <AdminMetricCard
          label="Billing Exceptions"
          value={insights.billingExceptions}
          helper="Paying members missing Stripe references"
          tone={insights.billingExceptions > 0 ? 'warning' : 'default'}
        />
        <AdminMetricCard
          label="Staff Accounts"
          value={insights.admins + insights.editors}
          helper={`${insights.admins} admins · ${insights.editors} editors`}
        />
        <AdminMetricCard
          label="Stripe Customers"
          value={insights.stripeCustomers}
          helper={`${insights.stripeSubscriptions} subscription records`}
        />
        <AdminMetricCard
          label="New Members 30d"
          value={insights.joinedPast30Days}
          helper={`${insights.free} free members in current base`}
        />
        <AdminMetricCard
          label="Premium Share"
          value={`${insights.total === 0 ? 0 : Math.round((insights.premium / insights.total) * 100)}%`}
          helper="Premium tier share of the member base"
          tone="default"
        />
      </div>

      {insights.billingExceptions > 0 && (
        <div className="mt-6 border border-bmj-amber/30 bg-bmj-amber/10 p-4">
          <p className="font-label text-xs uppercase tracking-widest text-bmj-amber">
            Billing Review Needed
          </p>
          <p className="mt-2 font-body text-sm text-bmj-cream/80">
            {insights.billingExceptions} paying members are missing a Stripe
            customer ID or subscription ID. Use this page to inspect tier and role
            assignments before making a manual correction.
          </p>
        </div>
      )}

      <nav
        aria-label="Tier filter"
        className="mt-6 flex gap-6 border-b border-bmj-tan/20"
      >
        {TIER_TABS.map((tab) => {
          const isActive =
            activeTier === tab.value ||
            (tab.value === undefined && activeTier === undefined);
          return (
            <Link
              key={tab.label}
              href={makeHref(tab.value)}
              className={`pb-3 font-label text-xs uppercase tracking-widest transition-colors ${
                isActive
                  ? 'border-b-2 border-bmj-red text-bmj-white'
                  : 'text-bmj-tan hover:text-bmj-cream'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <form className="mt-6 grid grid-cols-1 gap-4 border border-bmj-tan/20 bg-bmj-brown p-4 lg:grid-cols-[1fr_220px_auto]">
        <div>
          <label htmlFor="q" className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
            Search Email
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q ?? ''}
            placeholder="chairman@example.com"
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={activeRole ?? ''}
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
          >
            {ROLE_FILTERS.map((filter) => (
              <option key={filter.label} value={filter.value ?? ''}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3">
          {activeTier && <input type="hidden" name="tier" value={activeTier} />}
          <button
            type="submit"
            className="bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Filter
          </button>
          <Link
            href={PATHS.ADMIN_MEMBERS}
            className="border border-bmj-tan/30 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-6">
        {members.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No members found.
          </p>
        ) : (
          <ul>
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between border-b border-bmj-tan/10 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <TierBadge tier={member.tier} />
                    <RoleBadge role={member.role} />
                    <p className="truncate font-mono text-sm text-bmj-cream">
                      {member.email}
                    </p>
                  </div>
                  <p className="mt-1 font-mono text-xs text-bmj-tan">
                    Joined {formatDate(member.created_at)}
                  </p>
                </div>
                <Link
                  href={`${PATHS.ADMIN_MEMBERS}/${member.id}`}
                  className="ml-4 shrink-0 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-red"
                >
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
