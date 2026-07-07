/**
 * Ensures docs/ssot-bmj matches the expected BMJ mirror layout (README + bmj-*.md).
 * Run in CI after sync from Downloads SSOT.
 */
import fs from "fs";
import path from "path";

const docs = path.join(process.cwd(), "docs", "ssot-bmj");
const readme = path.join(docs, "README.md");

if (!fs.existsSync(readme)) {
  console.error(`Missing ${readme}`);
  process.exit(1);
}

const names = fs.readdirSync(docs);
const bmjMd = names.filter(
  (f) => f.startsWith("bmj-") && f.endsWith(".md"),
);

if (bmjMd.length < 5) {
  console.error(
    `Expected at least 5 bmj-*.md files under docs/ssot-bmj, found ${bmjMd.length}:`,
    bmjMd,
  );
  process.exit(1);
}

console.log(`OK: docs/ssot-bmj has README.md and ${bmjMd.length} bmj-*.md file(s).`);
