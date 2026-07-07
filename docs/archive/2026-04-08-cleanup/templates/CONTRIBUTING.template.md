# Contributing

Thanks for helping improve **{{REPO_NAME}}**. This guide explains how we work day to day.

## Ground rules

- **Be respectful** in reviews and issues.
- **Prefer small PRs** with a clear purpose; link tickets (`Fixes #123`).
- **Do not commit secrets.** Use `.env.example` only for non-sensitive placeholders.

## Development workflow

1. **Branch from `main`:** `feat/short-description`, `fix/issue-123`, or `chore/...`.
2. **Keep up to date:** `git fetch origin && git rebase origin/main` (or merge if team policy says so).
3. **Run checks locally** before pushing:

   ```bash
   {{LINT_COMMAND}}
   {{TEST_COMMAND}}
   ```

4. **Open a PR** using the template; fill risk and testing sections honestly.

## Code review

- At least **one** approval from CODEOWNERS (two for high-risk areas—see team policy).
- Address feedback or explain why not; don’t resolve threads without agreement.
- **Maintainers may push small fix commits** to your branch if you allow maintainer edits.

## Commits

We recommend [Conventional Commits](https://www.conventionalcommits.org/) for clearer history and changelogs:

- `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`

## CI

- **Green CI is required** before merge unless an emergency process is invoked (document in PR).
- **Flaky tests:** file an issue, quarantine with owner + deadline—don’t ignore red builds long-term.

## Exceptions to org standards

If this repo needs a waiver (lint rule, missing artifact, etc.), open a request using the **exception template** in `docs/governance/` or your platform handbook, and link the exception ID in the PR.

## Getting help

- **Slack/Teams:** {{CHANNEL}}
- **Office hours:** {{OPTIONAL_LINK_OR_SCHEDULE}}
