import { Plus } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { ButtonLink } from '@/components/ui/Button';

export function QuickActionsSection() {
  return (
    <section aria-labelledby="actions-heading">
      <h2
        id="actions-heading"
        className="font-label text-micro uppercase tracking-label-xl text-bmj-tan"
      >
        Quick Actions
      </h2>
      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink
          href={PATHS.ADMIN_ARTICLES_NEW}
          variant="primary"
          size="md"
          iconLeft={<Plus size={16} />}
        >
          New Article
        </ButtonLink>
        <ButtonLink
          href={PATHS.ADMIN_BRIEFINGS_NEW}
          variant="outline"
          size="md"
          iconLeft={<Plus size={16} />}
        >
          New Briefing
        </ButtonLink>
        <ButtonLink
          href={PATHS.ADMIN_DISPATCHES_NEW}
          variant="outline"
          size="md"
          iconLeft={<Plus size={16} />}
        >
          New Dispatch
        </ButtonLink>
        <ButtonLink
          href={PATHS.ADMIN_COURSES_NEW}
          variant="outline"
          size="md"
          iconLeft={<Plus size={16} />}
        >
          New Course
        </ButtonLink>
        <ButtonLink
          href={PATHS.ADMIN_HANDBOOKS_NEW}
          variant="outline"
          size="md"
          iconLeft={<Plus size={16} />}
        >
          New Handbook
        </ButtonLink>
        <ButtonLink
          href={PATHS.ADMIN_DOWNLOADS_NEW}
          variant="outline"
          size="md"
          iconLeft={<Plus size={16} />}
        >
          New Download
        </ButtonLink>
      </div>
    </section>
  );
}
