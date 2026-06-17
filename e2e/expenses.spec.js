import { test, expect } from '@playwright/test';

// Session is pre-loaded from e2e/.auth/guest.json via storageState in playwright.config.js

async function signInAsGuest(page) {
  await page.goto('/login');
  await page.getByText('Try as Guest').click();
  await page.getByText('Got it, continue as guest').click();
  await page.waitForURL('/');
  // Wait for HomeSwitcher to show the auto-created home
  await expect(page.locator('button').filter({ hasText: 'My Home' }).first()).toBeVisible({ timeout: 15000 });
}

test.describe('Expenses', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsGuest(page);
  });

  test('can navigate to recurring expenses tab', async ({ page }) => {
    await page.getByRole('link', { name: 'Recurring' }).click();
    await expect(page.getByRole('heading', { name: 'Recurring Expenses' })).toBeVisible();
  });

  test('can navigate to one-time expenses tab', async ({ page }) => {
    await page.getByRole('link', { name: 'One-Off' }).click();
    await expect(page.getByRole('heading', { name: 'One-Time Expenses' })).toBeVisible();
  });

  test('can open add expense modal', async ({ page }) => {
    await page.getByRole('link', { name: 'One-Off' }).click();
    await page.locator('[data-testid="add-onetime-btn"]').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
  });

  test('can add a one-time expense', async ({ page }) => {
    await page.getByRole('link', { name: 'One-Off' }).click();
    await page.locator('[data-testid="add-onetime-btn"]').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await dialog.getByPlaceholder('e.g. Rent, Netflix').fill('E2E Test Grocery');
    await dialog.getByPlaceholder('0.00').fill('50');
    const today = new Date().toISOString().slice(0, 10);
    await dialog.locator('input[type="date"]').fill(today);
    await dialog.getByRole('button', { name: 'Add Expense' }).click();
    await page.waitForTimeout(2000);
    await page.keyboard.press('Escape');
    await expect(page.getByText('E2E Test Grocery')).toBeVisible({ timeout: 10000 });
  });

  test('can add a recurring expense', async ({ page }) => {
    await page.getByRole('link', { name: 'Recurring' }).click();
    await page.locator('[data-testid="add-recurring-btn"]').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await dialog.getByPlaceholder('e.g. Rent, Netflix').fill('E2E Test Rent');
    await dialog.getByPlaceholder('0.00').fill('1000');
    const today = new Date().toISOString().slice(0, 10);
    await dialog.locator('input[type="date"]').fill(today);
    await dialog.getByRole('button', { name: 'Add Expense' }).click();
    await page.waitForTimeout(2000);
    await page.keyboard.press('Escape');
    await expect(page.getByText('E2E Test Rent')).toBeVisible({ timeout: 10000 });
  });
});
