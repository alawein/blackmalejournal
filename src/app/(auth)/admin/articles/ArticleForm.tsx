'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Article } from '@/lib/supabase/types';
import { PublishScheduleField } from '@/components/admin/PublishScheduleField';
import { StorageUploadField } from '@/components/admin/StorageUploadField';

// ── Types ───────────────────────────────────────────────────────────────────────

interface ArticleFormProps {
  article?: Article;
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
          ? 'Update Article'
          : 'Create Article'}
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

export function ArticleForm({ article, action }: ArticleFormProps) {
  const isEdit = Boolean(article);

  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');

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
      {article && <input type="hidden" name="id" value={article.id} />}

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
            placeholder="Article title"
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
              defaultValue={article?.lens ?? 'health'}
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
              defaultValue={article?.access_tier ?? 'free'}
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
              defaultValue={article?.status ?? 'draft'}
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
          defaultValue={article?.published_at}
          inputClass={inputClass}
          labelClass={labelClass}
        />

        {/* Tags (full width) */}
        <div>
          <label htmlFor="tags" className={labelClass}>
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            defaultValue={article?.tags?.join(', ') ?? ''}
            className={inputClass}
            placeholder="discipline, fitness, mindset"
          />
        </div>

        {/* Excerpt (full width) with character count */}
        <div>
          <label htmlFor="excerpt" className={labelClass}>
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            maxLength={500}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className={inputClass}
            placeholder="Brief summary (max 500 characters)"
          />
          <p className="mt-1 text-right font-mono text-xs text-bmj-tan">
            {excerpt.length}/500
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
            defaultValue={article?.body ?? ''}
            className={inputClass}
            placeholder="Article body text"
          />
        </div>

        {/* Featured checkbox + Cover Image in a row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
          <div className="flex items-center gap-3">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={article?.featured ?? false}
              value="true"
              className="h-4 w-4 border border-bmj-tan/30 bg-bmj-black accent-bmj-red"
            />
            <label htmlFor="featured" className="font-label text-xs uppercase tracking-widest text-bmj-tan">
              Featured
            </label>
          </div>

          <div>
            <StorageUploadField
              bucket="covers"
              folder="articles"
              label="Cover Image"
              name="cover_image"
              defaultValue={article?.cover_image ?? ''}
              placeholder="https://cdn.example.com/article-cover.webp"
              accept="image/png,image/jpeg,image/webp"
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
