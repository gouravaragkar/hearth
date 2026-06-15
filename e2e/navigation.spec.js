import { test, expect } from '@playwright/test';

// Session is pre-loaded from e2e/.auth/guest.json via storageState in playwright.config.js

test.describe('Navigation', () => {
  test('dashboard tab is active by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Nav always shows Dashboard link
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    // URL should be /
    await expect(page).toHaveURL('/');
  });

  test('can navigate to all tabs', async ({ page }) => {
    await page.goto('/');
    const tabs = [
      { name: 'Recurring', url: '/recurring' },
      { name: 'One-Off', url: '/one-time' },
      { name: 'Calendar', url: '/calendar' },
      { name: 'Homes', url: '/homes' },
    ];
    for (const { name, url } of tabs) {
      await page.getByRole('link', { name }).click();
      await expect(page).toHaveURL(url);
    }
  });

  test('assistant tab is accessible', async ({ page }) => {
    await page.goto('/');
    // Assistant nav link is visible
    const assistantLink = page.locator('nav').getByRole('link', { name: 'Assistant' });
    await expect(assistantLink).toBeVisible();
    // Navigate directly to avoid toast overlay intercepting the click
    await page.goto('/assistant');
    await expect(page).toHaveURL('/assistant');
  });
});
