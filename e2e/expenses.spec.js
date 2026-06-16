import { test, expect } from '@playwright/test';

// Session is pre-loaded from e2e/.auth/guest.json via storageState in playwright.config.js

async function signInAsGuest(page) {
  await page.goto('/login');
  await page.getByText('Try as Guest').click();
  await page.getByText('Got it, continue as guest').click();
  await page.waitForURL('/');
  // Wait for auto-created home to load
  await expect(page.getByText('My Home')).toBeVisible({ timeout: 15000 });
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
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add One-Time Expense' })).toBeVisible();
  });

  test('form validation shows errors for empty submission', async ({ page }) => {
    await page.getByRole('link', { name: 'One-Off' }).click();
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'Add Expense' }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('can add a one-time expense', async ({ page }) => {
    await page.getByText('One-Off').click();
    await page.getByText('Add').first().click();
    await expect(page.getByText('Add One-Time Expense')).toBeVisible();
    await page.getByPlaceholder('e.g. Rent, Netflix').fill('E2E Test Grocery');
    await page.getByPlaceholder('0.00').fill('50');
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Groceries' }).click();
    const today = new Date().toISOString().slice(0, 10);
    await page.locator('input[type="date"]').fill(today);
    await page.getByRole('button', { name: 'Add Expense' }).click();
    await expect(page.getByText('Add One-Time Expense')).not.toBeVisible({ timeout: 15000 });
    await page.getByText('One-Off').click();
    await expect(page.getByText('E2E Test Grocery')).toBeVisible({ timeout: 10000 });
  });

  test('can add a recurring expense', async ({ page }) => {
    await page.getByText('Recurring').click();
    await page.getByText('Add').first().click();
    await expect(page.getByText('Add Recurring Expense')).toBeVisible();
    await page.getByPlaceholder('e.g. Rent, Netflix').fill('E2E Test Rent');
    await page.getByPlaceholder('0.00').fill('1000');
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Housing' }).click();
    const today = new Date().toISOString().slice(0, 10);
    await page.locator('input[type="date"]').fill(today);
    await page.getByRole('button', { name: 'Add Expense' }).click();
    await expect(page.getByText('Add Recurring Expense')).not.toBeVisible({ timeout: 15000 });
    await page.getByText('Recurring').click();
    await expect(page.getByText('E2E Test Rent')).toBeVisible({ timeout: 10000 });
  });
});
