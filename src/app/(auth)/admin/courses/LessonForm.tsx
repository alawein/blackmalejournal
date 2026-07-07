'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Lesson } from '@/lib/supabase/types';
import { StorageUploadField } from '@/components/admin/StorageUploadField';

interface LessonFormProps {
  courseId: string;
  lesson?: Lesson;
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
      {pending ? 'Saving…' : isEdit ? 'Update Lesson' : 'Create Lesson'}
    </button>
  );
}

const inputClass =
  'w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none';
const labelClass =
  'mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan';

export function LessonForm({ courseId, lesson, action }: LessonFormProps) {
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [slug, setSlug] = useState(lesson?.slug ?? '');
  const isEdit = Boolean(lesson);

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
      <input type="hidden" name="course_id" value={courseId} />
      {lesson && <input type="hidden" name="id" value={lesson.id} />}

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
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
              placeholder="Lesson title"
            />
          </div>
          <div>
            <label htmlFor="order_number" className={labelClass}>
              Order Number
            </label>
            <input
              id="order_number"
              name="order_number"
              type="number"
              min={1}
              required
              defaultValue={lesson?.order_number ?? 1}
              className={inputClass}
            />
          </div>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px_160px]">
          <div>
            <StorageUploadField
              bucket="media"
              folder="academy/videos"
              label="Video URL"
              name="video_url"
              defaultValue={lesson?.video_url ?? ''}
              placeholder="https://... or uploaded media URL"
              accept="video/mp4,video/webm,video/ogg"
              helperText="Upload a direct video file or paste an embed URL. Direct video files render in the lesson player."
            />
          </div>
          <div>
            <label htmlFor="duration" className={labelClass}>
              Duration (min)
            </label>
            <input
              id="duration"
              name="duration"
              type="number"
              min={0}
              defaultValue={lesson?.duration ?? 0}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 font-label text-xs uppercase tracking-widest text-bmj-tan">
              <input
                name="published"
                type="checkbox"
                value="true"
                defaultChecked={lesson?.published ?? false}
                className="h-4 w-4 border border-bmj-tan/30 bg-bmj-black accent-bmj-red"
              />
              Published
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="body" className={labelClass}>
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={18}
            required
            defaultValue={lesson?.body ?? ''}
            className={inputClass}
            placeholder="Lesson body text"
          />
        </div>

        <div className="pt-4">
          <SubmitButton isEdit={isEdit} />
        </div>
      </div>
    </form>
  );
}
