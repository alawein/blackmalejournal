import { test, expect } from '@playwright/test';

/** GitHub Actions E2E uses a non-resolvable placeholder host — signInWithPassword cannot run. */
const supabaseIsCiPlaceholder = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').includes(
  'placeholder.supabase.co',
);

const hasMemberE2eCredentials = Boolean(
  process.env.E2E_MEMBER_EMAIL?.trim() && process.env.E2E_MEMBER_PASSWORD?.trim(),
);

test.describe('Authentication', () => {
  test('valid login redirects to portal', async ({ page }) => {
    test.skip(
      supabaseIsCiPlaceholder,
      'Requires a real NEXT_PUBLIC_SUPABASE_URL (CI uses placeholder.supabase.co).',
    );
    test.skip(
      !hasMemberE2eCredentials,
      'Requires E2E_MEMBER_EMAIL and E2E_MEMBER_PASSWORD (e.g. GitHub Actions secrets or .env.local).',
    );
    await page.goto('/login');
    // Password form + magic-link form both use name="email" — target the password field (#email).
    await page.locator('#email').fill(process.env.E2E_MEMBER_EMAIL!);
    await page.locator('#password').fill(process.env.E2E_MEMBER_PASSWORD!);
    await page.getByRole('button', { name: /^log in$/i }).click();
    await expect(page).toHaveURL(/\/portal/, { timeout: 30_000 });
  });

  test('invalid credentials shows error', async ({ page }) => {
    test.skip(
      supabaseIsCiPlaceholder,
      'Requires a real NEXT_PUBLIC_SUPABASE_URL (CI uses placeholder.supabase.co).',
    );
    await page.goto('/login');
    await page.locator('#email').fill('nobody@bmj.test');
    await page.locator('#password').fill('wrongpassword');
    await page.getByRole('button', { name: /^log in$/i }).click();
    await expect(page).toHaveURL(/\/login\?[^#]*error=/, { timeout: 15_000 });
    await expect(
      page.getByText('Invalid email or password. Please try again.', { exact: true }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('signup page renders form fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});
