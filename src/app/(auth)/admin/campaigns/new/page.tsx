import type { Metadata } from 'next';
import {
  getDistinctSubscriberSources,
  getAudienceCount,
} from '@/lib/supabase/admin-queries/campaigns';
import { CampaignForm } from '../CampaignForm';

export const metadata: Metadata = {
  title: 'New Campaign — Admin',
  robots: { index: false, follow: false },
};

export default async function NewCampaignPage() {
  const [sources, count] = await Promise.all([
    getDistinctSubscriberSources(),
    getAudienceCount({ activeOnly: true }),
  ]);

  return (
    <div>
      <h1 className="mb-8 font-display text-4xl text-bmj-white">
        NEW CAMPAIGN
      </h1>
      <CampaignForm
        subscriberSources={sources}
        initialAudienceCount={count}
      />
    </div>
  );
}
