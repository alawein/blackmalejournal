'use client';

/**
 * Lightweight live preview pane for the campaign editor.
 *
 * Renders a BMJ-styled email mock on the client — no server round-trip.
 * The full-render iframe preview (via `previewCampaignEmail`) still exists
 * as a secondary check in {@link CampaignForm}.
 */

import { BrandMark } from '@/components/brand/BrandMark';

interface CampaignPreviewPaneProps {
  title: string;
  subject: string;
  body: string;
  audienceCount: number;
}

/**
 * Render plain body text as paragraphs, treating blank lines as separators
 * and lines starting with `#` or `##` as headings. This is not a full
 * markdown parser — it is a faithful preview of the structure an editor
 * will most often write.
 */
function renderBodyBlocks(body: string): Array<{ type: 'h1' | 'h2' | 'p'; text: string }> {
  if (!body.trim()) return [];
  const paragraphs = body.split(/\n\s*\n/);
  return paragraphs
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('## ')) {
        return { type: 'h2' as const, text: block.slice(3).trim() };
      }
      if (block.startsWith('# ')) {
        return { type: 'h1' as const, text: block.slice(2).trim() };
      }
      return { type: 'p' as const, text: block };
    });
}

export function CampaignPreviewPane({
  title,
  subject,
  body,
  audienceCount,
}: CampaignPreviewPaneProps) {
  const blocks = renderBodyBlocks(body);

  return (
    <aside className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto border border-bmj-tan/20 bg-bmj-black">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-3 border-b border-bmj-tan/15 bg-bmj-brown/60 px-5 py-3">
        <span className="font-label text-[10px] uppercase tracking-widest text-bmj-tan">
          Live Preview
        </span>
        <span className="font-mono text-[10px] text-bmj-tan/80">
          {audienceCount} recipients
        </span>
      </div>

      {/* Email shell */}
      <div className="bg-bmj-black">
        {/* Email header */}
        <div className="border-b border-bmj-red/30 bg-bmj-black px-6 py-5 text-center">
          <div className="inline-flex items-center gap-3">
            <BrandMark size={28} color="var(--bmj-red)" />
            <span className="font-display text-lg uppercase tracking-widest text-bmj-white">
              The Black Male Journal
            </span>
          </div>
        </div>

        {/* Subject */}
        <div className="px-6 pt-6">
          <p className="font-label text-[10px] uppercase tracking-widest text-bmj-tan">
            Subject
          </p>
          <p className="mt-1 font-display text-xl uppercase leading-tight text-bmj-white">
            {subject.trim() || 'Untitled subject'}
          </p>
          {title && title !== subject && (
            <p className="mt-1 font-mono text-[11px] text-bmj-tan/70">
              Internal: {title}
            </p>
          )}
        </div>

        {/* Body blocks */}
        <div className="px-6 py-6">
          {blocks.length === 0 ? (
            <p className="font-body text-sm italic text-bmj-tan/70">
              Start typing the campaign body to see it render here.
            </p>
          ) : (
            <div className="space-y-4">
              {blocks.map((block, index) => {
                if (block.type === 'h1') {
                  return (
                    <h2
                      key={index}
                      className="font-display text-xl uppercase tracking-display text-bmj-white"
                    >
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === 'h2') {
                  return (
                    <h3
                      key={index}
                      className="font-display text-lg uppercase tracking-display text-bmj-amber"
                    >
                      {block.text}
                    </h3>
                  );
                }
                return (
                  <p
                    key={index}
                    className="whitespace-pre-wrap font-body text-sm leading-relaxed text-bmj-cream/90"
                  >
                    {block.text}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-bmj-tan/15 bg-bmj-brown/40 px-6 py-5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-bmj-tan/80">
            Speak the Truth. Navigate the Consequences.
          </p>
          <p className="mt-2 font-mono text-[10px] text-bmj-tan/60">
            <span className="underline decoration-bmj-tan/40 underline-offset-2">
              Unsubscribe
            </span>
            <span className="mx-2">&middot;</span>
            <span className="underline decoration-bmj-tan/40 underline-offset-2">
              Manage preferences
            </span>
          </p>
        </div>
      </div>
    </aside>
  );
}
