interface PullQuoteSidebarProps {
  children: React.ReactNode
  body: string
}

function extractBlockquotes(body: string): string[] {
  return body
    .split("\n\n")
    .filter((block) => block.trimStart().startsWith("> "))
    .map((block) => block.replace(/^>\s?/gm, "").trim())
    .slice(0, 3)
}

export default function PullQuoteSidebar({
  children,
  body,
}: PullQuoteSidebarProps) {
  const quotes = extractBlockquotes(body)

  if (quotes.length === 0) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto max-w-content">
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
        {/* Main content column — children (ArticleBody) handle their own max-w-article */}
        <div>{children}</div>

        {/* Pull-quote sidebar — desktop only */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            {quotes.map((quote, i) => (
              <blockquote
                key={i}
                className="paper-texture border-l-[3px] border-bmj-red pl-4"
              >
                <p className="font-body text-base italic leading-relaxed text-bmj-amber">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-2 h-px w-full bg-bmj-tan/30" />
              </blockquote>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
