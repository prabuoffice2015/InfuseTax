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
});
