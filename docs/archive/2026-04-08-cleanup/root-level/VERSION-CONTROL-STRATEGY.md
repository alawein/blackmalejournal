---
title: Version Control & Git Strategy
status: canonical
audience: [developers, devops]
last-verified: 2026-04-09
---

# Version Control & Git Strategy Guide

## Branch Strategy

### Primary Branches

**main** (Production)
- Protected branch — requires PR review before merge
- Every commit on main must be deployable to production
- CI/CD automatically tests and deploys on merge
- Tagged with semantic versioning: `v1.1.0`, `v1.1.1-hotfix`

**develop** (Development Integration)
- Optional: Use for feature integration before main
- Staging environment deploys from develop
- Features merged here first for integration testing
- Less strict review requirements than main

### Feature Branches

**Naming Convention:**
```
feature/[feature-name]      # New feature
fix/[bug-description]       # Bug fix
hotfix/[urgent-issue]       # Production hotfix
chore/[maintenance-task]    # Documentation, refactoring
docs/[doc-update]          # Documentation only
```

**Examples:**
```
feature/design-enhancements-2026
fix/accessibility-contrast-ratios
hotfix/critical-security-issue
chore/update-tailwind-config
docs/deployment-guide
```

### Workflow for Feature Deployment

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/design-enhancements-2026

# 2. Make commits (small, logical chunks)
git add src/styles/globals.css
git commit -m "feat: add glassmorphism card styles — implements blur backdrop effect"

git add docs/DEPLOYMENT-AND-MONITORING-PLAN.md
git commit -m "docs: add comprehensive deployment plan — 7 phases with monitoring"

# 3. Push to GitHub
git push origin feature/design-enhancements-2026

# 4. Create Pull Request via GitHub UI
# Title: [DEPLOY] Design Enhancements & Advanced Styling
# Description: [Full summary with test results, changes, deployment instructions]
# Reviewers: tech-lead, design-lead, devops-lead

# 5. Wait for reviews and CI/CD checks
# Fix any lint errors or test failures
git add .
git commit -m "fix: resolve ESLint warnings in globals.css"
git push origin feature/design-enhancements-2026

# 6. After approval, merge via GitHub UI
# Select: "Create a merge commit" (preserves branch history)
# GitHub creates merge commit: "Merge pull request #123 from feature/..."

# 7. Delete feature branch after merge
git push origin --delete feature/design-enhancements-2026
```

---

## Commit Message Convention

### Format
```
<type>: <scope> — <description>

<optional body explaining why, not what>

<optional footer with issue references>
```

### Type
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — CSS/formatting changes (no code changes)
- `refactor` — Code refactoring (no behavior change)
- `perf` — Performance improvements
- `test` — Adding/updating tests
- `chore` — Build, dependency, tooling changes
- `ci` — CI/CD configuration changes

### Scope (optional but recommended)
- `styles` — CSS/styling changes
- `ui` — UI component changes
- `api` — API changes
- `auth` — Authentication changes
- `db` — Database changes
- `docs` — Documentation changes

### Examples

Good commits:
```
feat: add glassmorphism card styles — implements 12px backdrop blur for premium UI elements

fix: correct accessibility contrast ratio on buttons — ensures WCAG AA compliance (4.5:1 minimum)

docs: add deployment and monitoring plan — comprehensive 7-phase guide with rollback strategy

refactor: reorganize animation utilities into src/lib/animations.ts — centralizes animation presets

style: update brand.css shadow tokens — adds elevation scale (sm, md, lg, xl)

perf: optimize CSS bundle size — reduces globals.css gzip from 5KB to 4KB

test: add E2E tests for button animations — verifies ripple effect and press feedback

chore: update tailwind.config.ts with new keyframes — adds 8 new animation definitions

ci: configure GitHub Actions for automated testing — runs ESLint, Jest, E2E on every PR
```

---

## Code Review Process

### Required Approvals

1. **Tech Lead Review** (mandatory)
   - Verifies code quality and style guide compliance
   - Checks for performance issues
   - Reviews for security vulnerabilities
   - Approves via GitHub review

2. **Design Lead Review** (if style changes)
   - Verifies brand compliance
   - Checks visual hierarchy
   - Reviews accessibility compliance
   - Approves via GitHub review

3. **DevOps Lead Review** (if deployment changes)
   - Verifies deployment strategy
   - Reviews monitoring configuration
   - Checks for infrastructure impact
   - Approves via GitHub review

### Review Guidelines

**Reviewer Checklist:**
```
- [ ] Code follows style guide
- [ ] No console.log() debug statements
- [ ] No hardcoded values (use environment variables)
- [ ] All imports organized correctly
- [ ] TypeScript types are correct
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No breaking changes to public API
- [ ] Performance acceptable
- [ ] Security best practices followed
```

**Comments Should Be:**
- Specific and actionable
- Respectful and constructive
- Focused on code, not author
- Explain the "why" not just the "what"

Example good comment:
```
The animation on this card might cause performance issues on mobile devices.
Consider using `transform` instead of `left` property for better GPU acceleration.
See: https://web.dev/animations-guide/
```

### Approval Process

```
Reviewer clicks "Approve" → GitHub shows ✅ approval
All required approvals received → "Merge" button enabled
Developer merges to main → Automatic production deployment starts
```

---

## Tagging & Versioning

### Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH[-prerelease][+build]`

Examples:
- `v1.0.0` — Initial release
- `v1.1.0` — New features added (backward compatible)
- `v1.1.1` — Bug fix
- `v1.2.0-beta.1` — Beta pre-release
- `v1.2.0-rc.1` — Release candidate

### Rules

- **MAJOR** — Breaking changes to API or database
- **MINOR** — New features, backward compatible
- **PATCH** — Bug fixes, backward compatible

