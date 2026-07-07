'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Handbook } from '@/lib/supabase/types';
import { PublishScheduleField } from '@/components/admin/PublishScheduleField';
import { StorageUploadField } from '@/components/admin/StorageUploadField';

// ── Types ───────────────────────────────────────────────────────────────────────

interface HandbookFormProps {
  handbook?: Handbook;
  action: (formData: FormData) => Promise<void>;
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
      {pending
        ? 'Saving…'
        : isEdit
          ? 'Update Handbook'
          : 'Create Handbook'}
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

export function HandbookForm({ handbook, action }: HandbookFormProps) {
  const isEdit = Boolean(handbook);

  const [title, setTitle] = useState(handbook?.title ?? '');
  const [slug, setSlug] = useState(handbook?.slug ?? '');
  const [description, setDescription] = useState(handbook?.description ?? '');

  function generateSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function handleTitleBlur() {
    if (!slug.trim()) {
      setSlug(generateSlug(title));
    }
  }

  return (
    <form action={action} className="border border-bmj-red/20 bg-bmj-brown p-8">
      {/* Hidden ID for edit mode */}
      {handbook && <input type="hidden" name="id" value={handbook.id} />}

      <div className="space-y-6">
        {/* Title (full width) */}
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className={inputClass}
            placeholder="Handbook title"
          />
        </div>

        {/* Slug (full width, below title) */}
        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${inputClass} text-xs`}
            placeholder="auto-generated-from-title"
          />
        </div>

        {/* Lens + Access Tier + Status (3-column row) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="lens" className={labelClass}>
              Lens
            </label>
            <select
              id="lens"
              name="lens"
              defaultValue={handbook?.lens ?? 'health'}
              className={selectClass}
            >
              <option value="health">Health/Wellness</option>
              <option value="politics">Politics/Law</option>
              <option value="culture">Culture/Ideology</option>
              <option value="entertainment">Entertainment/Technology</option>
              <option value="business">Business/Finance</option>
            </select>
          </div>

          <div>
            <label htmlFor="access_tier" className={labelClass}>
              Access Tier
            </label>
            <select
              id="access_tier"
              name="access_tier"
              defaultValue={handbook?.access_tier ?? 'free'}
              className={selectClass}
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={handbook?.status ?? 'draft'}
              className={selectClass}
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        <PublishScheduleField
          defaultValue={handbook?.published_at}
          inputClass={inputClass}
          labelClass={labelClass}
        />

        {/* Description (full width) with character count */}
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="Brief summary (max 500 characters)"
          />
          <p className="mt-1 text-right font-mono text-xs text-bmj-tan">
            {description.length}/500
          </p>
        </div>

        {/* Body (full width) */}
        <div>
          <label htmlFor="body" className={labelClass}>
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={20}
            required
            defaultValue={handbook?.body ?? ''}
            className={inputClass}
            placeholder="Handbook body text"
          />
        </div>

        {/* Cover Image + File URL in a row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <StorageUploadField
              bucket="covers"
              folder="handbooks/covers"
              label="Cover Image"
              name="cover_image"
              defaultValue={handbook?.cover_image ?? ''}
              placeholder="https://cdn.example.com/handbook-cover.webp"
              accept="image/png,image/jpeg,image/webp"
            />
          </div>

          <div>
            <StorageUploadField
              bucket="downloads"
              folder="handbooks/files"
              label="Handbook File"
              name="file_url"
              defaultValue={handbook?.file_url ?? ''}
              placeholder="handbooks/files/my-handbook.pdf"
              accept="application/pdf,application/epub+zip"
              helperText="Upload a gated file first. Paste a direct file path only if you need to override it."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <SubmitButton isEdit={isEdit} />
        </div>
      </div>
    </form>
  );
}
