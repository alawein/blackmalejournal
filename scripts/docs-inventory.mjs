/**
 * Prints Markdown (and optional HTML) counts for documentation sprawl tracking.
 * Run from repo root: npm run docs:inventory
 */
import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
  ".turbo",
]);

function* walkFiles(dir, ext) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walkFiles(p, ext);
    else if (ent.name.endsWith(ext)) yield p;
  }
}

function bucketFor(relPath) {
  const parts = relPath.split(/[/\\]/);
  const first = parts[0] || "";
  if (first === "docs") {
    const second = parts[1];
    if (second) return `docs/${second}`;
    return "docs";
  }
  if (first === ".claude") return ".claude";
  if (first === ".cursor") return ".cursor";
  if (["tests", "scripts", "public"].includes(first)) return first;
  if (parts.length === 1 && relPath.endsWith(".md")) return "(repo root)";
  return "other";
}

function main() {
  const mdFiles = [...walkFiles(repoRoot, ".md")].map((p) => path.relative(repoRoot, p));
  const htmlUnderDocsBrand = [
    ...walkFiles(path.join(repoRoot, "docs", "brand"), ".html"),
  ].map((p) => path.relative(repoRoot, p));

  const docsMd = mdFiles.filter((r) => r === "docs" || r.startsWith("docs/") || r.startsWith("docs\\"));

  const byBucket = new Map();
  for (const rel of mdFiles) {
    const b = bucketFor(rel);
    byBucket.set(b, (byBucket.get(b) || 0) + 1);
  }

  const sortedBuckets = [...byBucket.entries()].sort((a, b) => b[1] - a[1]);

  console.log("BMJ documentation inventory (committed tree)\n");
  console.log(`Markdown (.md) total:     ${mdFiles.length}`);
  console.log(`Markdown under docs/:     ${docsMd.length}`);
  console.log(`HTML under docs/brand/:   ${htmlUnderDocsBrand.length}`);
  console.log("\nMarkdown by top bucket:\n");
  for (const [name, n] of sortedBuckets) {
    console.log(`  ${String(n).padStart(4)}  ${name}`);
  }
  console.log(
    "\nTip: pair with docs/standards/agent-knowledge-protocol.md (tiers A–D) for agent context policy.",
  );
}

main();
