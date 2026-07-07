import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorialAuditPanel } from '@/components/admin/EditorialAuditPanel';
import {
  getAdminActivityLogForEntity,
  getBriefingById,
} from '@/lib/supabase/admin-queries';
import { assessBriefingReadiness } from '@/lib/admin-publishing';
import { briefingPath, PATHS } from '@/lib/paths';
import { BriefingForm } from '../../BriefingForm';
import { updateBriefingAction } from '../../actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteBriefingAction } from '../../delete-action';

export const metadata: Metadata = {
  title: 'Edit Briefing — Admin',
  robots: { index: false, follow: false },
};

interface EditBriefingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBriefingPage({ params }: EditBriefingPageProps) {
  const { id } = await params;
  const [briefing, activity] = await Promise.all([
    getBriefingById(id),
    getAdminActivityLogForEntity('briefing', id),
  ]);

  if (!briefing) {
    notFound();
  }

  const readiness = assessBriefingReadiness(briefing);
  const populatedSections = briefing.sections.filter(
    (section) => section.title.trim() && section.body.trim(),
  ).length;

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT BRIEFING</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {briefing.id}</p>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <BriefingForm briefing={briefing} action={updateBriefingAction} />
          <div className="mt-8">
            <DeleteButton
              action={deleteBriefingAction.bind(null, briefing.id)}
              itemName="briefing"
            />
          </div>
        </div>

        <EditorialAuditPanel
          descriptor={`Briefing #${briefing.issue_number} · ${briefing.access_tier}`}
          status={briefing.status}
          readiness={readiness}
          createdAt={briefing.created_at}
          publishedAt={briefing.published_at || null}
          checks={[
            {
              label: 'Issue',
              value: `Issue #${briefing.issue_number}`,
              tone: briefing.issue_number > 0 ? 'success' : 'critical',
            },
            {
              label: 'Audience',
              value: briefing.access_tier,
              tone: 'default',
            },
            {
              label: 'Cover',
              value: briefing.cover_image ? 'Cover asset is attached.' : 'Cover asset is missing.',
              tone: briefing.cover_image ? 'success' : 'critical',
            },
            {
              label: 'Sections',
              value:
                populatedSections > 0
                  ? `${populatedSections} populated sections are ready.`
                  : 'No populated sections are ready yet.',
              tone: populatedSections > 0 ? 'success' : 'critical',
            },
          ]}
          links={[
            { label: 'Briefing Desk', href: PATHS.ADMIN_BRIEFINGS },
            { label: 'Public Briefing', href: briefingPath(briefing.slug) },
          ]}
          activity={activity}
        />
      </div>
    </div>
  );
}
