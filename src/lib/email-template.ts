/**
 * Minimal Markdown-to-HTML renderer for email campaigns.
 * No external dependencies — covers the subset of Markdown used in BMJ emails.
 */
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Headings
    if (line.startsWith('### ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h3>${applyInline(line.slice(4).trim())}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h2>${applyInline(line.slice(3).trim())}</h2>`);
      continue;
    }

    // List items
    if (line.startsWith('- ')) {
      if (!inList) { htmlLines.push('<ul>'); inList = true; }
      htmlLines.push(`<li>${applyInline(line.slice(2).trim())}</li>`);
      continue;
    }

    // Close list if we leave list context
    if (inList) { htmlLines.push('</ul>'); inList = false; }

    // Empty line → paragraph break
    if (line.trim() === '') {
      htmlLines.push('');
      continue;
    }

    // Normal paragraph text
    htmlLines.push(`<p>${applyInline(line)}</p>`);
  }

  if (inList) htmlLines.push('</ul>');

  return htmlLines.join('\n');
}

/**
 * Apply inline Markdown formatting: bold, italic, links.
 */
function applyInline(text: string): string {
  // Links: [text](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="color:#C0281F">$1</a>',
  );
  // Bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text;
}

/**
 * Render a full HTML email from a subject line and Markdown body.
 * Returns a complete `<html>` document styled to BMJ brand.
 */
export function renderCampaignEmail(subject: string, markdownBody: string): string {
  const bodyHtml = markdownToHtml(markdownBody);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background-color:#0D0C0B; color:#E8DCC8; font-family:Georgia,'Libre Baskerville',serif; margin:0; padding:0">
  <div style="max-width:600px; padding:40px; margin:0 auto">
    <div style="font-size:14px; letter-spacing:4px; text-transform:uppercase; border-bottom:2px solid #C0281F; padding-bottom:20px; margin-bottom:30px; color:#E8DCC8">THE BLACK MALE JOURNAL</div>
    <h1 style="color:#E8DCC8; font-size:24px; margin-bottom:24px">${escapeHtml(subject)}</h1>
    ${bodyHtml}
    <hr style="border-color:#B8986A; margin:30px 0">
    <p style="font-size:12px; color:#B8986A">You received this because you subscribed to The Black Male Journal.</p>
    <p style="font-size:12px; color:#B8986A"><a href="{{unsubscribe_url}}" style="color:#C0281F">Unsubscribe</a></p>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
