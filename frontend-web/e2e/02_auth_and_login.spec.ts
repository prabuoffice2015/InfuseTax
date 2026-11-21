import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-data';
import { loginAs } from './helpers/auth';

test.describe('02 - Authentication & Multi-Role Access Control', () => {
  test('should display validation error on invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    const identifierInput = page.locator('input[placeholder*="company.com" i], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await identifierInput.fill('invalid_user@taxpartner.in');
    await passwordInput.fill('WrongPassword@999');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify error notification / toast / message
    const errorMsg = page.locator('text=/invalid|error|failed/i');
    await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });
  });

  test('should authenticate Customer and redirect to /dashboard/customer', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(page).toHaveURL(/\/dashboard\/customer/);
    
    // Check Customer Client Portal heading / indicators
    const heading = page.locator('h1, h2, div').filter({ hasText: /Customer|Welcome|Portal|Filings/i });
    await expect(heading.first()).toBeVisible();
  });

  test('should authenticate Retailer and redirect to /dashboard/retailer', async ({ page }) => {
    await loginAs(page, 'retailer');
    await expect(page).toHaveURL(/\/dashboard\/retailer/);

    // Check Retailer POS heading / wallet indicator
    const walletText = page.locator('text=/Wallet|Balance|₹/i');
    await expect(walletText.first()).toBeVisible();
  });

  test('should authenticate Master Distributor and redirect to /dashboard/distributor', async ({ page }) => {
    await loginAs(page, 'distributor');
    await expect(page).toHaveURL(/\/dashboard\/distributor/);

    const distHeading = page.locator('text=/Distributor|Zonal|P2P/i');
    await expect(distHeading.first()).toBeVisible();
  });

  test('should authenticate Super Admin and redirect to /dashboard/company', async ({ page }) => {
    await loginAs(page, 'superadmin');
    await expect(page).toHaveURL(/\/dashboard\/company/);

    const adminHeading = page.locator('text=/Super Admin|Tenant|Company/i');
    await expect(adminHeading.first()).toBeVisible();
  });
});
