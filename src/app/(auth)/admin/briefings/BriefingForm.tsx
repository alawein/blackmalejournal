'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Briefing, BriefingSection } from '@/lib/supabase/types';
import { PublishScheduleField } from '@/components/admin/PublishScheduleField';
import { StorageUploadField } from '@/components/admin/StorageUploadField';

// ── Types ───────────────────────────────────────────────────────────────────────

interface BriefingFormProps {
  briefing?: Briefing;
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
          ? 'Update Briefing'
          : 'Create Briefing'}
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

export function BriefingForm({ briefing, action }: BriefingFormProps) {
  const isEdit = Boolean(briefing);

  const [title, setTitle] = useState(briefing?.title ?? '');
  const [slug, setSlug] = useState(briefing?.slug ?? '');
  const [sections, setSections] = useState<BriefingSection[]>(
    briefing?.sections ?? [{ title: '', body: '' }],
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

  function addSection() {
    setSections([...sections, { title: '', body: '' }]);
  }

  function removeSection(index: number) {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== index));
  }

  function updateSection(index: number, field: keyof BriefingSection, value: string) {
    const updated = sections.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    );
    setSections(updated);
  }

  return (
    <form action={action} className="border border-bmj-red/20 bg-bmj-brown p-8">
      {/* Hidden ID for edit mode */}
      {briefing && <input type="hidden" name="id" value={briefing.id} />}

      {/* Hidden sections_json — serialized from state */}
      <input type="hidden" name="sections_json" value={JSON.stringify(sections)} />

      <div className="space-y-6">
        {/* Issue Number + Title row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <label htmlFor="issue_number" className={labelClass}>
              Issue Number
            </label>
            <input
              id="issue_number"
              name="issue_number"
              type="number"
              required
              min={1}
              defaultValue={briefing?.issue_number ?? ''}
              className={inputClass}
              placeholder="1"
            />
          </div>

          <div className="sm:col-span-3">
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
              placeholder="Weekend Briefing title"
            />
          </div>
        </div>

        {/* Slug (full width) */}
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

        {/* Access Tier + Status (2-column row) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="access_tier" className={labelClass}>
              Access Tier
            </label>
            <select
              id="access_tier"
              name="access_tier"
              defaultValue={briefing?.access_tier ?? 'free'}
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
              defaultValue={briefing?.status ?? 'draft'}
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
          defaultValue={briefing?.published_at}
          inputClass={inputClass}
          labelClass={labelClass}
        />

        {/* Cover Image */}
        <div>
          <StorageUploadField
            bucket="covers"
            folder="briefings"
            label="Cover Image"
            name="cover_image"
            defaultValue={briefing?.cover_image ?? ''}
            placeholder="https://cdn.example.com/briefing-cover.webp"
            accept="image/png,image/jpeg,image/webp"
          />
        </div>

        {/* Sections editor */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className={labelClass}>Sections</span>
            <button
              type="button"
              onClick={addSection}
              className="font-label text-xs uppercase tracking-widest text-bmj-red transition-opacity hover:opacity-80"
            >
              + Add Section
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={index}
                className="border border-bmj-tan/20 bg-bmj-black p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-bmj-tan">
                    Section {index + 1}
                  </span>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-red"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor={`section-title-${index}`}
                      className={labelClass}
                    >
                      Section Title
                    </label>
                    <input
                      id={`section-title-${index}`}
                      type="text"
                      value={section.title}
                      onChange={(e) =>
                        updateSection(index, 'title', e.target.value)
                      }
                      className={inputClass}
                      placeholder="Section title"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`section-body-${index}`}
                      className={labelClass}
                    >
                      Section Body
                    </label>
                    <textarea
                      id={`section-body-${index}`}
                      rows={6}
                      value={section.body}
                      onChange={(e) =>
                        updateSection(index, 'body', e.target.value)
                      }
                      className={inputClass}
                      placeholder="Section content"
                    />
                  </div>
                </div>
              </div>
            ))}
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
