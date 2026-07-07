import { test, expect } from '@playwright/test';

test.describe('Search page', () => {
  test('loads and submits a query', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByRole('heading', { name: /^search$/i })).toBeVisible();

    await page.getByRole('searchbox', { name: /search/i }).fill('health');
    await page.getByRole('button', { name: /^search$/i }).click();

    await expect(page).toHaveURL(/[?&]q=/);
  });
});
