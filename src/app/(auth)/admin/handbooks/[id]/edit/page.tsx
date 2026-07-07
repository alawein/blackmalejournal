import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorialAuditPanel } from '@/components/admin/EditorialAuditPanel';
import {
  getAdminActivityLogForEntity,
  getHandbookById,
} from '@/lib/supabase/admin-queries';
import { assessHandbookReadiness } from '@/lib/admin-publishing';
import { getLensTheme } from '@/lib/lens-theme';
import { handbookPath, PATHS } from '@/lib/paths';
import { HandbookForm } from '../../HandbookForm';
import { updateHandbookAction } from '../../actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteHandbookAction } from '../../delete-action';

export const metadata: Metadata = {
  title: 'Edit Handbook — Admin',
  robots: { index: false, follow: false },
};

interface EditHandbookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHandbookPage({ params }: EditHandbookPageProps) {
  const { id } = await params;
  const [handbook, activity] = await Promise.all([
    getHandbookById(id),
    getAdminActivityLogForEntity('handbook', id),
  ]);

  if (!handbook) {
    notFound();
  }

  const readiness = assessHandbookReadiness(handbook);
  const lensLabel = getLensTheme(handbook.lens).label;

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT HANDBOOK</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {handbook.id}</p>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <HandbookForm handbook={handbook} action={updateHandbookAction} />
          <div className="mt-8">
            <DeleteButton
              action={deleteHandbookAction.bind(null, handbook.id)}
              itemName="handbook"
            />
          </div>
        </div>

        <EditorialAuditPanel
          descriptor={`Handbook · ${lensLabel} · ${handbook.access_tier}`}
          status={handbook.status}
          readiness={readiness}
          createdAt={handbook.created_at}
          publishedAt={handbook.published_at || null}
          checks={[
            {
              label: 'Lens',
              value: lensLabel,
              tone: 'default',
            },
            {
              label: 'Audience',
              value: handbook.access_tier,
              tone: 'default',
            },
            {
              label: 'Cover',
              value: handbook.cover_image ? 'Cover asset is attached.' : 'Cover asset is missing.',
              tone: handbook.cover_image ? 'success' : 'critical',
            },
            {
              label: 'File',
              value: handbook.file_url ? 'Protected handbook file is attached.' : 'Protected handbook file is missing.',
              tone: handbook.file_url ? 'success' : 'critical',
            },
            {
              label: 'Author',
              value: handbook.author,
              tone: handbook.author.trim() ? 'success' : 'critical',
            },
          ]}
          links={[
            { label: 'Handbook Desk', href: PATHS.ADMIN_HANDBOOKS },
            { label: 'Public Handbook', href: handbookPath(handbook.slug) },
            {
              label: 'Protected Download',
              href: `/api/handbooks/${handbook.slug}/download`,
            },
          ]}
          activity={activity}
        />
      </div>
    </div>
  );
}
