/**
 * Verifies REP GitHub Issue Form files exist and (locally) that the `documentation` label exists.
 * Manual UI check still required: open the printed "new issue" chooser URL.
 *
 * In GitHub Actions, the default `GITHUB_TOKEN` often cannot list labels (403). CI therefore
 * checks only committed files under `.github/ISSUE_TEMPLATE/`. Run locally for full checks.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (e) {
    const stderr = e.stderr?.toString?.() ?? "";
    throw new Error(`${e.message}\n${stderr}`);
  }
}

const REQUIRED_TEMPLATES = [
  "config.yml",
  "rep-pilot-nomination.yml",
  "rep-weekly-status.yml",
];

const templateDir = path.join(process.cwd(), ".github", "ISSUE_TEMPLATE");
for (const f of REQUIRED_TEMPLATES) {
  const p = path.join(templateDir, f);
  if (!fs.existsSync(p)) {
    console.error(`Missing Issue Template file: ${p}`);
    process.exit(1);
  }
}

let nameWithOwner = process.env.GITHUB_REPOSITORY?.trim();
if (!nameWithOwner) {
  try {
    nameWithOwner = sh("gh repo view --json nameWithOwner -q .nameWithOwner");
  } catch (e) {
    console.error("Could not resolve repo with `gh repo view`.", e.message);
    process.exit(1);
  }
}

const chooseUrl = `https://github.com/${nameWithOwner}/issues/new/choose`;

if (process.env.GITHUB_ACTIONS === "true") {
  console.log(`OK (CI): ${nameWithOwner}`);
  console.log(`  Issue templates (on disk): ${REQUIRED_TEMPLATES.join(", ")}`);
  console.log(
    `  Note: "documentation" label is not verified in CI (token cannot list labels). Run locally: npm run verify:rep-governance`,
  );
  console.log(`  Next (browser): ${chooseUrl}`);
  process.exit(0);
}

try {
  sh("gh auth status");
} catch {
  console.error("Run `gh auth login` first, then retry.");
  process.exit(1);
}

let labels;
try {
  const raw = sh(`gh api "repos/${nameWithOwner}/labels"`);
  labels = JSON.parse(raw);
} catch (e) {
  console.error("Could not list labels:", e.message);
  process.exit(1);
}

const hasDocumentation = labels.some((l) => l.name === "documentation");
if (!hasDocumentation) {
  console.error(
    `Repo ${nameWithOwner} is missing the "documentation" label (used by REP Issue Forms).`,
  );
  console.error(
    'Create with: gh label create documentation --repo "' +
      nameWithOwner +
      '" --color "0075ca"',
  );
  process.exit(1);
}

console.log(`OK: ${nameWithOwner}`);
console.log(`  Issue templates: ${REQUIRED_TEMPLATES.join(", ")}`);
console.log(`  Label "documentation": present`);
console.log(`  Next (browser): ${chooseUrl}`);
