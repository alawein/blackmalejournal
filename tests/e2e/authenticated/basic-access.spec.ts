import { test, expect } from '@playwright/test';

// Runs as basic member (storageState: .auth/basic.json)

test.describe('Basic member access', () => {
  test('can reach portal', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/\/portal/);
  });

  test('can access briefings archive', async ({ page }) => {
    await page.goto('/briefings');
    await expect(page.locator('main')).toBeVisible();
  });

  test('cannot access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/admin(\/|$)/);
  });
});
