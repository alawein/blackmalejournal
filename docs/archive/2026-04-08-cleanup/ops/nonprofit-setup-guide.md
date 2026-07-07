---
title: Nonprofit organization setup guide
status: reference
audience: [chairman, operators, engineers]
last-verified: 2026-03-31
---

# Nonprofit Organization Setup Guide

> Comprehensive setup guide for The Black Male Journal as a nonprofit entity.
> Steps ordered by dependency — each phase unlocks the next.

---

## Phase 0: Password Manager & Security Foundation

Everything that follows generates credentials. Set this up first.

**Tool: Bitwarden** (free for personal, $3/mo for org tier later)

1. Create a personal Bitwarden account with a strong master password
2. Enable two-factor authentication (TOTP via an authenticator app, not SMS)
3. Create a folder structure inside the vault:
   - `Nonprofit / Legal`
   - `Nonprofit / Banking`
   - `Nonprofit / Google Workspace`
   - `Nonprofit / Developer`
   - `Nonprofit / Social & Platforms`
4. Install the browser extension and mobile app
5. Generate a recovery kit and store it physically (printed, in a safe or lockbox)

**Why first:** Every subsequent step creates a login. Without a vault from day one, credentials end up in notes apps, screenshots, and sticky notes.

---

## Phase 1: Legal & Administrative Foundation

### 1A. Registered Address

You need a real address before filing anything. Home address works legally but becomes public record.

**Options:**
- **Home address** — free, but visible on IRS records
- **Registered agent service** (Northwest Registered Agent, ~$125/yr) — provides a business address, forwards mail, and acts as your registered agent for state filings
- **PO Box + registered agent** — PO Box for general mail, agent address for legal filings

Record the chosen address in your vault under `Nonprofit / Legal`.

### 1B. Phone Number

A dedicated nonprofit phone number keeps personal and org communication separate.

**Tool: Google Voice** (free with a Google account)

1. Go to voice.google.com and claim a number in your area code
2. Forward it to your personal cell
3. Use this number on all nonprofit filings, bank applications, and public listings

**Alternative:** Port the number to OpenPhone ($15/mo) later for shared voicemail, auto-attendant, and multiple users.

### 1C. State Incorporation

Before the IRS will issue an EIN, you typically need to incorporate at the state level.

1. File **Articles of Incorporation** as a nonprofit corporation with your state's Secretary of State
   - Most states have an online portal (expect $25-$125 filing fee)
   - You'll need: org name, registered agent address, incorporator name, purpose statement
