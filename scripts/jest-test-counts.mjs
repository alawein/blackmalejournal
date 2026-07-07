/**
 * Runs the full Jest suite and prints suite/test totals for README.md / CLAUDE.md copy-paste.
 * Exits non-zero if any test fails.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const repoRoot = process.cwd();
const jestBin = path.join(repoRoot, "node_modules", "jest", "bin", "jest.js");

if (!fs.existsSync(jestBin)) {
  console.error("Jest not found. Run npm ci first.");
  process.exit(1);
}

const outFile = path.join(os.tmpdir(), `bmj-jest-counts-${process.pid}.json`);

const r = spawnSync(process.execPath, [jestBin, "--ci", "--json", `--outputFile=${outFile}`], {
  cwd: repoRoot,
  encoding: "utf8",
});

if (!fs.existsSync(outFile)) {
  console.error("Jest did not write JSON output.", r.stderr || r.stdout);
  process.exit(r.status ?? 1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(outFile, "utf8"));
} finally {
  fs.unlinkSync(outFile);
}

const {
  numPassedTestSuites = 0,
  numFailedTestSuites = 0,
  numTotalTestSuites = 0,
  numPassedTests = 0,
  numFailedTests = 0,
  numTotalTests = 0,
} = data;

console.log("Jest summary (use counts below when all tests pass):\n");
console.log(`  Test suites: ${numPassedTestSuites} passed, ${numTotalTestSuites} total (${numFailedTestSuites} failed)`);
console.log(`  Tests:       ${numPassedTests} passed, ${numTotalTests} total (${numFailedTests} failed)\n`);

if (numFailedTestSuites > 0 || numFailedTests > 0) {
  console.error("Fix failing tests before updating README / CLAUDE numbers.");
  process.exit(r.status ?? 1);
}

console.log("Suggested README.md table cell:");
console.log(`| \`npm test\` | Jest (${numPassedTestSuites} suites, ${numPassedTests} tests) |\n`);
console.log("Suggested CLAUDE.md bullet fragment:");
console.log(
  `- Run \`npm test\` — Jest with jsdom (${numPassedTestSuites} suites, ${numPassedTests} tests)\n`,
);

process.exit(0);
