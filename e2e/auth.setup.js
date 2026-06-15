import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '.auth/guest.json');

setup('sign in as guest and create home', async ({ page }) => {
  // Sign in as guest
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto('/login');
  await page.waitForSelector('text=Try as Guest');
  await page.getByText('Try as Guest').click();
  await page.waitForSelector('text=Got it, continue as guest');
  await page.getByText('Got it, continue as guest').click();
  await page.waitForURL('/', { timeout: 30000 });
  await page.waitForLoadState('networkidle');

  // Create a home so expense tests can save data
  await page.goto('/homes');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByPlaceholder('e.g. Home Australia').fill('E2E Test Home');
  await page.getByRole('button', { name: 'Add Home' }).click();
  // Wait for home to be created and listed
  await expect(page.getByText('E2E Test Home')).toBeVisible({ timeout: 10000 });

  // Save auth + storage state
  await page.context().storageState({ path: authFile });
});
