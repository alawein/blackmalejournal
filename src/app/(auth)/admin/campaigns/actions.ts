'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { PATHS } from '@/lib/paths';
import { renderCampaignEmail } from '@/lib/email-template';
import type { AudienceFilter } from '@/lib/supabase/types';
import {
  createCampaign,
  deleteCampaign,
  getAudienceCount,
  getCampaignById,
  updateCampaign,
} from '@/lib/supabase/admin-queries/campaigns';

// ── Zod schema ──────────────────────────────────────────────────────────────────

const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string(),
  audience_filter: z.string(),
  scheduled_at: z.string().optional(),
});

// ── Save (create or update) ─────────────────────────────────────────────────────

export async function saveCampaign(
  formData: FormData,
): Promise<{ error: string } | void> {
  const raw = Object.fromEntries(formData.entries());
  const id = (raw.id as string) || '';

  const parsed = campaignSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    return { error: firstError };
  }

  const { title, subject, body, audience_filter, scheduled_at } = parsed.data;

  // Parse audience filter JSON
  let audienceFilter: AudienceFilter;
  try {
    audienceFilter = JSON.parse(audience_filter) as AudienceFilter;
  } catch {
    return { error: 'Invalid audience filter format' };
  }

  const recipient_count = await getAudienceCount(audienceFilter);

  // Determine status: scheduled if scheduled_at provided, else draft
  const status = scheduled_at?.trim() ? 'scheduled' : 'draft';

  const payload = {
    title,
    subject,
    body,
    audience_filter: audienceFilter,
    recipient_count,
    status: status as 'draft' | 'scheduled',
    scheduled_at: scheduled_at?.trim() || null,
  };

  if (id) {
    const result = await updateCampaign(id, payload);
    if (!result) {
      return { error: 'Failed to update campaign' };
    }
  } else {
    const result = await createCampaign(payload);
    if (!result) {
      return { error: 'Failed to create campaign' };
    }
  }

  revalidatePath(PATHS.ADMIN_CAMPAIGNS);
  redirect(PATHS.ADMIN_CAMPAIGNS);
}

// ── Delete ──────────────────────────────────────────────────────────────────────

export async function deleteCampaignAction(id: string): Promise<void> {
  const campaign = await getCampaignById(id);
  if (!campaign) {
    redirect(`${PATHS.ADMIN_CAMPAIGNS}?notice=${encodeURIComponent('Campaign not found')}`);
  }

  if (campaign.status !== 'draft') {
    redirect(
      `${PATHS.ADMIN_CAMPAIGNS}?notice=${encodeURIComponent('Only draft campaigns can be deleted')}`,
    );
  }

  const result = await deleteCampaign(id);
  if (!result) {
    redirect(
      `${PATHS.ADMIN_CAMPAIGNS}?notice=${encodeURIComponent('Failed to delete campaign')}`,
    );
  }

  revalidatePath(PATHS.ADMIN_CAMPAIGNS);
  redirect(PATHS.ADMIN_CAMPAIGNS);
}

// ── Preview ─────────────────────────────────────────────────────────────────────

export async function previewCampaignEmail(
  subject: string,
  body: string,
): Promise<{ html: string }> {
  return { html: renderCampaignEmail(subject, body) };
}

// ── Audience count ──────────────────────────────────────────────────────────────

export async function fetchAudienceCount(
  filter: AudienceFilter,
): Promise<{ count: number }> {
  const count = await getAudienceCount(filter);
  return { count };
}