2. Draft **Bylaws** — template sources: Nolo.com, your state's nonprofit association, or a local legal aid clinic
3. Hold an **organizational board meeting** (even if it's just you) — document it with meeting minutes
4. Record the filing confirmation number and date in your vault

### 1D. EIN (Employer Identification Number)

**Where:** IRS.gov — "Apply for an Employer Identification Number (EIN) Online"

- Free, takes 10 minutes, instant confirmation
- You'll need: legal name, registered address, responsible party's SSN, entity type (nonprofit corporation)
- Save the CP 575 confirmation letter (PDF) to your vault immediately

**What this unlocks:** Bank accounts, payment processors, Google for Nonprofits, grant applications.

### 1E. 501(c)(3) Tax-Exempt Status (if applicable)

This is separate from the EIN and takes longer.

1. File **IRS Form 1023** (full, $600) or **Form 1023-EZ** (simplified, $275) — eligibility for EZ depends on projected revenue under $50K and assets under $250K
2. Typical processing: 3-6 months
3. While pending, you can still operate — you just can't guarantee donors tax-deductible receipts until approved

**Store in vault:** EIN letter, state incorporation docs, 501(c)(3) determination letter (when received).

---

## Phase 2: Domain & Online Identity

### 2A. Domain Acquisition

**Registrar: Cloudflare Registrar** (at-cost pricing, no markup) or **Namecheap**

1. Register your primary domain (e.g., `blackmalejournal.com`)
2. Consider also registering the `.org` variant to prevent squatting
3. Enable **WHOIS privacy** (free on Cloudflare, included on Namecheap)
4. Enable **registrar lock** to prevent unauthorized transfers
5. Set auto-renew on

**Store in vault:** Registrar login, domain name, expiration date, transfer auth code.

### 2B. DNS Setup

**Recommended: Cloudflare** (free tier) — even if you bought the domain elsewhere, point nameservers to Cloudflare for CDN, DDoS protection, and easy DNS management.

1. Add your domain to Cloudflare
2. Update nameservers at your registrar to point to Cloudflare
3. Don't add any records yet — email and hosting records come in the next phases

---

## Phase 3: Google Workspace & Email

### 3A. Google for Nonprofits

**Before buying Workspace**, apply for Google for Nonprofits — you get Workspace Business Standard for free.

1. Register at **Google for Nonprofits** (nonprofits.google.com)
2. Verification is handled through **Percent** (formerly TechSoup) — you'll need your EIN and incorporation docs
3. Approval takes 2-14 business days
4. Once approved, activate **Google Workspace** from the Google for Nonprofits console

**If you can't wait:** Purchase Google Workspace Business Starter ($7.20/user/mo) and cancel when the free tier activates.

### 3B. Google Workspace Setup

1. Set your primary domain in Workspace admin
2. Add the required **MX records** in Cloudflare DNS:

   | Type | Name | Content | Priority |
   |------|------|---------|----------|
   | MX | @ | aspmx.l.google.com | 1 |
   | MX | @ | alt1.aspmx.l.google.com | 5 |
   | MX | @ | alt2.aspmx.l.google.com | 5 |
   | MX | @ | alt3.aspmx.l.google.com | 10 |
   | MX | @ | alt4.aspmx.l.google.com | 10 |

3. Add **SPF** record: `TXT @ "v=spf1 include:_spf.google.com ~all"`
4. Set up **DKIM**: Admin Console > Apps > Google Workspace > Gmail > Authenticate email — add the generated TXT record to DNS
5. Add **DMARC**: `TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.org"`

### 3C. Email Accounts & Aliases

**Create accounts for roles, not just people:**

| Address | Purpose |
|---------|---------|
| `founder@` | Your primary org email |
| `hello@` or `info@` | General inquiries (alias to founder) |
| `press@` | Media inquiries (alias to founder) |
| `donate@` | Donation-related (alias to founder) |
| `dev@` | Developer/technical notifications (alias to founder) |
| `noreply@` | Transactional emails from the platform |

Start with one paid seat (yours) and use **aliases** for the rest. Aliases are free and route to your inbox.

### 3D. Shared Drives

Set up in Google Drive:

```
Nonprofit Shared Drive/
  01-Legal/           <- incorporation docs, EIN letter, bylaws, 501(c)(3)
  02-Finance/         <- bank statements, budgets, tax filings
  03-Brand/           <- logos, style guides, templates
  04-Content/         <- articles, media assets, editorial calendar
  05-Operations/      <- meeting notes, board minutes, policies
  06-Grants/          <- applications, reports, funder correspondence
```

---

## Phase 4: Banking & Payments

### 4A. Nonprofit Bank Account

**What you need to bring:**
- EIN confirmation letter (CP 575)
- Articles of Incorporation
- Bylaws
- Board resolution authorizing account opening (a simple signed document)
- Personal ID of the authorized signer

**Recommended banks:**
- **Mercury** — online-first, no fees, excellent API, good for tech-forward orgs
- **Chase for Nonprofits** — if you want a physical branch relationship
- **Local credit union** — often the most nonprofit-friendly terms

**Setup:**
1. Open a **checking account** (primary operating account)
2. Open a **savings account** (reserve fund / grant-restricted funds)
3. Get a **debit card** linked to checking
4. Enable **online banking** and store credentials in vault
5. Set up **two-person authorization** for transactions over a threshold (when you have a second signer)

### 4B. Payment Processor — Stripe

**Why Stripe:** Handles one-time donations, recurring subscriptions, and integrates with your web platform.

1. Create a Stripe account at stripe.com using your `founder@` email
2. Complete business verification:
   - Business type: Nonprofit
   - EIN number
   - Bank account for payouts
3. Set payout schedule (daily or weekly)
4. Store API keys (publishable + secret) in your password vault — these go into environment variables later

**Stripe fees:** 2.9% + $0.30 per transaction (standard). Apply for Stripe's discounted nonprofit rate if eligible.

### 4C. Donation Platforms (Supplementary)

| Platform | Use Case |
|----------|----------|
| **Cash App** | Quick peer-to-peer donations, low friction |
| **Venmo** | Same — popular with younger donors |
| **PayPal Giving Fund** | Shows up in PayPal's charity search |
| **GoFundMe Charity** | Campaign-based fundraising |

Keep Stripe as the primary processor on your website. Use these as supplementary channels with clear links on the `/support` page.

---

## Phase 5: Developer Infrastructure

### 5A. GitHub Organization

1. Create a GitHub organization at github.com/organizations/new
   - Use your `founder@` email
   - Org name: your nonprofit's name or abbreviation
2. Apply for **GitHub for Nonprofits** (through the Social Impact program) — gives you GitHub Team for free
3. Create your repositories:
   - `website` — primary web platform
   - `docs` — internal documentation (private)
   - `assets` — brand assets, design files
4. Set repository visibility defaults (private unless intentionally public)
5. Enable **branch protection** on `main`:
   - Require pull request reviews
   - Require status checks to pass
   - No force pushes

### 5B. Vercel Deployment

1. Sign up at vercel.com with your GitHub org account
2. Apply for **Vercel for Nonprofits** (sponsored open source / nonprofit tier)
3. Link your GitHub org
4. Import your website repository
5. Configure:
   - Production branch: `main`
   - Preview deployments: enabled for all PRs
   - Framework preset: Next.js

### 5C. Environment Variables & Secrets

**Where secrets live:**

| Secret | Where It's Stored | Where It's Used |
|--------|-------------------|-----------------|
| Stripe keys (secret) | Vercel env vars (encrypted) | Server-side API routes |
| Stripe keys (publishable) | Vercel env vars | Client-side checkout |
| Supabase URL + anon key | Vercel env vars | Client + server |
| Supabase service role key | Vercel env vars (encrypted, server only) | Server-side only |
| Database connection string | Vercel env vars (encrypted) | Migrations, server functions |
| Google API credentials | Vercel env vars (encrypted) | Email sending, analytics |

**Rules:**
- Never commit `.env` files to git — `.gitignore` must include `.env*`
- Use Vercel's environment variable UI, scoped to production / preview / development
- Rotate keys annually, or immediately if compromised
- Keep a copy of all secrets in Bitwarden under `Nonprofit / Developer`

See [env-vars.md](./env-vars.md) for the complete environment variable reference for this project.

### 5D. Supabase (Database & Auth)

1. Create a project at supabase.com using `founder@` email
2. Note your: Project URL, anon key, service role key, database connection string
3. Enable Row Level Security on all tables from day one
4. Set up email auth templates with your brand colors

---

## Phase 6: Account Separation & Access Tree

### 6A. Personal vs. Nonprofit Boundaries

```
Personal Accounts (your SSN, your email)
  - Personal bank account
  - Personal email
  - Personal GitHub account
  - Personal cloud storage

Nonprofit Accounts (EIN, org email)
  - Org bank account (Mercury/Chase)
  - Google Workspace (founder@yourdomain.org)
  - GitHub Organization (you're an owner via personal account)
  - Stripe (org email, org EIN)
  - Vercel (linked to GitHub org)
  - Supabase (org email)
  - Cloudflare (org email)
  - Domain registrar (org email)
```

**Key principle:** Your personal GitHub account is a *member* of the org — you don't create a separate GitHub account. But every *service account* (Stripe, Supabase, etc.) should use the org email.

### 6B. Role-Based Access (When You Add People)

| Role | Access Level |
|------|-------------|
| **Founder/ED** | Owner on all platforms |
| **Developer** | GitHub org member + Vercel viewer + Supabase read-only |
| **Content Editor** | CMS access only, no infrastructure |
| **Board Member** | Google Drive (01-Legal, 02-Finance, 05-Operations), no dev access |
| **Volunteer** | Scoped to specific projects, temporary access |

**When adding people:**
- Always use their own accounts (never share login credentials)
- Grant minimum necessary permissions
- Review access quarterly
- Remove access immediately when someone leaves

### 6C. Bitwarden Organization Vault (When Ready)

When you have a second person who needs credentials:
1. Upgrade Bitwarden to the **Organization** tier ($3/user/mo)
2. Create collections mirroring your folder structure
3. Share only what each role needs
4. Never share the master password — each person has their own account

---

## Phase 7: Data Organization & Security

### 7A. Local Folder Structure

```
Desktop/
  Projects/
    blackmalejournal/       <- git repo (website)
  GitHub/
    bmj-org/                <- other org repos
  OTHER/
    Nonprofit/
      Legal/                <- scanned documents, signed PDFs
      Finance/              <- invoices, receipts, statements
      Brand/                <- logo source files, fonts
      Credentials/          <- exported vault backups (encrypted)
```

### 7B. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Legal documents | `YYYY-MM-DD_description` | `2026-03-15_articles-of-incorporation.pdf` |
| Financial | `YYYY-MM_type` | `2026-03_bank-statement.pdf` |
| Brand assets | `asset-variant-size` | `logo-horizontal-1200px.png` |
| Meeting notes | `YYYY-MM-DD_meeting-type` | `2026-03-15_board-meeting.md` |

### 7C. Secrets Storage Summary

| Type | Primary Location | Backup Location |
|------|-----------------|-----------------|
| Passwords & API keys | Bitwarden vault | Encrypted export on external drive |
| Legal documents | Google Shared Drive | Local encrypted folder |
| Environment variables | Vercel dashboard | Bitwarden vault entry |
| Recovery codes (2FA) | Bitwarden secure notes | Printed, in physical safe |
| SSH keys | Local `~/.ssh/` | Bitwarden attachment |

---

## Phase 8: Backup Strategy

### 8A. What Gets Backed Up Where

| Data | Frequency | Destination | Tool |
|------|-----------|-------------|------|
| Google Workspace (Drive, email) | Daily, automated | Cloud archive | Google Vault (included in Workspace) or Backupify |
| Git repositories | Every push (automatic) | GitHub (primary), local clones | Git |
| Supabase database | Daily, automated | Supabase built-in backups + manual weekly export | Supabase dashboard / `pg_dump` |
| Local project files | Daily | External SSD | Windows File History or robocopy script |
| Bitwarden vault | Weekly export | Encrypted file on external drive | Bitwarden export (encrypted JSON) |
| Legal/financial documents | After any change | Google Drive + external drive | Manual |

### 8B. External Drive Setup

**Hardware:** 1TB+ external SSD (Samsung T7 or similar)

**Structure:**
```
ExternalDrive/
  Backups/
    Vault/             <- encrypted Bitwarden exports
    Database/          <- Supabase pg_dump exports
    Projects/          <- full repo mirrors
    Documents/         <- legal, financial copies
  Media/
    Brand-Archive/     <- high-res source files, fonts
```

**Schedule:**
- Keep the drive disconnected when not actively backing up (protects against ransomware)
- Run backups every Sunday evening
- Verify at least one backup monthly by restoring a test file

### 8C. Cloud Backup Separation

| Cloud Service | What It Holds | Why Separate |
|---------------|--------------|--------------|
| Google Drive | Day-to-day documents, collaboration | Working files, shared access |
| GitHub | Code, version history | Source of truth for all code |
| Vercel | Deployment artifacts | Auto-generated, no backup needed |
| Supabase | Database, auth, storage | Persistent data — needs its own backup plan |
| Bitwarden | Credentials | Isolated by design — never stored alongside other data |
| External Drive | Everything critical, offline | Disaster recovery, offline access |

---

## Dependency Chain

```
Password Manager (Phase 0)
    |
    v
Registered Address + Phone (1A, 1B)
    |
    v
State Incorporation (1C)
    |
    v
EIN (1D) -----------------------+
    |                            |
    v                            v
Domain (2A)              Bank Account (4A)
    |                            |
    v                            v
DNS / Cloudflare (2B)    Stripe (4B)
    |
    v
Google Workspace (3A-3D)
    |
    v
GitHub Org (5A)
    |
    v
Vercel (5B) + Supabase (5D)
    |
    v
Env Vars & Secrets (5C)
    |
    v
Access Tree (Phase 6)
    |
    v
Data Org & Backups (Phases 7-8)
```

Each phase stores its credentials in Bitwarden as you go. By the end, your vault is your single source of truth for every account, key, and recovery code the organization owns.
