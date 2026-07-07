import { test, expect } from '@playwright/test';

test.describe('Article Navigation', () => {
  test('articles page loads', async ({ page }) => {
    await page.goto('/articles');
    await expect(page).toHaveTitle(/Articles/i);
  });
});
