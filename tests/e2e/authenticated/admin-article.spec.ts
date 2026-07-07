import { test, expect } from '@playwright/test';

test.describe('Admin article workflow', () => {
  test('creates a draft article and returns to the article desk', async ({ page }) => {
    const suffix = Date.now();
    const title = `E2E Draft ${suffix}`;

    await page.goto('/admin/articles/new');
    await expect(page.getByRole('heading', { name: /new article/i })).toBeVisible();

    await page.locator('#title').fill(title);
    await page.locator('#slug').fill(`e2e-draft-${suffix}`);
    await page.locator('#excerpt').fill('E2E automated excerpt.');
    await page.locator('#body').fill('E2E automated body for draft article.');

    await page.getByRole('button', { name: /create article/i }).click();

    await expect(page).toHaveURL(/\/admin\/articles$/);
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 20_000 });
  });
});
