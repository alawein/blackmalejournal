---
title: REP — Organization Rollout of Issue Templates and Defaults
audience: [platform, github-admins]
status: ready-to-use
last-updated: 2026-03-31
---

# Organization rollout: Issue Forms and default community files

This guide covers rolling **REP** GitHub Issue Forms and related defaults beyond a single repository: org-wide defaults, template repositories, and label hygiene.

---

## 1) Default `documentation` label

Issue forms in this repo apply `labels: [documentation]`. **Ensure the label exists** in every target repository (or remove the `labels` key from the YAML if you prefer untagged intake).

**Check:**

```bash
gh label list --repo OWNER/REPO --limit 100 | findstr /i documentation
```

**Create (if missing):**

```bash
gh label create documentation --repo OWNER/REPO --color "0075ca" --description "Improvements or additions to documentation"
```

`gh` exits with an error if the label already exists; that is expected.

---

## 2) Smoke-test Issue Forms (repository)

After merging `.github/ISSUE_TEMPLATE/*.yml`:

**Automated check:**

```bash
npm run verify:rep-governance
```

- **GitHub Actions:** verifies `.github/ISSUE_TEMPLATE/*` files are present in the checkout (default `GITHUB_TOKEN` often cannot list labels).
- **Local / developer machine:** same file checks **plus** verifies the `documentation` label exists via `gh api`.

Then complete the **manual UI check**:

1. Open **`https://github.com/OWNER/REPO/issues/new/choose`** (URL is printed by the script)
2. Confirm you see:
   - **REP pilot nomination**
   - **REP weekly status**
3. Open each form; submit a **test issue** in a non-production repo or close immediately after verification.

**API check (files present on default branch):**

```bash
gh api repos/OWNER/REPO/contents/.github/ISSUE_TEMPLATE --jq ".[].name"
```

Expected filenames: `config.yml`, `rep-pilot-nomination.yml`, `rep-weekly-status.yml`.

---

## 3) Org-level default community health (`.github` repository)

GitHub supports a special organization repository named **`.github`** for default community health files. You can place **default issue templates** and other defaults there so they apply org-wide **when a repository does not define its own**.

Official reference: [Creating a default community health file](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)

**Typical layout:**

```text
.github/   # org repo name: .github
  ISSUE_TEMPLATE/
    rep-pilot-nomination.yml
    rep-weekly-status.yml
    config.yml
  profile/
    README.md   # optional org profile
```

**Caveats:**

- Repository-specific templates **override** org defaults when both exist.
- Test in one org before rolling out broadly.

---

## 4) Template repository (recommended for REP)

Create an org **Template repository** (e.g. `org/repo-template-default`) that includes:

- `.github/ISSUE_TEMPLATE/` (copy from this repo)
- `docs/templates/` and `docs/standards/` as reference copies (optional)

New repos: **Use this template** so Issue Forms and docs land on day one.

---

## 5) Forking or copying from this repo — update URLs

The YAML forms include markdown links to `blackmalejournal/blackmalejournal` for convenience. When you copy to another org/repo, **replace** those URLs with the canonical home for your standards, or use relative documentation paths inside the same repo.

Search and replace:

- `https://github.com/blackmalejournal/blackmalejournal/blob/main/` → your `OWNER/REPO/blob/main/`

---

## 6) Bulk label creation across repositories

For many repos, use a small loop (Bash example):

```bash
ORG=your-org
REPOS="repo-a repo-b repo-c"
for R in $REPOS; do
  gh label create documentation --repo "$ORG/$R" --color "0075ca" --description "Documentation" 2>/dev/null || true
done
```

On Windows PowerShell, use `foreach` or run via Git Bash.

---

## 7) What not to automate blindly

- Do not overwrite a team’s custom `ISSUE_TEMPLATE` without review; merge or namespace (e.g. `rep-` prefix) to avoid collisions.
- Do not enable **required** org rulesets on Issue Forms until pilot feedback is incorporated.

---

## References (this repository)

- Issue Forms: `.github/ISSUE_TEMPLATE/`
- Launch kit: [repo-governance-launch-kit.md](./repo-governance-launch-kit.md)
- Standards hub: [../standards/README.md](../standards/README.md)
