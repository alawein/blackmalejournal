import { test, expect } from '@playwright/test';

// Runs as admin (storageState: .auth/admin.json)

test.describe('Admin panel', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin(\/|$)/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('members list loads', async ({ page }) => {
    await page.goto('/admin/members');
    await expect(page).toHaveURL(/\/admin\/members/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('subscribers list loads', async ({ page }) => {
    await page.goto('/admin/subscribers');
    await expect(page.locator('main')).toBeVisible();
  });

  test('messages list loads', async ({ page }) => {
    await page.goto('/admin/messages');
    await expect(page.locator('main')).toBeVisible();
  });

  test('creates a draft article and returns to article desk', async ({ page }) => {
    const suffix = Date.now();
    const title = `E2E Draft ${suffix}`;

    await page.goto('/admin/articles/new');
    await expect(page.getByRole('heading', { name: /new article/i })).toBeVisible();

    await page.locator('#title').fill(title);
    await page.locator('#slug').fill(`e2e-draft-${suffix}`);
    await page.locator('#excerpt').fill('E2E automated excerpt.');
    await page.locator('#body').fill('E2E automated body.');

    await page.getByRole('button', { name: /create article/i }).click();

    await expect(page).toHaveURL(/\/admin\/articles$/);
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 20_000 });
  });
});
