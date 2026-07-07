import { test, expect } from '@playwright/test';

// Runs as premium member (storageState: .auth/premium.json)

test.describe('Premium member access', () => {
  test('can reach portal', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/\/portal/);
  });

  test('can access downloads', async ({ page }) => {
    await page.goto('/downloads');
    await expect(page.locator('main')).toBeVisible();
  });

  test('can access handbooks', async ({ page }) => {
    await page.goto('/handbooks');
    await expect(page.locator('main')).toBeVisible();
  });

  test('cannot access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/admin(\/|$)/);
  });
});
