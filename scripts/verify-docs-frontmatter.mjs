/**
 * Ensures Markdown files under docs/ops/, docs/brand/, and docs/*.md (repo root handbooks)
 * start with YAML frontmatter containing last-verified or last-updated (ISO date YYYY-MM-DD).
 *
 * Usage:
 *   node scripts/verify-docs-frontmatter.mjs              # ops + brand + docs root (default CI)
 *   node scripts/verify-docs-frontmatter.mjs docs/ops
 *   node scripts/verify-docs-frontmatter.mjs docs/brand
 *   node scripts/verify-docs-frontmatter.mjs docs-root    # only direct children of docs/*.md
 */
import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

const DEFAULT_LANES = ["docs/ops", "docs/brand", "docs-root"];

const DATE_RE = /\d{4}-\d{2}-\d{2}/;

function parseFrontmatter(source, laneRoot) {
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fm) {
    return {
      ok: false,
      reason: "missing YAML frontmatter at file start (--- ... ---)",
    };
  }
  const block = fm[1];
  const hasDate =
    /^last-verified:\s*\S/m.test(block) ||
    /^last-updated:\s*\S/m.test(block);
  if (!hasDate) {
    return {
      ok: false,
      reason: "frontmatter must include last-verified or last-updated",
    };
  }
  if (!DATE_RE.test(block)) {
    return {
      ok: false,
      reason: "last-verified or last-updated must contain a YYYY-MM-DD date",
    };
  }

  const sup = block.match(/^supersedes:\s*(.+)$/m);
  if (sup) {
    const raw = sup[1].trim().replace(/^["']|["']$/g, "");
    if (raw && !raw.startsWith("http")) {
      const target = path.normalize(path.join(laneRoot, raw));
      const under =
        target === laneRoot || target.startsWith(laneRoot + path.sep);
      if (under && !fs.existsSync(target)) {
        return { ok: false, reason: `supersedes target missing: ${raw}` };
      }
    }
  }

  return { ok: true };
}

function* laneMarkdownFiles(laneRel) {
  const laneRoot = path.join(repoRoot, ...laneRel.split(/[/\\]/));
  if (!fs.existsSync(laneRoot)) return;
  for (const ent of fs.readdirSync(laneRoot, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith(".md")) continue;
    yield { abs: path.join(laneRoot, ent.name), laneRoot };
  }
}

/** Top-level docs/*.md only (handbooks + index), not subfolders */
function* docsRootMarkdownFiles() {
  const docsDir = path.join(repoRoot, "docs");
  if (!fs.existsSync(docsDir)) return;
  for (const ent of fs.readdirSync(docsDir, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith(".md")) continue;
    yield { abs: path.join(docsDir, ent.name), laneRoot: docsDir };
  }
}

function main() {
  const argLanes = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const lanes = argLanes.length > 0 ? argLanes : DEFAULT_LANES;

  const failures = [];
  let total = 0;
  const labels = [];

  for (const laneRel of lanes) {
    if (laneRel === "docs-root" || laneRel === "docs/root") {
      labels.push("docs/*.md (root)");
      for (const { abs, laneRoot: lr } of docsRootMarkdownFiles()) {
        total += 1;
        const rel = path.relative(repoRoot, abs);
        const src = fs.readFileSync(abs, "utf8");
        const r = parseFrontmatter(src, lr);
        if (!r.ok) failures.push(`${rel}: ${r.reason}`);
      }
      continue;
    }

    const laneRoot = path.join(repoRoot, ...laneRel.split(/[/\\]/));
    if (!fs.existsSync(laneRoot)) {
      failures.push(`${laneRel}: lane directory missing`);
      continue;
    }
    labels.push(laneRel);
    for (const { abs, laneRoot: lr } of laneMarkdownFiles(laneRel)) {
      total += 1;
      const rel = path.relative(repoRoot, abs);
      const src = fs.readFileSync(abs, "utf8");
      const r = parseFrontmatter(src, lr);
      if (!r.ok) failures.push(`${rel}: ${r.reason}`);
    }
  }

  if (failures.length) {
    console.error("docs frontmatter verification failed:\n");
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(
    `OK: ${total} Markdown file(s) passed frontmatter checks (${labels.join(", ")}).`,
  );
}

main();
