import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorialAuditPanel } from '@/components/admin/EditorialAuditPanel';
import {
  getAdminActivityLogForEntity,
  getDispatchById,
} from '@/lib/supabase/admin-queries';
import { assessDispatchReadiness } from '@/lib/admin-publishing';
import { getLensTheme } from '@/lib/lens-theme';
import { dispatchPath, PATHS } from '@/lib/paths';
import { DispatchForm } from '../../DispatchForm';
import { updateDispatchAction } from '../../actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteDispatchAction } from '../../delete-action';

export const metadata: Metadata = {
  title: 'Edit Dispatch — Admin',
  robots: { index: false, follow: false },
};

interface EditDispatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDispatchPage({ params }: EditDispatchPageProps) {
  const { id } = await params;
  const [dispatch, activity] = await Promise.all([
    getDispatchById(id),
    getAdminActivityLogForEntity('dispatch', id),
  ]);

  if (!dispatch) {
    notFound();
  }

  const readiness = assessDispatchReadiness(dispatch);
  const lensLabel = getLensTheme(dispatch.lens).label;

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT DISPATCH</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {dispatch.id}</p>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <DispatchForm dispatch={dispatch} action={updateDispatchAction} />
          <div className="mt-8">
            <DeleteButton
              action={deleteDispatchAction.bind(null, dispatch.id)}
              itemName="dispatch"
            />
          </div>
        </div>

        <EditorialAuditPanel
          descriptor={`Dispatch · ${lensLabel}`}
          status={dispatch.status}
          readiness={readiness}
          createdAt={dispatch.created_at}
          publishedAt={dispatch.published_at || null}
          checks={[
            {
              label: 'Lens',
              value: lensLabel,
              tone: 'default',
            },
            {
              label: 'Cover',
              value: dispatch.cover_image ? 'Cover asset is attached.' : 'Cover asset is missing.',
              tone: dispatch.cover_image ? 'success' : 'critical',
            },
            {
              label: 'Excerpt',
              value: dispatch.excerpt.trim()
                ? 'Excerpt is populated for list surfaces.'
                : 'Excerpt is missing for list surfaces.',
              tone: dispatch.excerpt.trim() ? 'success' : 'critical',
            },
            {
              label: 'Author',
              value: dispatch.author,
              tone: dispatch.author.trim() ? 'success' : 'critical',
            },
          ]}
          links={[
            { label: 'Dispatch Desk', href: PATHS.ADMIN_DISPATCHES },
            { label: 'Public Dispatch', href: dispatchPath(dispatch.slug) },
          ]}
          activity={activity}
        />
      </div>
    </div>
  );
}
