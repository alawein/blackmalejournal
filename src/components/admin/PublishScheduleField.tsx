import { formatPublishedAtForInput } from '@/lib/admin-publish-time';

interface PublishScheduleFieldProps {
  defaultValue?: string | null;
  inputClass: string;
  labelClass: string;
  helperText?: string;
  label?: string;
}

export function PublishScheduleField({
  defaultValue,
  inputClass,
  labelClass,
  helperText = 'Use UTC. Required for scheduled releases. Leave empty to publish immediately when moving straight to published.',
  label = 'Publish At (UTC)',
}: PublishScheduleFieldProps) {
  return (
    <div>
      <label htmlFor="published_at" className={labelClass}>
        {label}
      </label>
      <input
        id="published_at"
        name="published_at"
        type="datetime-local"
        defaultValue={formatPublishedAtForInput(defaultValue)}
        className={inputClass}
      />
      <p className="mt-2 font-body text-xs text-bmj-cream/65">{helperText}</p>
    </div>
  );
}
