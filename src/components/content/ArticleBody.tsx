function renderInlineMarks(text: string): React.ReactNode {
  const parts = text.split(/(<mark>.*?<\/mark>)/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    const match = part.match(/^<mark>(.*?)<\/mark>$/)
    if (match) {
      return (
        <mark key={i} className="marker">
          {match[1]}
        </mark>
      )
    }
    return part
  })
}

interface ArticleBodyProps {
  body: string;
}

export function ArticleBody({ body }: ArticleBodyProps) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-article space-y-6">
      {paragraphs.map((para, i) => {
        // H3 heading
        if (para.startsWith('### ')) {
          return (
            <h3 key={i} className="mt-8 font-display text-xl text-bmj-white">
              {para.slice(4)}
            </h3>
          );
        }
        // H2 heading
        if (para.startsWith('## ')) {
          return (
            <h2 key={i} className="mt-10 font-display text-2xl text-bmj-white">
              {para.slice(3)}
            </h2>
          );
        }
        // H1 heading
        if (para.startsWith('# ')) {
          return (
            <h2 key={i} className="mt-12 font-display text-3xl text-bmj-white">
              {para.slice(2)}
            </h2>
          );
        }
        if (para.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-bmj-red bg-bmj-amber/10 px-6 py-4 font-body text-lg italic text-bmj-amber"
            >
              {renderInlineMarks(para.slice(2))}
            </blockquote>
          );
        }
        return (
          <p key={i} className="font-body text-lg leading-article text-bmj-cream/90">
            {renderInlineMarks(para)}
          </p>
        );
      })}
    </div>
  );
}
