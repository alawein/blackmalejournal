import { test, expect } from '@playwright/test';

test.describe('Admin route guard', () => {
  test('redirects unauthenticated visitors to login with return path', async ({ page }) => {
    await page.goto('/admin');
    const u = new URL(page.url());
    expect(u.pathname).toBe('/login');
    expect(u.searchParams.get('redirect')).toBe('/admin');
  });

  test('new article deep link preserves redirect through login gate', async ({ page }) => {
    await page.goto('/admin/articles/new');
    const u = new URL(page.url());
    expect(u.pathname).toBe('/login');
    expect(u.searchParams.get('redirect')).toBe('/admin/articles/new');
  });
});
