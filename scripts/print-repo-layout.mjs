/**
 * Prints a shallow directory tree for key repo roots (Markdown-friendly).
 * For human review and diffs; not a substitute for ARCHITECTURE.md narrative.
 *
 * Usage: node scripts/print-repo-layout.mjs [--depth=N]
 */
import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

const SKIP_NAMES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
  ".turbo",
]);

const ROOTS = [
  ".github",
  "docs",
  "public",
  "scripts",
  "src",
  "supabase",
  "tests",
];

function parseDepth() {
  const arg = process.argv.find((a) => a.startsWith("--depth="));
  if (!arg) return 3;
  const n = Number.parseInt(arg.slice("--depth=".length), 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 6) : 3;
}

const maxDepth = parseDepth();

/** @param {string} absDir */
function listEntries(absDir) {
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) return [];
  return fs
    .readdirSync(absDir, { withFileTypes: true })
    .filter((e) => !SKIP_NAMES.has(e.name) && !e.name.startsWith("."))
    .sort((a, b) => {
      if (a.isDirectory() === b.isDirectory()) return a.name.localeCompare(b.name);
      return a.isDirectory() ? -1 : 1;
    });
}

/**
 * @param {string} absDir
 * @param {string} prefix
 * @param {number} depth
 */
function walk(absDir, prefix, depth) {
  if (depth > maxDepth) return;
  const entries = listEntries(absDir);
  for (let i = 0; i < entries.length; i++) {
    const ent = entries[i];
    const isLast = i === entries.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const nextPrefix = prefix + (isLast ? "    " : "│   ");
    console.log(`${prefix}${branch}${ent.name}${ent.isDirectory() ? "/" : ""}`);
    if (ent.isDirectory()) {
      walk(path.join(absDir, ent.name), nextPrefix, depth + 1);
    }
  }
}

console.log(`Repository layout snapshot (max depth ${maxDepth} under each root; hidden/dot dirs skipped)\n`);
console.log("Here: `.` = repo root\n");

for (const rel of ROOTS) {
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs)) {
    console.log(`${rel}/  (missing)\n`);
    continue;
  }
  console.log(`${rel}/`);
  walk(abs, "", 1);
  console.log("");
}

console.log("Curated narrative and governance mapping: docs/ARCHITECTURE.md (Repository layout — monorepo root).");
