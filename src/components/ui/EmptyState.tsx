import { ButtonLink } from '@/components/ui/Button';

interface EmptyStateProps {
  heading: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ heading, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <svg
        width="48" height="48" viewBox="0 0 32 32" fill="none"
        xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="mb-6 opacity-20"
      >
        <path
          d="M16 0L19.6 11.6H32L21.8 18.4L25.4 30L16 23.2L6.6 30L10.2 18.4L0 11.6H12.4L16 0Z"
          fill="var(--bmj-tan)"
        />
      </svg>
      <h2 className="font-display text-2xl text-bmj-white">{heading}</h2>
      <p className="mt-2 max-w-md font-body text-sm text-bmj-tan">{description}</p>
      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} variant="ghost" className="mt-6">
          {actionLabel}
        </ButtonLink>
      )}
    </div>
  );
}
