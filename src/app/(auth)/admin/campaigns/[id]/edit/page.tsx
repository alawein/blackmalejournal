import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getCampaignById,
  getDistinctSubscriberSources,
  getAudienceCount,
} from '@/lib/supabase/admin-queries/campaigns';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { PATHS } from '@/lib/paths';
import { CampaignForm } from '../../CampaignForm';
import { deleteCampaignAction } from '../../actions';

export const metadata: Metadata = {
  title: 'Edit Campaign — Admin',
  robots: { index: false, follow: false },
};

interface EditCampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({
  params,
}: EditCampaignPageProps) {
  const { id } = await params;
  const campaign = await getCampaignById(id);

  if (!campaign) {
    notFound();
  }

  const audienceFilter = campaign.audience_filter ?? { activeOnly: true };

  const [sources, count] = await Promise.all([
    getDistinctSubscriberSources(),
    getAudienceCount(audienceFilter),
  ]);

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">
        EDIT CAMPAIGN
      </h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">
        ID: {campaign.id}
      </p>

      <CampaignForm
        campaign={campaign}
        subscriberSources={sources}
        initialAudienceCount={count}
      />

      {campaign.status === 'draft' && (
        <div className="mt-8">
          <DeleteButton
            action={deleteCampaignAction.bind(null, campaign.id)}
            itemName="campaign"
          />
        </div>
      )}
    </div>
  );
}
