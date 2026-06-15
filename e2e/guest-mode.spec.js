import { test, expect } from '@playwright/test';

// These tests check public pages and the sign-in flow.
// They intentionally do NOT use the pre-authenticated storageState.

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Guest Mode', () => {
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/HomeSpend/);
    await expect(page.getByRole('heading', { name: /Your home finances/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started Free' }).first()).toBeVisible();
  });

  test('can navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Sign in to continue')).toBeVisible();
    await expect(page.getByText('Continue with Google')).toBeVisible();
    await expect(page.getByText('Try as Guest')).toBeVisible();
  });

  test('guest mode sign in works', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('text=Try as Guest');
    await page.getByText('Try as Guest').click();
    await expect(page.getByText('👤 Guest mode')).toBeVisible();
    await page.getByText('Got it, continue as guest').click();
    await page.waitForURL('/', { timeout: 30000 });
    // After sign-in, user should see the guest banner (always present for guests)
    await expect(page.getByText('👤 Guest mode')).toBeVisible({ timeout: 15000 });
  });

  test('guest banner shows on dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('text=Try as Guest');
    await page.getByText('Try as Guest').click();
    await page.waitForSelector('text=Got it, continue as guest');
    await page.getByText('Got it, continue as guest').click();
    await page.waitForURL('/', { timeout: 30000 });
    await expect(page.getByText('👤 Guest mode')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/days remaining/)).toBeVisible();
  });

  test('privacy policy is accessible without login', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
  });

  test('changelog is accessible without login', async ({ page }) => {
    await page.goto('/changelog');
    await expect(page.getByRole('heading', { name: 'Release Notes' })).toBeVisible();
  });
});
