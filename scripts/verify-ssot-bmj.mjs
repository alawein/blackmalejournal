/** Validate the canonical documents and runtime sources used by this repository. */
import fs from 'fs';
import path from 'path';

const inputs = [
  'README.md',
  'AGENTS.md',
  'docs/BMJ-SSOT.md',
  'docs/ARCHITECTURE.md',
  'docs/ops/env-vars.md',
  'docs/brand/invariants.md',
  'docs/brand/visual-ssot.md',
  'src/styles/brand.css',
  'tailwind.config.ts',
  'src/lib/seo.ts',
  'src/lib/supabase/types.ts',
  'src/lib/paths.ts',
  'src/lib/membership.ts',
];

const failures = inputs.filter((relative) => {
  const target = path.join(process.cwd(), relative);
  if (!fs.existsSync(target)) return true;
  const info = fs.lstatSync(target);
  return !info.isFile() || info.isSymbolicLink() || info.size === 0;
});

if (failures.length > 0) {
  console.error(`Missing, empty, or nonregular canonical input(s): ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`OK: ${inputs.length} canonical documents and source files are present.`);
