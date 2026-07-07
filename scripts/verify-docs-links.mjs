/**
 * Validates relative link targets in all Markdown files under docs/.
 * Skips http(s)://, mailto:, and fragment-only URLs. Does not fetch the network.
 *
 * Supports [text](<path with (parens)>) for paths that contain ")".
 * Skips docs/archive/ (historical artifacts with stale internal links).
 */
import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, "docs");
const archiveRoot = path.join(docsRoot, "archive");

function* walkMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walkMarkdownFiles(p);
    else if (ent.name.endsWith(".md")) yield p;
  }
}

/** Extract (url) from [text](url) and [text](<url>); skip ![image](...) */
function* markdownLinkTargets(source) {
  let i = 0;
  while (i < source.length) {
    const open = source.indexOf("](", i);
    if (open === -1) break;
    if (open > 0 && source[open - 1] === "!") {
      i = open + 2;
      continue;
    }
    const urlStart = open + 2;
    let url;
    let afterUrl;
    if (source[urlStart] === "<") {
      const gt = source.indexOf(">", urlStart);
      if (gt === -1) break;
      url = source.slice(urlStart + 1, gt).trim();
      if (source[gt + 1] !== ")") break;
      afterUrl = gt + 2;
    } else {
      const close = source.indexOf(")", urlStart);
      if (close === -1) break;
      url = source.slice(urlStart, close).trim();
      afterUrl = close + 1;
    }
    yield url;
    i = afterUrl;
  }
}

function shouldSkipUrl(rawUrl) {
  let u = rawUrl.split("#")[0].split("?")[0].trim();
  if (!u) return true;
  if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("mailto:")) {
    return true;
  }
  if (u.includes("{{") || u.includes("}}")) return true;
  // Placeholder targets in prose (e.g. "[text](url)" in documentation examples)
  if (u === "url" || u === "path" || u === "link") return true;
  return false;
}

function checkTarget(fromFile, rawUrl, failures, relFile) {
  if (shouldSkipUrl(rawUrl)) return;

  let u = rawUrl.split("#")[0].split("?")[0].trim();
  const abs = path.normalize(path.join(path.dirname(fromFile), u));
  const underRepo =
    abs === repoRoot || abs.startsWith(repoRoot + path.sep);
  if (!underRepo) {
    failures.push(`${relFile}: link leaves repository: ${rawUrl}`);
    return;
  }
  if (!fs.existsSync(abs)) {
    failures.push(`${relFile}: missing target ${rawUrl} → ${path.relative(repoRoot, abs)}`);
  }
}

const failures = [];

for (const file of walkMarkdownFiles(docsRoot)) {
  if (file.startsWith(archiveRoot + path.sep)) continue;

  const relFile = path.relative(repoRoot, file);
  const text = fs.readFileSync(file, "utf8");
  for (const raw of markdownLinkTargets(text)) {
    checkTarget(file, raw, failures, relFile);
  }
}

if (failures.length) {
  console.error("docs link check failed:\n", failures.join("\n"));
  process.exit(1);
}

let mdCount = 0;
for (const _ of walkMarkdownFiles(docsRoot)) mdCount++;
console.log(`OK: verified relative links in ${mdCount} Markdown file(s) under docs/ (archive/ skipped).`);
