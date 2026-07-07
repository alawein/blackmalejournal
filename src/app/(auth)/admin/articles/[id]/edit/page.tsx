import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorialAuditPanel } from '@/components/admin/EditorialAuditPanel';
import {
  getAdminActivityLogForEntity,
  getArticleById,
} from '@/lib/supabase/admin-queries';
import { assessArticleReadiness } from '@/lib/admin-publishing';
import { getLensTheme } from '@/lib/lens-theme';
import { articlePath, PATHS } from '@/lib/paths';
import { ArticleForm } from '../../ArticleForm';
import { updateArticleAction } from '../../actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteArticleAction } from '../../delete-action';

export const metadata: Metadata = {
  title: 'Edit Article — Admin',
  robots: { index: false, follow: false },
};

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const [article, activity] = await Promise.all([
    getArticleById(id),
    getAdminActivityLogForEntity('article', id),
  ]);

  if (!article) {
    notFound();
  }

  const readiness = assessArticleReadiness(article);
  const lensLabel = getLensTheme(article.lens).label;

  return (
    <div>
      <h1 className="mb-2 font-display text-4xl text-bmj-white">EDIT ARTICLE</h1>
      <p className="mb-8 font-mono text-xs text-bmj-tan">ID: {article.id}</p>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <ArticleForm article={article} action={updateArticleAction} />
          <div className="mt-8">
            <DeleteButton
              action={deleteArticleAction.bind(null, article.id)}
              itemName="article"
            />
          </div>
        </div>

        <EditorialAuditPanel
          descriptor={`Article · ${lensLabel} · ${article.access_tier}`}
          status={article.status}
          readiness={readiness}
          createdAt={article.created_at}
          publishedAt={article.published_at || null}
          checks={[
            {
              label: 'Lens',
              value: lensLabel,
              tone: 'default',
            },
            {
              label: 'Audience',
              value: article.access_tier,
              tone: 'default',
            },
            {
              label: 'Cover',
              value: article.cover_image ? 'Cover asset is attached.' : 'Cover asset is missing.',
              tone: article.cover_image ? 'success' : 'critical',
            },
            {
              label: 'Tags',
              value:
                article.tags.length > 0
                  ? `${article.tags.length} tags assigned.`
                  : 'No tags assigned.',
              tone: article.tags.length > 0 ? 'success' : 'warning',
            },
            {
              label: 'Placement',
              value: article.featured
                ? 'Featured placement is enabled.'
                : 'Standard article placement.',
              tone: article.featured ? 'success' : 'default',
            },
          ]}
          links={[
            { label: 'Article Desk', href: PATHS.ADMIN_ARTICLES },
            { label: 'Public Article', href: articlePath(article.slug) },
          ]}
          activity={activity}
        />
      </div>
    </div>
  );
}
