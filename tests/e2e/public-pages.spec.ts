import { test, expect } from '@playwright/test';

// Runs unauthenticated — verifies public pages render correctly.

test.describe('Public pages', () => {
  test('homepage loads with brand heading', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Black Male Journal/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('articles listing loads', async ({ page }) => {
    await page.goto('/articles');
    await expect(page).toHaveURL('/articles');
    await expect(page.locator('main')).toBeVisible();
  });

  test('briefings listing loads', async ({ page }) => {
    await page.goto('/briefings');
    await expect(page.locator('main')).toBeVisible();
  });

  test('academy listing loads', async ({ page }) => {
    await page.goto('/academy');
    await expect(page.locator('main')).toBeVisible();
  });

  test('handbooks listing loads', async ({ page }) => {
    await page.goto('/handbooks');
    await expect(page.locator('main')).toBeVisible();
  });

  test('downloads listing loads', async ({ page }) => {
    await page.goto('/downloads');
    await expect(page.locator('main')).toBeVisible();
  });

  test('blog (dispatches) listing loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('main')).toBeVisible();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('main')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('main')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('main')).toBeVisible();
  });

  test('search page loads', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('main')).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('main')).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('main')).toBeVisible();
  });
});
