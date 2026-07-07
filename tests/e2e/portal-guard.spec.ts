import { test, expect } from '@playwright/test';

test.describe('Portal Guard', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/\/login/);
  });
});
