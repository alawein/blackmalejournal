/**
 * Brand Compliance Guard — Static Analysis
 *
 * Scans all component source files for CSS patterns prohibited by
 * docs/brand/invariants.md. This test prevents brand violations from
 * being introduced in future work.
 *
 * If this test fails, you are using a prohibited CSS pattern.
 * Read docs/brand/invariants.md for the full rules.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const COMPONENTS_DIR = join(__dirname, '..', 'src', 'components');

/** Recursively collect all .tsx files in a directory */
function collectTsxFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectTsxFiles(full));
    } else if (entry.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

const PROHIBITED = [
  {
    // Matches Tailwind shadow utilities directly. Excludes CSS-variable references
    // like shadow-[var(--shadow-md)] which are the correct token-based approach.
    pattern: /(?<!\[var\(--)shadow-(?:sm|md|lg|xl|2xl|inner)\b/g,
    name: 'drop shadows (shadow-sm/md/lg/xl/2xl/inner) — use shadow-[var(--shadow-*)] instead',
  },
  {
    pattern: /\bbg-gradient-/g,
    name: 'gradient backgrounds (bg-gradient-*)',
  },
  {
    pattern: /\brounded-(?:md|lg|xl|2xl|3xl)\b/g,
    name: 'rounded corners > 4px (rounded-md/lg/xl/2xl/3xl)',
  },
];

// Files with intentional exceptions — functional UI elements that require gradients
// or shadows. Each entry lists the specific prohibited patterns that are allowed
// in that file. Do NOT add new entries without a design review.
const ALLOWED_EXCEPTIONS: Record<string, RegExp[]> = {
  // Upload field shimmer: animated gradient communicates upload progress state
  'StorageUploadField.tsx': [/\bbg-gradient-/],
  // Lesson progress bar: gradient fill communicates completion percentage
  'LessonCard.tsx': [/\bbg-gradient-/],
};

const componentFiles = collectTsxFiles(COMPONENTS_DIR);

// Files that intentionally use raw hover transforms with non-standard values
// Paths are normalized to forward slashes for cross-platform matching
const KNOWN_UTILITY_BYPASSES = new Set<string>([
  // hover:scale-105 on image inside carousel — intentional image zoom, not a card lift
  'home/FeaturedCarousel.tsx',
  // hover:scale-150 on pagination dot — intentional dramatic scale for dot indicator
  'home/RotatingQuote.tsx',
  // hover:-translate-y-px — 1px micro-lift on avatar button, approved per design
  'layout/UserDropdown.tsx',
]);

describe('Brand Token Enforcement', () => {
  it('no component uses raw hover-translate or hover-scale (use .hover-lift / .hover-scale instead)', () => {
    // Matches standalone hover: but not group-hover: or peer-hover: variants
    const hoverTransformPattern = /(?<![a-z-])hover:(?:-?)(?:translate-[xy]|scale)-/g;
    const violations: string[] = [];

    for (const filePath of componentFiles) {
      const relPath = relative(COMPONENTS_DIR, filePath).replace(/\\/g, '/');
      if (KNOWN_UTILITY_BYPASSES.has(relPath)) continue;

      const content = readFileSync(filePath as string, 'utf-8');
      hoverTransformPattern.lastIndex = 0;
      const matches = content.match(hoverTransformPattern) ?? [];

      if (matches.length > 0) {
        violations.push(
          `${relPath}: found ${matches.join(', ')} — use hover-lift or hover-scale instead`,
        );
      }
    }

    if (violations.length > 0) {
      throw new Error(
        'Hover transform violations (use semantic utilities):\n' +
          violations.map((v) => `  - ${v}`).join('\n') +
          '\n\nBrand system: .hover-lift = hover:-translate-y-1, .hover-lift-sm = hover:-translate-y-0.5, .hover-scale = hover:scale-[1.02]',
      );
    }
  });
});

describe('Brand Compliance Guard', () => {
  it.each(componentFiles.map((f) => [relative(COMPONENTS_DIR, f), f]))(
    '%s has no prohibited CSS patterns',
    (relPath, filePath) => {
      const fileName = (relPath as string).split(/[/\\]/).pop() ?? '';
      const exceptions = ALLOWED_EXCEPTIONS[fileName] ?? [];
      const content = readFileSync(filePath as string, 'utf-8');
      const violations: string[] = [];

      for (const { pattern, name } of PROHIBITED) {
        pattern.lastIndex = 0;
        const matches = (content.match(pattern) ?? []).filter(
          (m) => !exceptions.some((ex) => ex.test(m)),
        );
        if (matches.length > 0) {
          violations.push(`${name}: ${matches.join(', ')}`);
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `Brand violation in ${relPath}:\n` +
            violations.map((v) => `  - ${v}`).join('\n') +
            '\n\nSee docs/brand/invariants.md for rules.',
        );
      }
    },
  );

  it('scanned at least 30 component files', () => {
    expect(componentFiles.length).toBeGreaterThanOrEqual(30);
  });
});

describe('Brand Token Enforcement', () => {
  const BRAND_HEX_VALUES = new Set([
    // Primary colors — must use bmj-* tokens, not raw hex
    '0D0C0B', 'E8DCC8', 'C0281F', 'C8852A', '3B2417', 'B8986A', 'F2EDE4',
    // Sectional accent colors
    'F0DDBC', '1C130E', '712414', '5D3F2E', '416100', 'C77A0E', '554978',
  ]);

  it('no component uses hardcoded brand hex in Tailwind arbitrary value syntax', () => {
    // Pattern: [#416100] or [#C0281F] — Tailwind arbitrary hex values
    const inlineHexPattern = /\[#([0-9A-Fa-f]{6})\]/g;
    const violations: string[] = [];

    for (const filePath of componentFiles) {
      const content = readFileSync(filePath as string, 'utf-8');
      const relPath = relative(COMPONENTS_DIR, filePath);
      const matches = content.match(inlineHexPattern) ?? [];

      for (const match of matches) {
        // match is like [#416100] — extract the 6-char hex
        const hex = match.slice(2, -1).toUpperCase();
        if (BRAND_HEX_VALUES.has(hex)) {
          violations.push(`${relPath}: found ${match} — use bmj-* token instead`);
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        'Brand hex violations (use token classes, not raw hex):\n' +
          violations.map((v) => `  - ${v}`).join('\n') +
          '\n\nSee .claude/rules/brand.md for token names.',
      );
    }
  });

  it('root layout loads Highrise via next/font/local, not Bebas Neue from Google', () => {
    const layoutPath = join(__dirname, '..', 'src', 'app', 'layout.tsx');
    const content = readFileSync(layoutPath, 'utf-8');

    expect(content).toContain('next/font/local');
    expect(content).toContain('highrise-regular.otf');
    expect(content).not.toContain('Bebas_Neue');
  });
});
