# The Black Male Journal

Source code for an independent editorial platform, for developers who run or extend it.

It is built
with Next.js 16, TypeScript, Supabase, and Stripe, and includes a member portal and an administrator
CMS. The repository ships an article template and no published articles.

## Start

Use Node.js 22, matching CI:

```sh
npm ci
```

Copy the example environment file, fill in local values from the
[environment reference](docs/ops/env-vars.md), then start the dev server:

```sh
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. Content and authentication depend on Supabase; payment flows depend on
Stripe. Real provider configuration and production state require separate verification. Keep secrets
and real environment values out of Git. See the [developer guide](docs/DEVELOPER.md) for deeper
setup and [troubleshooting](docs/TROUBLESHOOTING.md) for known local issues.

## Files

- `src/app/`: public pages, authentication, member/admin areas, and API routes.
- `src/components/`, `src/lib/`: UI, content queries, access control, payments, email, SEO, and
  shared helpers.
- `src/styles/brand.css`, `tailwind.config.ts`: brand tokens and their opacity-compatible
  Tailwind mirrors.
- `supabase/`: database configuration, migrations, and seed SQL.
- `content/articles/`: articles as Markdown files, one per post. Only `_template.md` is included; copy
  it to add one. Set `ARTICLES_SOURCE=supabase` to read the database instead.
- `public/`: original logos, images, textures, and fonts; retain font licenses.
- `tests/`: Jest tests by feature and Playwright browser tests in `tests/e2e/`.
- `scripts/`: reusable verification, layout, inventory, and seed utilities.
- `docs/`: architecture, product reference, brand guidance, and operating procedures.
- `.github/`: CI workflows and templates.

The [architecture guide](docs/ARCHITECTURE.md) explains data flow, the
[product reference](docs/BMJ-SSOT.md) covers mission and product context, and
[CONTRIBUTING](docs/CONTRIBUTING.md) covers how to contribute.

## Checks

```sh
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run verify:ssot-bmj
npm run verify:docs-links
npm run verify:docs-frontmatter
```

The SSOT check validates canonical documents and source locations. Documentation checks validate
local links and required metadata. `npm run secrets:check` retains credential scanning;
`npm run test:e2e` runs Playwright. Authenticated browser projects require separate
admin/member/basic/premium account variables: see
[browser CI setup](docs/ops/playwright-e2e-github-actions.md).

Seed test accounts only into local/staging databases; `npm run check:no-test-users` is required
before production deployment. `scripts/seed-all.ts` and `scripts/seed.ts` use the Supabase
service-role credential, which must remain server-only.

## Operating guides

- [Environment variables](docs/ops/env-vars.md) and [external configuration](docs/DEFERRALS.md).
- [Publishing](docs/ops/publishing-sop.md), [member billing](docs/ops/member-billing-sop.md), and
  [inbox/subscriber operations](docs/ops/inbox-subscriber-sop.md).
- [Release order](docs/ops/release-sequence.md), [backup/restore](docs/ops/backup-restore.md), and
  [secret rotation](docs/ops/secret-rotation.md).
- [Chairman consistency](docs/ops/chairman-consistency-reference.md).
- [Brand rules](docs/brand/invariants.md), [visual identity](docs/brand/visual-ssot.md),
  [art direction](docs/brand/art-direction-spec.md), and
  [publication design](docs/brand/movement-literature-spec.md).

## License

Proprietary. All rights reserved. Third-party fonts and assets retain their licenses.
