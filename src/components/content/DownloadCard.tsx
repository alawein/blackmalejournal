import { Download, Lock, FileText } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { PATHS } from '@/lib/paths';
import { getDownloadCategoryLabel, formatFileSize } from '@/lib/utils';
import type { AccessTier } from '@/lib/supabase/types';

interface DownloadCardProps {
  title: string;
  slug: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: number;
  accessTier: AccessTier;
  hasAccess: boolean;
  fileUrl: string;
}

export function DownloadCard({
  title,
  slug,
  description,
  category,
  fileType,
  fileSize,
  hasAccess,
}: DownloadCardProps) {
  return (
    <article className="flex items-start gap-4 surface-panel-strong p-6 transition-colors hover:border-bmj-border-strong">
      {/* File icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-bmj-black">
        <FileText size={24} className="text-bmj-cream/30" aria-hidden="true" />
      </div>

      <div className="flex-1">
        <div className="mb-1 flex items-center gap-3">
          <span className="font-label text-xs uppercase tracking-widest text-bmj-tan">
            {getDownloadCategoryLabel(category)}
          </span>
          <span className="font-mono text-xs text-bmj-tan/50">
            <span>{fileType.toUpperCase()}</span>
            <span aria-hidden="true"> · </span>
            <span>{formatFileSize(fileSize)}</span>
          </span>
        </div>

        <h3 className="mb-1 font-display text-lg uppercase tracking-display text-bmj-white">
          {title}
        </h3>

        <p className="line-clamp-2 font-body text-sm text-bmj-cream/70">
          {description}
        </p>
      </div>

      {/* Action */}
      <div className="shrink-0 self-center">
        {hasAccess ? (
          <ButtonLink
            href={`/api/downloads/${slug}`}
            external
            variant="primary"
            size="sm"
            iconLeft={<Download size={14} />}
          >
            Download
          </ButtonLink>
        ) : (
          <ButtonLink
            href={PATHS.PRICING}
            variant="secondary"
            size="sm"
            iconLeft={<Lock size={14} />}
          >
            Upgrade
          </ButtonLink>
        )}
      </div>
    </article>
  );
}
