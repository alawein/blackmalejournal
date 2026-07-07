import fs from 'node:fs';
import path from 'node:path';
import { test as setup } from '@playwright/test';

const authDir = path.join(process.cwd(), '.auth');
const authFile = path.join(authDir, 'member.json');

setup('authenticate as member', async ({ page }) => {
  const email = process.env.E2E_MEMBER_EMAIL!;
  const password = process.env.E2E_MEMBER_PASSWORD!;
  fs.mkdirSync(authDir, { recursive: true });

  await page.goto('/login?next=/portal');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /^log in$/i }).click();
  await page.waitForURL(/\/portal$/u, { timeout: 45_000 });
  await page.context().storageState({ path: authFile });
});
