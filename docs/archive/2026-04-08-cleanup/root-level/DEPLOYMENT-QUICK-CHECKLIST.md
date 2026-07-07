---
title: Deployment Quick Checklist
status: canonical
audience: [devops, deployment-team]
last-verified: 2026-04-09
---

# Deployment Quick Reference Checklist

## Pre-Deployment (Day Before)

### Code & Testing
- [ ] Feature branch created: `feature/design-enhancements-2026`
- [ ] All changes committed with clear messages
- [ ] `npm run lint` — 0 errors
- [ ] `npm run test` — 136 suites passing
- [ ] `npm test:e2e` — All E2E tests passing
- [ ] `npx tsc --noEmit` — 0 TypeScript errors
- [ ] `npm audit` — 0 critical vulnerabilities

### Documentation
- [ ] `npm run verify:docs-links` — All links valid
- [ ] `npm run verify:docs-frontmatter` — YAML valid
- [ ] New documentation files added to INDEX.md
- [ ] README.md updated with new doc links

### Staging
- [ ] Feature branch pushed to GitHub
- [ ] Vercel preview deployment successful
- [ ] Preview URL tested: All pages load
- [ ] Staging metrics acceptable (Lighthouse 90+)
- [ ] No console errors in staging

### Security
- [ ] npm audit passed
- [ ] npx secretlint passed
- [ ] No hardcoded secrets in code
- [ ] All environment variables externalized

---

## Code Review

- [ ] PR created with full description
- [ ] Tech Lead approved
- [ ] Design Lead approved
- [ ] DevOps Lead approved
- [ ] All PR comments resolved
- [ ] CI/CD checks all green

---

## Day Of Deployment (30 Minutes Before)

### Notification
- [ ] Slack #announcements — Deployment starting soon
- [ ] Email to stakeholders with details
- [ ] Status page updated: "Maintenance in progress"

### Team Readiness
- [ ] On-call engineer standing by
- [ ] Tech lead available for support
- [ ] DevOps monitoring dashboard open
- [ ] Rollback plan reviewed

### Infrastructure
- [ ] Database backups created
- [ ] CDN cache warmed
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured

---

## Deployment Execution

### Merge to Main
```bash
git checkout main
git pull origin main
git merge --no-ff feature/design-enhancements-2026
git push origin main
# Vercel automatically deploys
```

### Monitor Build (3-5 minutes)
- [ ] Build started in Vercel Dashboard
- [ ] Build logs show no errors
- [ ] Build completed successfully
- [ ] Deployment to production started

### Post-Deploy Health Check (First 5 minutes)
- [ ] Production URL loads: ✓
- [ ] Homepage renders: ✓
- [ ] No 500 errors: ✓
- [ ] CSS loads correctly: ✓
- [ ] Animations smooth: ✓
- [ ] No console errors: ✓

---

## Monitoring (First 2 Hours)

### Every 5 Minutes
- [ ] Uptime 100% (no errors)
- [ ] Page load < 2.5s
- [ ] No spike in error rate

### Every 30 Minutes
- [ ] Lighthouse score stable
- [ ] API response times normal
- [ ] Database queries performing
- [ ] Stripe working
- [ ] No support tickets about breakage

### Hourly
- [ ] Lighthouse full audit (90+ score)
- [ ] Google Analytics data flowing
- [ ] User session counts normal
- [ ] No unusual traffic patterns

---

## Post-Deployment (Next 24 Hours)

- [ ] Continue monitoring every 2 hours
- [ ] Gather user feedback
- [ ] Review analytics for anomalies
- [ ] Check social media for feedback
- [ ] Document any issues found
- [ ] Plan hotfixes if needed

---

## Weekly Report (Monday After Deploy)

- [ ] All metrics stable
- [ ] User engagement metrics captured
- [ ] Feedback collection complete
- [ ] Issue analysis complete
- [ ] Team retrospective held
- [ ] Next steps documented

---

## If Issues Detected

### Minor Issue (CSS typo, animation stutter)
1. Identify root cause (5-10 min)
2. Create hotfix branch: `hotfix/animation-stutter`
3. Apply minimal fix
4. Test locally
5. Deploy hotfix to main
6. Monitor for 30 minutes

### Major Issue (Site breaking, functionality lost)
1. **IMMEDIATE ROLLBACK**
   ```bash
   git revert [commit-hash]
   git push origin main
   ```
2. Vercel redeploys previous version (2-3 min)
3. Verify rollback successful
4. Post-incident review after stabilization
5. Schedule re-deployment after fix

### Rollback via Vercel UI
1. Go to Vercel Dashboard
2. Deployments → View all
3. Click previous successful deployment
4. Click "Promote to Production"
5. Confirm rollback
6. Monitor for success

---

## Communication During Issues

**If issues detected:**

```
TO: Stakeholders, Support Team
SUBJECT: ⚠️ Deployment Issue - Engineering Team Investigating

We detected issues with today's deployment and are investigating.

Status: [Diagnosing / Fixing / Rolled Back to Previous Version]

Latest Update: [time] UTC
We estimate [X minutes] to resolution.

We'll provide updates every 15 minutes.

For urgent issues, contact: tech@blackmalejournal.org
```

---

## Success Criteria

✅ Deployment is successful if after 24 hours:

- [ ] 99%+ uptime
- [ ] 0 critical issues
- [ ] Lighthouse 90+
- [ ] No regression in Core Web Vitals
- [ ] Positive user feedback (if surveyed)
- [ ] No spike in support tickets
- [ ] All new CSS classes working
- [ ] All animations smooth
- [ ] Accessibility maintained (WCAG AA)

---

## Contacts

| Role | Name | Slack | Phone |
|------|------|-------|-------|
| Tech Lead | [Name] | @[handle] | [number] |
| Design Lead | [Name] | @[handle] | [number] |
| DevOps Lead | [Name] | @[handle] | [number] |
| On-Call | [Name] | @[handle] | [number] |

---

**Print this page and keep it nearby during deployment!**
