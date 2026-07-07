import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const have = (email: string | undefined, pass: string | undefined) =>
  Boolean(email?.trim() && pass?.trim());

const adminAuth   = have(process.env.E2E_ADMIN_EMAIL,   process.env.E2E_ADMIN_PASSWORD);
const memberAuth  = have(process.env.E2E_MEMBER_EMAIL,  process.env.E2E_MEMBER_PASSWORD);
const basicAuth   = have(process.env.E2E_BASIC_EMAIL,   process.env.E2E_BASIC_PASSWORD);
const premiumAuth = have(process.env.E2E_PREMIUM_EMAIL, process.env.E2E_PREMIUM_PASSWORD);

const auth = (name: string) => path.join(process.cwd(), '.auth', `${name}.json`);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // ── Unauthenticated ────────────────────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: 'authenticated/**',
    },

    // ── Admin ──────────────────────────────────────────────────────────────
    ...(adminAuth ? [
      { name: 'setup-admin', testMatch: 'authenticated/admin.setup.ts' },
      {
        name: 'chromium-admin',
        dependencies: ['setup-admin'],
        testMatch: 'authenticated/admin-*.spec.ts',
        use: { ...devices['Desktop Chrome'], storageState: auth('admin') },
      },
    ] : []),

    // ── Free member ────────────────────────────────────────────────────────
    ...(memberAuth ? [
      { name: 'setup-member', testMatch: 'authenticated/member.setup.ts' },
      {
        name: 'chromium-member',
        dependencies: ['setup-member'],
        testMatch: 'authenticated/member-*.spec.ts',
        use: { ...devices['Desktop Chrome'], storageState: auth('member') },
      },
    ] : []),

    // ── Basic member ───────────────────────────────────────────────────────
    ...(basicAuth ? [
      { name: 'setup-basic', testMatch: 'authenticated/basic.setup.ts' },
      {
        name: 'chromium-basic',
        dependencies: ['setup-basic'],
        testMatch: 'authenticated/basic-*.spec.ts',
        use: { ...devices['Desktop Chrome'], storageState: auth('basic') },
      },
    ] : []),

    // ── Premium member ─────────────────────────────────────────────────────
    ...(premiumAuth ? [
      { name: 'setup-premium', testMatch: 'authenticated/premium.setup.ts' },
      {
        name: 'chromium-premium',
        dependencies: ['setup-premium'],
        testMatch: 'authenticated/premium-*.spec.ts',
        use: { ...devices['Desktop Chrome'], storageState: auth('premium') },
      },
    ] : []),
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
