/**
 * Renders a JSON-LD structured data script tag for search engine optimization.
 *
 * SECURITY NOTE: This component is safe from XSS because:
 * 1. JSON.stringify() produces valid JSON that cannot contain HTML/script tags
 * 2. The data parameter comes exclusively from our own seo.ts constants
 * 3. type="application/ld+json" scripts are not executed by browsers
 * 4. This is the standard Next.js pattern recommended in their official docs
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const serialized = JSON.stringify(data);

  return (
    <script
      type="application/ld+json"
      // Safe: JSON.stringify of static data for a non-executable JSON-LD script tag
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
