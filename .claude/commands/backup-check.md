Walk through the weekly backup checklist. For each item, ask whether it has been completed
this week and note the status. Reference docs/ops/nonprofit-setup-guide.md Phase 8 for
full details.

## Backup Checklist

### 1. Git Repository
- Is the local repo up to date with remote? Run: `git status` and `git log --oneline -3`
- Are there uncommitted changes that should be pushed?
- Status: SYNCED / BEHIND / UNCOMMITTED CHANGES

### 2. Supabase Database
- Has a manual database export been done this week?
- Reminder: Supabase Dashboard > Project > Database > Backups, or run pg_dump
- Store export in: ExternalDrive/Backups/Database/ with filename `YYYY-MM-DD_supabase.sql`

### 3. Bitwarden Vault
- Has an encrypted vault export been done this week?
- Reminder: Bitwarden > Settings > Export Vault > Encrypted JSON
- Store export in: ExternalDrive/Backups/Vault/ with filename `YYYY-MM-DD_vault.json`

### 4. Google Drive
- Are legal and financial documents synced to Google Shared Drive?
- Any new documents added locally that haven't been uploaded?

### 5. External Drive
- Has the external drive been connected and backups written this week?
- Reminder: Keep drive disconnected when not actively backing up

### 6. Verification
- Has at least one backup been test-restored this month?
- Pick any file from the external drive and verify it opens correctly

## Output Format

Summarize as:

| Backup Target | Status | Last Verified | Action Needed |
|---------------|--------|---------------|---------------|
| Git repo      |        |               |               |
| Supabase DB   |        |               |               |
| Bitwarden     |        |               |               |
| Google Drive   |        |               |               |
| External Drive |        |               |               |
| Test restore  |        |               |               |
