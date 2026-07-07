'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Download } from '@/lib/supabase/types';
import { PublishScheduleField } from '@/components/admin/PublishScheduleField';
import { StorageUploadField } from '@/components/admin/StorageUploadField';

// ── Types ───────────────────────────────────────────────────────────────────────

interface DownloadFormProps {
  download?: Download;
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
          ? 'Update Download'
          : 'Create Download'}
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

export function DownloadForm({ download, action }: DownloadFormProps) {
  const isEdit = Boolean(download);

  const [title, setTitle] = useState(download?.title ?? '');
  const [slug, setSlug] = useState(download?.slug ?? '');
  const [description, setDescription] = useState(download?.description ?? '');
  const [fileType, setFileType] = useState(download?.file_type ?? '');
  const [fileSize, setFileSize] = useState(
    download?.file_size ? String(download.file_size) : '',
  );

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
      {download && <input type="hidden" name="id" value={download.id} />}

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
            placeholder="Download title"
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
            placeholder="Brief description (max 500 characters)"
          />
          <p className="mt-1 text-right font-mono text-xs text-bmj-tan">
            {description.length}/500
          </p>
        </div>

        {/* Category + Access Tier (2-column row) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              required
              defaultValue={download?.category ?? ''}
              className={inputClass}
              placeholder="template, worksheet, handbook"
            />
          </div>

          <div>
            <label htmlFor="access_tier" className={labelClass}>
              Access Tier
            </label>
            <select
              id="access_tier"
              name="access_tier"
              defaultValue={download?.access_tier ?? 'free'}
              className={selectClass}
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        <PublishScheduleField
          defaultValue={download?.published_at}
          inputClass={inputClass}
          labelClass={labelClass}
          helperText="Optional UTC release timestamp for audit history and sorted launch order."
        />

        {/* File URL (full width) */}
        <div>
          <StorageUploadField
            bucket="downloads"
            folder="downloads/files"
            label="Download File"
            name="file_url"
            defaultValue={download?.file_url ?? ''}
            placeholder="downloads/files/my-file.pdf"
            accept="application/pdf,application/epub+zip"
            required
            helperText="Upload the protected file first. The stored downloads path will be signed at request time."
            onUploaded={(result) => {
              const extension = result.name.split('.').pop()?.toLowerCase();
              setFileType(extension || result.contentType);
              setFileSize(String(result.size));
            }}
          />
        </div>

        {/* File Type + File Size (2-column row) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="file_type" className={labelClass}>
              File Type
            </label>
            <input
              id="file_type"
              name="file_type"
              type="text"
              required
              value={fileType}
              onChange={(event) => setFileType(event.target.value)}
              className={inputClass}
              placeholder="pdf, epub, docx"
            />
          </div>

          <div>
            <label htmlFor="file_size" className={labelClass}>
              File Size (bytes)
            </label>
            <input
              id="file_size"
              name="file_size"
              type="number"
              required
              min={1}
              value={fileSize}
              onChange={(event) => setFileSize(event.target.value)}
              className={inputClass}
              placeholder="1048576"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <StorageUploadField
            bucket="covers"
            folder="downloads/covers"
            label="Cover Image"
            name="cover_image"
            defaultValue={download?.cover_image ?? ''}
            placeholder="https://cdn.example.com/download-cover.webp"
            accept="image/png,image/jpeg,image/webp"
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <SubmitButton isEdit={isEdit} />
        </div>
      </div>
    </form>
  );
}
