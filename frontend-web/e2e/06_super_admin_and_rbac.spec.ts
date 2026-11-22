import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('06 - Super Admin & Strict RBAC Route Guards', () => {
  test('should display all 14 items in Super Admin left sidebar and NO top horizontal tabs', async ({ page }) => {
    await loginAs(page, 'superadmin');
    await expect(page).toHaveURL(/\/dashboard\/company/);

    const sidebar = page.locator('aside');
    await expect(sidebar.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Admin', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Retailer', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Customer', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Wallet Approval', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'GST Registration', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'GST Filing', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'IT Filing', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Reports', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Companies', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Tier 2 Pricing', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Announcements', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'White Labeling', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'WhatsApp Gateway', exact: true })).toBeVisible();

    // Verify top horizontal sub-navigation tabs bar is REMOVED from the main content
    const horizontalSubNav = page.locator('main').locator('button:has-text("WhatsApp Gateway")');
    await expect(horizontalSubNav).toHaveCount(0);
  });

  test('should land Admin on /dashboard/admin and activate Dashboard sidebar item', async ({ page }) => {
    await loginAs(page, 'distributor');
    await expect(page).toHaveURL(/\/dashboard\/admin/);

    const sidebar = page.locator('aside');
    const dashboardLink = sidebar.getByRole('link', { name: 'Dashboard', exact: true });
    await expect(dashboardLink).toBeVisible();

    // Check active styling (bg-blue-600) on active sidebar link
    const activeLink = sidebar.locator('a.bg-blue-600');
    await expect(activeLink).toContainText('Dashboard');
  });

  test('should block Admin from accessing /dashboard/company', async ({ page }) => {
    await loginAs(page, 'distributor');
    await page.goto('/dashboard/company');
    await expect(page).toHaveURL(/\/dashboard\/admin/);
  });

  test('should block Retailer from accessing /dashboard/company', async ({ page }) => {
    await loginAs(page, 'retailer');
    await page.goto('/dashboard/company');
    await expect(page).toHaveURL(/\/dashboard\/retailer/);
  });

  test('should block Customer from accessing /dashboard/company', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/dashboard/company');
    await expect(page).toHaveURL(/\/dashboard\/customer/);
  });

  test('should block Retailer from accessing /dashboard/admin', async ({ page }) => {
    await loginAs(page, 'retailer');
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/dashboard\/retailer/);
  });

  test('should block Customer from accessing /dashboard/admin', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/dashboard\/customer/);
  });

  test('should block Customer from accessing /dashboard/retailer', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/dashboard/retailer');
    await expect(page).toHaveURL(/\/dashboard\/customer/);
  });

  test('should display Assigned Retailer POS and allow mapping customer to retailer in Super Admin', async ({ page }) => {
    await loginAs(page, 'superadmin');
    await page.goto('/dashboard/company?tab=customers');
    await expect(page).toHaveURL(/\/dashboard\/company\?tab=customers/);

    // Verify Customer Directory header and Assigned Retailer POS column
    const directoryHeading = page.locator('text=/Customer Directory \\(Tier 4\\)/i');
    await expect(directoryHeading.first()).toBeVisible({ timeout: 5000 });

    const retailerCol = page.locator('th:has-text("Assigned Retailer POS")');
    await expect(retailerCol.first()).toBeVisible();

    // Click edit on first customer row if exists
    const editBtn = page.locator('button[title="Edit User Profile"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      // Verify Edit CUSTOMER Profile modal has "Assign Under Retailer POS"
      const modalHeading = page.locator('text=/Edit CUSTOMER Profile/i');
      await expect(modalHeading.first()).toBeVisible({ timeout: 5000 });

      const retailerDropdownLabel = page.locator('text=/Assign Under Retailer POS/i');
      await expect(retailerDropdownLabel.first()).toBeVisible();

      // Close modal
      const cancelBtn = page.locator('button:has-text("Cancel")');
      await cancelBtn.first().click();
    }
  });
});
