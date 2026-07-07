import { test, expect } from '@playwright/test';

test.describe('Member portal', () => {
  test('dashboard shows welcome heading', async ({ page }) => {
    await page.goto('/portal');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/welcome back/i);
    await expect(page.getByText(/member portal/i).first()).toBeVisible();
  });

  test('saved bookmarks page loads', async ({ page }) => {
    await page.goto('/portal/bookmarks');
    await expect(page.getByRole('heading', { level: 1, name: /^saved$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^portal$/i })).toBeVisible();
  });
});
