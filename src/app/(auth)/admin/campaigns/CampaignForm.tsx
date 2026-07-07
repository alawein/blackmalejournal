'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import type { Campaign } from '@/lib/supabase/types';
import { PATHS } from '@/lib/paths';
import {
  saveCampaign,
  previewCampaignEmail,
  fetchAudienceCount,
} from './actions';
import { CampaignPreviewPane } from './CampaignPreviewPane';

// ── Types ───────────────────────────────────────────────────────────────────────

interface CampaignFormProps {
  campaign?: Campaign;
  subscriberSources: string[];
  initialAudienceCount: number;
}

// ── Submit button with pending state ────────────────────────────────────────────

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Saving...' : isEdit ? 'Update Campaign' : 'Save Draft'}
    </button>
  );
}

// ── Shared field classes ────────────────────────────────────────────────────────

const inputClass =
  'w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none';

const labelClass =
  'mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan';

const selectClass =
  'w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none';

// ── Component ───────────────────────────────────────────────────────────────────

export function CampaignForm({
  campaign,
  subscriberSources,
  initialAudienceCount,
}: CampaignFormProps) {
  const isEdit = Boolean(campaign);

  // Audience filter state
  const existingFilter = campaign?.audience_filter ?? {};
  const [activeOnly, setActiveOnly] = useState(
    existingFilter.activeOnly !== false,
  );
  const [source, setSource] = useState(existingFilter.source ?? '');

  // Audience count display
  const [audienceCount, setAudienceCount] = useState(initialAudienceCount);

  // Live preview state — mirrored onto every keystroke so the preview
  // pane updates as the editor types.
  const [liveTitle, setLiveTitle] = useState(campaign?.title ?? '');
  const [liveSubject, setLiveSubject] = useState(campaign?.subject ?? '');
  const [liveBody, setLiveBody] = useState(campaign?.body ?? '');

  // Full-render iframe preview state (kept for legacy "Preview Email" button)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  // Form action state
  const [state, formAction] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await saveCampaign(formData);
      // If result is returned (not redirect), it has an error
      if (result && 'error' in result) {
        return result;
      }
      return null;
    },
    null,
  );

  // Compute audience filter JSON
  const audienceFilterJson = JSON.stringify({
    activeOnly,
    ...(source ? { source } : {}),
  });

  async function handlePreview() {
    const subjectEl = document.getElementById('subject') as HTMLInputElement;
    const bodyEl = document.getElementById('body') as HTMLTextAreaElement;
    if (!subjectEl?.value || !bodyEl?.value) return;

    setPreviewing(true);
    try {
      const result = await previewCampaignEmail(
        subjectEl.value,
        bodyEl.value,
      );
      setPreviewHtml(result.html);
    } finally {
      setPreviewing(false);
    }
  }

  // Recalculate audience count when filter changes via server action
  async function handleFilterChange(
    nextActiveOnly: boolean,
    nextSource: string,
  ) {
    setActiveOnly(nextActiveOnly);
    setSource(nextSource);

    try {
      const filter = {
        activeOnly: nextActiveOnly,
        ...(nextSource ? { source: nextSource } : {}),
      };
      const result = await fetchAudienceCount(filter);
      setAudienceCount(result.count);
    } catch {
      // Silently fall back to initial count
      setAudienceCount(initialAudienceCount);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <form
        action={formAction}
        className="border border-bmj-red/20 bg-bmj-brown p-8"
      >
        {/* Hidden fields */}
        {campaign && <input type="hidden" name="id" value={campaign.id} />}
        <input type="hidden" name="audience_filter" value={audienceFilterJson} />

      {state?.error && (
        <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
          <p className="font-label text-xs uppercase tracking-widest text-bmj-cream">
            Error
          </p>
          <p className="mt-2 font-body text-sm text-bmj-cream">
            {state.error}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={campaign?.title ?? ''}
            onChange={(event) => setLiveTitle(event.target.value)}
            className={inputClass}
            placeholder="Campaign title (internal)"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className={labelClass}>
            Subject Line
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            defaultValue={campaign?.subject ?? ''}
            onChange={(event) => setLiveSubject(event.target.value)}
            className={inputClass}
            placeholder="Email subject line"
          />
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className={labelClass}>
            Body (Markdown)
          </label>
          <textarea
            id="body"
            name="body"
            rows={16}
            defaultValue={campaign?.body ?? ''}
            onChange={(event) => setLiveBody(event.target.value)}
            className={inputClass}
            placeholder="Campaign email body in Markdown"
          />
        </div>

        {/* Audience */}
        <fieldset className="border border-bmj-tan/20 bg-bmj-brown p-6">
          <legend className="font-label text-xs uppercase tracking-widest text-bmj-tan px-2">
            Audience
          </legend>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) =>
                  handleFilterChange(e.target.checked, source)
                }
                className="h-4 w-4 border border-bmj-tan/40 bg-bmj-black accent-bmj-red"
              />
              <span className="font-body text-sm text-bmj-cream">
                Active subscribers only
              </span>
            </label>

            <div>
              <label htmlFor="source_filter" className={labelClass}>
                Source
              </label>
              <select
                id="source_filter"
                value={source}
                onChange={(e) =>
                  handleFilterChange(activeOnly, e.target.value)
                }
                className={selectClass}
              >
                <option value="">All sources</option>
                {subscriberSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <p className="font-mono text-sm text-bmj-tan">
              This campaign will reach{' '}
              <span className="text-bmj-white">{audienceCount}</span>{' '}
              subscribers
            </p>
          </div>
        </fieldset>

        {/* Schedule */}
        <div>
          <label htmlFor="scheduled_at" className={labelClass}>
            Schedule (optional)
          </label>
          <input
            id="scheduled_at"
            name="scheduled_at"
            type="datetime-local"
            defaultValue={
              campaign?.scheduled_at
                ? campaign.scheduled_at.slice(0, 16)
                : ''
            }
            className={inputClass}
          />
          <p className="mt-1 font-mono text-xs text-bmj-tan">
            Leave empty to save as draft
          </p>
        </div>

        {/* Preview */}
        <div>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewing}
            className="border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white disabled:opacity-50"
          >
            {previewing ? 'Loading...' : 'Preview Email'}
          </button>
          {previewHtml && (
            <div className="mt-4 border border-bmj-tan/20 bg-bmj-black p-4">
              <p className="mb-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
                Email Preview
              </p>
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                sandbox=""
                className="h-[500px] w-full border-0 bg-white"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4">
          <SubmitButton isEdit={isEdit} />
          <Link
            href={PATHS.ADMIN_CAMPAIGNS}
            className="border border-bmj-tan/40 px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
          >
            Back
          </Link>
        </div>
      </div>
      </form>

      {/* Live preview pane — renders client-side so it updates per keystroke. */}
      <CampaignPreviewPane
        title={liveTitle}
        subject={liveSubject}
        body={liveBody}
        audienceCount={audienceCount}
      />
    </div>
  );
}
