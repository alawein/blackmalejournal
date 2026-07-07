# Tests

The Black Male Journal uses **Jest** (jsdom) for unit and integration tests and **Playwright** for end-to-end browser tests.

## Layout

| Directory | Purpose |
|-----------|---------|
| `tests/actions/` | Server actions (e.g. auth) |
| `tests/admin/` | Admin CRUD and messaging flows |
| `tests/api/` | `src/app/api` route handlers |
| `tests/components/` | React components |
| `tests/e2e/` | Playwright specs (see below) |
| `tests/helpers/` | Shared mocks (`supabase-mock`, `stripe-mock`, fixtures) |
| `tests/lib/` | `src/lib` utilities, queries, SEO, email |
| `tests/metadata/` | `robots.ts`, `sitemap.ts` |
| `tests/middleware/` | `proxy.ts` / auth routing behavior |
| `tests/pages/` | App Router pages and layouts |
| `tests/portal/` | Portal-specific server actions |
| `setup.ts` | Jest environment setup |

## Commands

Full workflow: [docs/DEVELOPER.md](../docs/DEVELOPER.md) — *Testing*.

| Command | Purpose |
|---------|---------|
| `npm test` | Full Jest suite |
| `npm run test:watch` | Jest watch mode |
| `npm run test:counts` | Print suite/test totals (for `README.md` / `CLAUDE.md`) |
| `npm run test:e2e` | Playwright (Chromium) |

## Playwright layout

Unauthenticated specs run in the default `chromium` project. Authenticated specs require env vars — each tier is independent.

| Spec pattern | Project | Env vars required |
|---|---|---|
| `tests/e2e/*.spec.ts` | `chromium` | none |
| `authenticated/admin-*.spec.ts` | `chromium-admin` | `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` |
| `authenticated/member-*.spec.ts` | `chromium-member` | `E2E_MEMBER_EMAIL`, `E2E_MEMBER_PASSWORD` |
| `authenticated/basic-*.spec.ts` | `chromium-basic` | `E2E_BASIC_EMAIL`, `E2E_BASIC_PASSWORD` |
| `authenticated/premium-*.spec.ts` | `chromium-premium` | `E2E_PREMIUM_EMAIL`, `E2E_PREMIUM_PASSWORD` |

`auth-flow.spec.ts` exercises login when `NEXT_PUBLIC_SUPABASE_URL` is not the CI placeholder and member credentials are set. **Full wiring guide:** [docs/ops/playwright-e2e-github-actions.md](../docs/ops/playwright-e2e-github-actions.md). Variable list: [docs/ops/env-vars.md](../docs/ops/env-vars.md) (GitHub Actions subsection).

**Test accounts:** seed with `supabase/seed-test-users.sql` (local/staging only). See `.env.example` for credential defaults. Run `npm run check:no-test-users` before any production deploy.

---

## Playwright layout (legacy notes)

- **Default project (`chromium`):** all specs except `tests/e2e/authenticated/**` (smoke, guards, public flows).
- **Authenticated admin:** when `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` are set, Playwright adds `setup-admin` and `chromium-admin`, which runs `admin-article.spec.ts` with `.auth/admin.json`.
- **Authenticated member:** when `E2E_MEMBER_EMAIL` and `E2E_MEMBER_PASSWORD` are set, Playwright adds `setup-member` and `chromium-member` for `portal.spec.ts` with `.auth/member.json`. Prefer a **different** Supabase user than the admin E2E account when both are enabled.

See [docs/ops/env-vars.md](../docs/ops/env-vars.md) (Local E2E).

## Conventions

- Test files: `*.test.ts` or `*.test.tsx` (see [docs/CONTRIBUTING.md](../docs/CONTRIBUTING.md)).
- Mirror `src/` concerns where practical (`tests/components/` ↔ `src/components/`).