### Tagging Deployments

```bash
# After merge to main, create tag
git tag -a v1.1.0 -m "Design enhancements and advanced styling"
git push origin v1.1.0

# Vercel automatically picks up tag and includes in release notes

# List all tags
git tag -l

# Show tag details
git show v1.1.0
```

### Release Notes Template

```markdown
## v1.1.0 — Design Enhancements & Advanced Styling

**Release Date:** 2026-04-11

### Features
- Add 10 core beautification improvements
- Add 8 advanced stylistic enhancements
- Improve typography hierarchy and visual flow
- Enhance accessibility (WCAG AA compliant)

### Improvements
- Modern UI elements (glassmorphism, neumorphic buttons)
- Advanced micro-interactions (ripple effects, bounce animations)
- Responsive design refinements

### Documentation
- Add comprehensive deployment and monitoring plan
- Add advanced CSS reference with 50+ classes
- Add quick-start guides for developers

### Performance
- No performance regression
- CSS bundle: +4KB gzipped (acceptable)
- Lighthouse score maintained at 92/100

### Breaking Changes
- None

### Contributors
- [Tech Lead]
- [Design Lead]
- [Developers]

### Deployment Notes
See DEPLOYMENT-AND-MONITORING-PLAN.md for complete deployment guide.
```

---

## Rollback Strategy

### Automatic Rollback

Vercel automatically keeps previous deployments available for rollback:

```bash
# Via Vercel Dashboard
1. Go to Vercel.com → blackmalejournal project
2. Click "Deployments"
3. Find previous successful deployment
4. Click "..." menu → "Promote to Production"
5. Confirm rollback
6. Vercel redeploys previous version (2-3 minutes)
```

### Manual Rollback via Git

```bash
# Find commit to revert to
git log --oneline
# Output:
# abc123 Merge pull request #456 — Design Enhancements
# def456 Previous stable version

# Create revert commit
git revert abc123
git push origin main
# Vercel automatically deploys reverted version

# Alternative: Reset to previous commit (use if no one else pushed)
git reset --hard def456
git push origin main --force  # Use with caution!
```

### Partial Rollback

If only specific files caused issues, rollback just those files:

```bash
# Revert specific file to previous version
git checkout HEAD~1 src/styles/globals.css
git add src/styles/globals.css
git commit -m "fix: revert globals.css to previous version — fixes animation issue"
git push origin main
```

---

## CI/CD Pipeline

### Automated Checks on Every PR

```
1. Linting (ESLint)
   ✓ Passes if: 0 errors, 0 warnings
   ✗ Fails if: Any errors detected

2. Unit Tests (Jest)
   ✓ Passes if: All 136 suites pass
   ✗ Fails if: Any suite fails

3. Type Checking (TypeScript)
   ✓ Passes if: 0 type errors
   ✗ Fails if: Any type errors

4. E2E Tests (Playwright)
   ✓ Passes if: All tests pass
   ✗ Fails if: Any test fails

5. Security (npm audit)
   ✓ Passes if: 0 critical vulnerabilities
   ✗ Fails if: Critical vulnerabilities found

6. Documentation (verify scripts)
   ✓ Passes if: All links valid, frontmatter present
   ✗ Fails if: Any links broken, frontmatter missing

Status: PR shows ✅ All checks passed → Ready to merge
```

### Production Deployment Trigger

```
Main branch gets PR merge
  ↓
All CI/CD checks pass automatically
  ↓
Vercel detects main branch change
  ↓
Vercel builds: npm run build (3-5 min)
  ↓
Vercel deploys to production
  ↓
Automatic health checks run
  ↓
Production URL updated with new version
```

---

## Conflict Resolution

### When Conflicts Occur

```bash
# Pull latest changes
git pull origin main

# If conflicts shown
# Edit files marked with <<<<< ===== >>>>>
# Choose which version to keep
# Or combine both versions

git add [resolved-files]
git commit -m "fix: resolve merge conflicts with main"
git push origin feature/your-branch

# PR automatically updates with conflict resolution
```

### Preventing Conflicts

1. **Keep branches short-lived** (< 2 days)
2. **Merge main into feature regularly**
   ```bash
   git fetch origin
   git merge origin/main
   git push origin feature/your-branch
   ```
3. **Communicate with team** about which files you're modifying
4. **Resolve conflicts locally** before pushing

---

## Hotfix Procedure

For urgent production issues:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# 2. Make minimal fix
git add src/styles/globals.css
git commit -m "hotfix: fix critical animation bug — prevents page freeze"

# 3. Push and create emergency PR
git push origin hotfix/critical-issue
# Create PR with label: [HOTFIX] URGENT

# 4. Fast-track review (single approval acceptable)
# Merge directly to main (skip develop)

# 5. Tag as patch version
git tag -a v1.1.1 -m "Hotfix — animation performance issue"
git push origin v1.1.1

# 6. Monitor production closely for 2 hours
```

---

## Summary

| Task | Command |
|------|---------|
| Create feature branch | `git checkout -b feature/name` |
| Push feature branch | `git push origin feature/name` |
| Create PR | GitHub UI → Create Pull Request |
| After approval | GitHub UI → Merge Pull Request |
| Delete branch | `git push origin --delete feature/name` |
| Create release tag | `git tag -a v1.1.0 -m "message"` |
| Push tag | `git push origin v1.1.0` |
| Rollback | Vercel Dashboard → Select previous deployment |
| Emergency fix | `git checkout -b hotfix/issue` → fast-track merge |

---

**Best Practices:**
- Commit often, push frequently
- Write clear commit messages
- Keep branches small and focused
- Review code thoroughly
- Test before pushing
- Don't force push to main
- Use semantic versioning
- Tag releases consistently
