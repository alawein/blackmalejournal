'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Course } from '@/lib/supabase/types';
import { StorageUploadField } from '@/components/admin/StorageUploadField';

interface CourseFormProps {
  course?: Course;
  action: (formData: FormData) => Promise<void>;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Saving…' : isEdit ? 'Update Course' : 'Create Course'}
    </button>
  );
}

const inputClass =
  'w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none';
const labelClass =
  'mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan';
const selectClass =
  'w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none';

export function CourseForm({ course, action }: CourseFormProps) {
  const [title, setTitle] = useState(course?.title ?? '');
  const [slug, setSlug] = useState(course?.slug ?? '');
  const [description, setDescription] = useState(course?.description ?? '');
  const isEdit = Boolean(course);

  function handleTitleBlur() {
    if (!slug.trim()) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      );
    }
  }

  return (
    <form action={action} className="border border-bmj-red/20 bg-bmj-brown p-8">
      {course && <input type="hidden" name="id" value={course.id} />}

      <div className="space-y-6">
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
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleTitleBlur}
            className={inputClass}
            placeholder="Course title"
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className={`${inputClass} text-xs`}
            placeholder="auto-generated-from-title"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={course?.category ?? 'purpose'}
              className={selectClass}
            >
              <option value="martial-arts">Martial Arts</option>
              <option value="mental-health">Mental Health</option>
              <option value="relationships">Relationships</option>
              <option value="purpose">Purpose</option>
              <option value="branding">Branding</option>
            </select>
          </div>
          <div>
            <label htmlFor="access_tier" className={labelClass}>
              Access Tier
            </label>
            <select
              id="access_tier"
              name="access_tier"
              defaultValue={course?.access_tier ?? 'free'}
              className={selectClass}
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
              <input
                name="published"
                type="checkbox"
                value="true"
                defaultChecked={course?.published ?? false}
                className="h-4 w-4 border border-bmj-tan/30 bg-bmj-black accent-bmj-red"
              />
              Published
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={500}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClass}
            placeholder="What the course covers and why it matters"
          />
          <p className="mt-1 text-right font-mono text-xs text-bmj-tan">
            {description.length}/500
          </p>
        </div>

        <div>
          <StorageUploadField
            bucket="covers"
            folder="courses"
            label="Cover Image"
            name="cover_image"
            defaultValue={course?.cover_image ?? ''}
            placeholder="https://cdn.example.com/course-cover.webp"
            accept="image/png,image/jpeg,image/webp"
          />
        </div>

        <div className="pt-4">
          <SubmitButton isEdit={isEdit} />
        </div>
      </div>
    </form>
  );
}
