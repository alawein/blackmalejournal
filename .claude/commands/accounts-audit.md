Audit account separation and access controls. Reference docs/ops/nonprofit-setup-guide.md
Phase 6 for the full access tree.

## 1. Account Separation Check

Verify that nonprofit services use org email (not personal email):

| Service | Should Use | Check |
|---------|-----------|-------|
| Stripe | Org email (founder@domain) | |
| Supabase | Org email | |
| Vercel | Linked to GitHub org | |
| Cloudflare | Org email | |
| Domain registrar | Org email | |
| Google Workspace | Org domain (primary admin) | |
| GitHub Organization | Personal account as owner (correct) | |

Flag any service still using a personal email that should use the org email.

## 2. Two-Factor Authentication

Verify 2FA is enabled on all critical accounts:

| Account | 2FA Enabled | Method |
|---------|------------|--------|
| GitHub | | TOTP / Security Key |
| Google Workspace | | TOTP |
| Stripe | | TOTP / SMS |
| Supabase | | TOTP |
| Vercel | | TOTP |
| Cloudflare | | TOTP |
| Bitwarden | | TOTP |
| Domain registrar | | TOTP |

Flag any account without 2FA enabled.

## 3. Access Review (if collaborators exist)

For each person with access to any org resource:
- List their name, role, and what they can access
- Verify they have minimum necessary permissions
- Flag any access that should be revoked (departed collaborators, scope creep)

## 4. Recovery Preparedness

- Are recovery codes for all 2FA-enabled accounts stored in Bitwarden?
- Is there a printed backup in a physical safe?
- Could you recover access to all accounts if your phone was lost today?

## Output

Summarize findings as:

| Area | Status | Issues Found |
|------|--------|-------------|
| Account separation | | |
| 2FA coverage | | |
| Access review | | |
| Recovery preparedness | | |

If everything passes, output:
All accounts are properly separated, secured, and recoverable.
