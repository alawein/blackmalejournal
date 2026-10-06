import type { SearchResult } from '@/lib/supabase/types';

import { readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, relative, resolve, sep } from 'path';

import * as queries from '@/lib/supabase/queries';

describe('queries barrel exports', () => {
  it('exposes content-domain query contracts', () => {
    expect(typeof queries.getArticles).toBe('function');
    expect(typeof queries.getArticleBySlug).toBe('function');
    expect(typeof queries.getBriefings).toBe('function');
    expect(typeof queries.getCourses).toBe('function');
    expect(typeof queries.getLessonsByCourse).toBe('function');
    expect(typeof queries.getDispatches).toBe('function');
    expect(typeof queries.getDispatchesForListing).toBe('function');
    expect(typeof queries.getHandbooks).toBe('function');
    expect(typeof queries.getDownloads).toBe('function');
  });

  it('exposes member and contact contracts', () => {
    expect(typeof queries.getMemberById).toBe('function');
    expect(typeof queries.updateMemberTier).toBe('function');
    expect(typeof queries.subscribeToNewsletter).toBe('function');
    expect(typeof queries.submitContactForm).toBe('function');
  });

  it('exposes search contracts', () => {
    expect(typeof queries.searchContent).toBe('function');
    expect(typeof queries.searchContentFTS).toBe('function');
    const result: SearchResult = {
      type: 'article',
      title: 'Boundary',
      slug: 'boundary',
      excerpt: '',
      publishedAt: '2026-01-01',
    };
    expect(result).toHaveProperty('type', 'article');
  });
});

const LIB_DIR = resolve(__dirname, '..', '..', 'src', 'lib');

// Dependency contract: src/lib/ is foundation + domain queries. It must never
// import the composition layer (src/app/) or presentation layer
// (src/components/) — those layers consume lib, never the reverse.
const FORBIDDEN_LIB_IMPORTS = [
  /from\s+['"]@\/components(?:\/|$)/,
  /from\s+['"]@\/app(?:\/|$)/,
  /require\(\s*['"]@\/(?:components|app)(?:\/|$)/,
];

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSourceFiles(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.d\.ts$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function libPathForMessage(file: string): string {
  const rel = relative(resolve(__dirname, '..', '..'), dirname(file));
  return rel.split(sep).join('/');
}

describe('lib layer direction', () => {
  const libFiles = collectSourceFiles(LIB_DIR);
  const violations: string[] = [];

  for (const file of libFiles) {
    const content = readFileSync(file, 'utf-8');
    for (const pattern of FORBIDDEN_LIB_IMPORTS) {
      pattern.lastIndex = 0;
      const matches = content.match(pattern) ?? [];
      if (matches.length > 0) {
        violations.push(`${libPathForMessage(file)}: ${matches.join(', ')}`);
      }
    }
  }

  it(`scans the lib tree (${libFiles.length} files)`, () => {
    expect(libFiles.length).toBeGreaterThan(0);
  });

  it('never imports components/ or app/ (inversion ban)', () => {
    if (violations.length > 0) {
      throw new Error(
        'Layer inversion: src/lib/ must not import src/components/ or src/app/:\n' +
          violations.map((v) => `  - ${v}`).join('\n'),
      );
    }
  });
});
