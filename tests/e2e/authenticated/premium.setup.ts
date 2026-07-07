import fs from 'node:fs';
import path from 'node:path';
import { test as setup } from '@playwright/test';

const authFile = path.join(process.cwd(), '.auth', 'premium.json');

setup('authenticate as premium member', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.goto('/login?next=/portal');
  await page.locator('input[name="email"]').fill(process.env.E2E_PREMIUM_EMAIL!);
  await page.locator('input[name="password"]').fill(process.env.E2E_PREMIUM_PASSWORD!);
  await page.getByRole('button', { name: /^log in$/i }).click();
  await page.waitForURL(/\/portal/, { timeout: 45_000 });
  await page.context().storageState({ path: authFile });
});
