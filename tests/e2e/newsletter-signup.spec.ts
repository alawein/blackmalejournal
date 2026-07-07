import { test, expect } from '@playwright/test';

test.describe('Newsletter Signup', () => {
  test('footer has newsletter form', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('form[aria-label="Newsletter signup"]')).toBeVisible();
  });
});
