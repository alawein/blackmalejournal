/**
 * Heuristic near-duplicate detector for all Markdown under docs/ (recursive; skips docs/archive/).
 * Uses Jaccard similarity and containment on word sets (length >= 4, light stopwords).
 *
 * Default: print findings, exit 0. Use --fail to exit 1 when any pair exceeds --fail-jaccard
 * or --fail-containment (stricter than display thresholds).
 *
 * Usage:
 *   npm run docs:duplicate-audit
 *   node scripts/audit-docs-duplicates.mjs --min-jaccard=0.2 --min-words=100
 *   node scripts/audit-docs-duplicates.mjs --fail
 */
import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, "docs");

const SKIP_DIR_NAMES = new Set(["archive"]);

const STOPWORDS = new Set([
  "that",
  "this",
  "with",
  "from",
  "have",
  "been",
  "will",
  "your",
  "what",
  "when",
  "than",
  "then",
  "them",
  "these",
  "those",
  "each",
  "such",
  "only",
  "also",
  "into",
  "more",
  "very",
  "just",
  "like",
  "docs",
  "bmj",
  "file",
  "path",
  "must",
  "should",
  "https",
  "http",
]);

function parseArgs() {
  let minJaccard = 0.22;
  let minContainment = 0.48;
  let minWords = 130;
  let fail = false;
  let failJaccard = 0.32;
  let failContainment = 0.58;
  let maxReport = 35;
  for (const a of process.argv.slice(2)) {
    if (a === "--fail") fail = true;
    else if (a.startsWith("--min-jaccard=")) {
      const v = Number.parseFloat(a.slice(14), 10);
      if (Number.isFinite(v)) minJaccard = v;
    } else if (a.startsWith("--min-containment=")) {
      const v = Number.parseFloat(a.slice(18), 10);
      if (Number.isFinite(v)) minContainment = v;
    } else if (a.startsWith("--min-words=")) {
      const v = Number.parseInt(a.slice(12), 10);
      if (Number.isFinite(v)) minWords = v;
    } else if (a.startsWith("--fail-jaccard=")) {
      const v = Number.parseFloat(a.slice(15), 10);
      if (Number.isFinite(v)) failJaccard = v;
    } else if (a.startsWith("--fail-containment=")) {
      const v = Number.parseFloat(a.slice(19), 10);
      if (Number.isFinite(v)) failContainment = v;
    } else if (a.startsWith("--max-report=")) {
      const v = Number.parseInt(a.slice(13), 10);
      if (Number.isFinite(v)) maxReport = v;
    }
  }
  return {
    minJaccard,
    minContainment,
    minWords,
    fail,
    failJaccard,
    failContainment,
    maxReport,
  };
}

function* walkMarkdownFiles(dir, relBase = "") {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(ent.name)) continue;
    const rel = relBase ? `${relBase}/${ent.name}` : ent.name;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walkMarkdownFiles(abs, rel);
    else if (ent.name.endsWith(".md")) yield { abs, rel: `docs/${rel.split(path.sep).join("/")}` };
  }
}

function stripFrontmatter(source) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function wordSet(source) {
  const body = stripFrontmatter(source);
  const text = body
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, " $1 ")
    .replace(/[^a-z0-9]+/g, " ");
  const words = text.split(/\s+/).filter(Boolean);
  const set = new Set();
  for (const w of words) {
    if (w.length < 4) continue;
    if (STOPWORDS.has(w)) continue;
    set.add(w);
  }
  return set;
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  const smaller = a.size <= b.size ? a : b;
  const larger = a.size <= b.size ? b : a;
  for (const w of smaller) if (larger.has(w)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function containment(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  const smaller = a.size <= b.size ? a : b;
  const larger = a.size <= b.size ? b : a;
  for (const w of smaller) if (larger.has(w)) inter += 1;
  return inter / smaller.size;
}

function main() {
  const opts = parseArgs();
  const entries = [];
  for (const { abs, rel } of walkMarkdownFiles(docsRoot)) {
    const src = fs.readFileSync(abs, "utf8");
    const set = wordSet(src);
    entries.push({ rel, set, n: set.size });
  }

  const hits = [];
  let failHits = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const A = entries[i];
      const B = entries[j];
      const minSize = Math.min(A.n, B.n);
      if (minSize < 40) continue;

      const jac = jaccard(A.set, B.set);
      const cont = containment(A.set, B.set);
      const strongJac = jac >= opts.minJaccard && minSize >= opts.minWords;
      const strongCont = cont >= opts.minContainment && minSize >= Math.floor(opts.minWords * 0.5);
      if (!strongJac && !strongCont) continue;

      const row = {
        a: A.rel,
        b: B.rel,
        jaccard: jac,
        containment: cont,
        minUnique: minSize,
      };
      hits.push(row);
      if (
        opts.fail &&
        (jac >= opts.failJaccard || cont >= opts.failContainment) &&
        minSize >= opts.minWords
      ) {
        failHits.push(row);
      }
    }
  }

  hits.sort((x, y) => y.jaccard - x.jaccard || y.containment - x.containment);

  console.log(
    "BMJ docs duplicate / near-duplicate audit (heuristic; review manually)\n",
  );
  console.log(
    `Scanned ${entries.length} Markdown file(s) under docs/ (skipped docs/archive/).\n`,
  );

  if (hits.length === 0) {
    console.log(
      "No pairs above current thresholds (min-jaccard / min-containment / min-words).",
    );
    if (opts.fail) process.exit(0);
    return;
  }

  const show = hits.slice(0, opts.maxReport);
  console.log(
    `Reporting top ${show.length} pair(s) (jaccard >= ${opts.minJaccard} or containment >= ${opts.minContainment}, min ~${opts.minWords} words in smaller doc where noted):\n`,
  );
  for (const h of show) {
    console.log(
      `  jaccard=${h.jaccard.toFixed(3)}  containment=${h.containment.toFixed(3)}  (min ${h.minUnique} words)\n    ${h.a}\n    ${h.b}\n`,
    );
  }
  if (hits.length > show.length) {
    console.log(`  … ${hits.length - show.length} more pair(s) not shown (--max-report).\n`);
  }

  console.log(
    "Mitigation: merge into one SSOT, add `supersedes` + archive, or split concerns; see docs/standards/agent-knowledge-protocol.md.\n",
  );

  if (opts.fail && failHits.length > 0) {
    console.error(
      `--fail: ${failHits.length} pair(s) exceed fail thresholds (jaccard >= ${opts.failJaccard} or containment >= ${opts.failContainment}).`,
    );
    process.exit(1);
  }
}

main();
