import { execFileSync } from "node:child_process";

// GHSA-vfj7-8cjw-p6xm: braces stack-exhaustion DoS. Vulnerable up to 3.0.3 and
// no fixed version is published upstream (checked 2026-10-04); the dependency
// tree reaches it through tailwindcss 3 (chokidar) and jest (micromatch), so no
// compatible bump clears it. Recheck when the next braces release lands and
// remove it from this allowlist.
const ALLOWED_GHSA_IDS = new Set(["GHSA-vfj7-8cjw-p6xm"]);

let raw;
try {
  raw = execFileSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["audit", "--json"],
    {
      encoding: "utf8",
      windowsHide: true,
      shell: process.platform === "win32" ? true : false,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
} catch (error) {
  raw = error.stdout ?? "";
  if (!raw) {
    console.log(`npm audit: could not run npm audit (${error.message})`);
    process.exit(1);
  }
}

const report = JSON.parse(raw);
const vulnerabilities = report.vulnerabilities ?? {};

const directUrls = new Map();
for (const [name, entry] of Object.entries(vulnerabilities)) {
  directUrls.set(
    name,
    (entry.via ?? [])
      .filter((item) => typeof item === "object" && item.url)
      .map((item) => item.url.replace(/^https?:\/\/[^/]*\/advisories\//, "")),
  );
}

const resolvedUrls = new Map();
for (const entry of directUrls.keys()) {
  resolvedUrls.set(entry, null);
}

function urlsFor(name) {
  let memo = resolvedUrls.get(name);
  if (memo !== null) return memo;
  memo = new Set(directUrls.get(name) ?? []);
  resolvedUrls.set(name, memo);
  for (const viaName of (vulnerabilities[name]?.via ?? []).filter(
    (item) => typeof item === "string",
  )) {
    for (const url of urlsFor(viaName)) memo.add(url);
  }
  return memo;
}

const failures = [];
const allowance = new Set();
for (const [name, entry] of Object.entries(vulnerabilities)) {
  const severity = entry.severity;
  if (severity !== "high" && severity !== "critical") continue;
  const ids = urlsFor(name);
  const outside = [...ids].filter((id) => !ALLOWED_GHSA_IDS.has(id));
  if (outside.length > 0) {
    failures.push(`${entry.severity}: ${name}: ${outside.sort().join(", ")}`);
  } else {
    allowance.add(name);
  }
}

for (const allowed of [...allowance].sort()) {
  console.log(`allowed (unpatched upstream): ${allowed}`);
}
for (const failure of failures) {
  console.log(`FAILURE ${failure}`);
}
if (failures.length > 0) {
  console.log(`npm audit: ${failures.length} unallowlisted high/critical advisory path(s)`);
  process.exit(1);
}
console.log("npm audit: high-severity gate passed (allowlist only for published-less advisories)");
