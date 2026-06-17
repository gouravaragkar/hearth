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

  test('can open and fill one-time expense form', async ({ page }) => {
    await page.getByRole('link', { name: 'One-Off' }).click();
    await page.locator('[data-testid="add-onetime-btn"]').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(dialog.getByText('Add One-Time Expense')).toBeVisible();
    await dialog.getByPlaceholder('e.g. Rent, Netflix').fill('E2E Test Grocery');
    await dialog.getByPlaceholder('0.00').fill('50');
    const today = new Date().toISOString().slice(0, 10);
    await dialog.locator('input[type="date"]').fill(today);
    await expect(dialog.getByPlaceholder('e.g. Rent, Netflix')).toHaveValue('E2E Test Grocery');
    await expect(dialog.getByPlaceholder('0.00')).toHaveValue('50');
    await expect(dialog.getByRole('button', { name: 'Add Expense' })).toBeEnabled();
  });

  test('can open and fill recurring expense form', async ({ page }) => {
    await page.getByRole('link', { name: 'Recurring' }).click();
    await page.locator('[data-testid="add-recurring-btn"]').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(dialog.getByText('Add Recurring Expense')).toBeVisible();
    await dialog.getByPlaceholder('e.g. Rent, Netflix').fill('E2E Test Rent');
    await dialog.getByPlaceholder('0.00').fill('1000');
    const today = new Date().toISOString().slice(0, 10);
    await dialog.locator('input[type="date"]').fill(today);
    await expect(dialog.getByPlaceholder('e.g. Rent, Netflix')).toHaveValue('E2E Test Rent');
    await expect(dialog.getByPlaceholder('0.00')).toHaveValue('1000');
    await expect(dialog.getByRole('button', { name: 'Add Expense' })).toBeEnabled();
  });
});
