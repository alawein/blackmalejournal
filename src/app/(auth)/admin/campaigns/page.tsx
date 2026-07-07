import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminNotice } from '@/components/admin/AdminNotice';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getAllCampaigns } from '@/lib/supabase/admin-queries/campaigns';
import { PATHS, adminEditPath, withQuery } from '@/lib/paths';
import type { CampaignStatus } from '@/lib/supabase/types';
import { deleteCampaignAction } from './actions';

export const metadata: Metadata = {
  title: 'Campaigns — Admin',
  robots: { index: false, follow: false },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Status filter tabs ──────────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: CampaignStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Sent', value: 'sent' },
];

const VALID_STATUSES: CampaignStatus[] = ['draft', 'scheduled', 'sent', 'failed'];

// ── Page ────────────────────────────────────────────────────────────────────────

interface CampaignsAdminPageProps {
  searchParams: Promise<{
    status?: string;
    notice?: string;
  }>;
}

export default async function CampaignsAdminPage({
  searchParams,
}: CampaignsAdminPageProps) {
  const { status, notice } = await searchParams;

  const activeStatus = VALID_STATUSES.includes(status as CampaignStatus)
    ? (status as CampaignStatus)
    : undefined;

  const campaigns = await getAllCampaigns(
    activeStatus ? { status: activeStatus } : undefined,
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-bmj-white">
            CAMPAIGNS
          </h1>
          <p className="mt-1 font-mono text-sm text-bmj-tan">
            {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'}
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_CAMPAIGNS_NEW}
          className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Campaign
        </Link>
      </div>

      {notice ? (
        <AdminNotice title="Notice" message={notice} tone="success" />
      ) : null}

      {/* Status filter tabs */}
      <nav
        aria-label="Status filter"
        className="mt-6 flex flex-wrap gap-6 border-b border-bmj-tan/20"
      >
        {STATUS_TABS.map((tab) => {
          const isActive =
            activeStatus === tab.value ||
            (tab.value === undefined && activeStatus === undefined);
          return (
            <Link
              key={tab.label}
              href={withQuery(PATHS.ADMIN_CAMPAIGNS, {
                status: tab.value,
              })}
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

      {/* Campaign list */}
      <div className="mt-6">
        {campaigns.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No campaigns yet.{' '}
            <Link
              href={PATHS.ADMIN_CAMPAIGNS_NEW}
              className="text-bmj-red hover:underline"
            >
              Create your first campaign.
            </Link>
          </p>
        ) : (
          <ul>
            {campaigns.map((campaign) => (
              <li
                key={campaign.id}
                className="border-b border-bmj-tan/10 py-4"
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={campaign.status} />
                      <h2 className="truncate font-display text-lg text-bmj-white">
                        <Link
                          href={adminEditPath('campaigns', campaign.id)}
                          className="hover:text-bmj-red"
                        >
                          {campaign.title}
                        </Link>
                      </h2>
                    </div>
                    <p className="mt-1 truncate font-body text-sm text-bmj-cream/70">
                      {campaign.subject}
                    </p>
                    <p className="mt-1 font-mono text-xs text-bmj-tan">
                      {campaign.recipient_count} recipients &middot;{' '}
                      {formatDate(campaign.updated_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Link
                      href={adminEditPath('campaigns', campaign.id)}
                      className="font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-red"
                    >
                      Edit
                    </Link>
                    {campaign.status === 'draft' && (
                      <DeleteButton
                        action={deleteCampaignAction.bind(null, campaign.id)}
                        itemName="campaign"
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
