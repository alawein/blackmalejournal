import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test('renders all required fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('submits successfully and shows confirmation', async ({ page }) => {
    // CI uses placeholder Supabase/Resend — stub the API so we exercise client success UI.
    await page.route('**/api/contact', (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/contact');
    await page.locator('input[name="name"]').fill('E2E Test');
    await page.locator('input[name="email"]').fill('e2e@bmj.test');
    await page.locator('select[name="subject"]').selectOption('General Inquiry');
    await page.locator('textarea[name="message"]').fill('Automated E2E contact form submission.');

    await page.getByRole('button', { name: /send|submit/i }).click();

    await expect(page.getByText('Message Sent', { exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });
});
