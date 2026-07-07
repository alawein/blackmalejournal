import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorialAuditPanel } from '@/components/admin/EditorialAuditPanel';
import {
  getAdminActivityLogForEntity,
  getDownloadById,
} from '@/lib/supabase/admin-queries';
import { assessDownloadReadiness } from '@/lib/admin-publishing';
import { PATHS } from '@/lib/paths';
import { DownloadForm } from '../../DownloadForm';
import { updateDownloadAction } from '../../actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteDownloadAction } from '../../delete-action';

export const metadata: Metadata = {
  title: 'Edit Download — Admin',
  robots: { index: false, follow: false },
};

interface EditDownloadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDownloadPage({ params }: EditDownloadPageProps) {
  const { id } = await params;
  const [download, activity] = await Promise.all([
    getDownloadById(id),
    getAdminActivityLogForEntity('download', id),
  ]);

  if (!download) {
    notFound();
  }

  const readiness = assessDownloadReadiness(download);
  const formattedSize = `${download.file_size.toLocaleString('en-US')} bytes`;

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT DOWNLOAD</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {download.id}</p>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <DownloadForm download={download} action={updateDownloadAction} />
          <div className="mt-8">
            <DeleteButton
              action={deleteDownloadAction.bind(null, download.id)}
              itemName="download"
            />
          </div>
        </div>

        <EditorialAuditPanel
          descriptor={`Download · ${download.category} · ${download.access_tier}`}
          status="published"
          readiness={readiness}
          createdAt={download.created_at}
          publishedAt={download.published_at || null}
          publishLabel="Release Timestamp"
          checks={[
            {
              label: 'Category',
              value: download.category,
              tone: download.category.trim() ? 'success' : 'critical',
            },
            {
              label: 'Audience',
              value: download.access_tier,
              tone: 'default',
            },
            {
              label: 'File',
              value: `${download.file_type.toUpperCase()} · ${formattedSize}`,
              tone: download.file_url ? 'success' : 'critical',
            },
            {
              label: 'Cover',
              value: download.cover_image ? 'Cover asset is attached.' : 'Cover asset is missing.',
              tone: download.cover_image ? 'success' : 'warning',
            },
          ]}
          links={[
            { label: 'Download Desk', href: PATHS.ADMIN_DOWNLOADS },
            { label: 'Public Downloads', href: PATHS.DOWNLOADS },
            { label: 'Protected File', href: `/api/downloads/${download.slug}` },
          ]}
          activity={activity}
        />
      </div>
    </div>
  );
}
