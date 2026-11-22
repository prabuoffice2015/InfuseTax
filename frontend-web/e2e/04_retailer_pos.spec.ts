import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('04 - Retailer POS Desk & Wallet Controls', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'retailer');
  });

  test('should display Retailer POS desk with wallet balance and top-up trigger', async ({ page }) => {
    // 1. Verify Retailer Wallet balance is displayed
    const walletBalance = page.locator('text=/WALLET BALANCE|₹/i');
    await expect(walletBalance.first()).toBeVisible({ timeout: 10000 });

    // 2. Verify Top Up button exists
    const topUpBtn = page.locator('button').filter({ hasText: /Top Up|Recharge|\+ Top Up/i });
    await expect(topUpBtn.first()).toBeVisible();

    // 3. Click Top Up button and verify modal opens
    await topUpBtn.first().click();
    const modalTitle = page.locator('text=/Top-Up|UTR|Deposit/i');
    await expect(modalTitle.first()).toBeVisible({ timeout: 5000 });

    // Close modal
    const closeBtn = page.locator('button').filter({ hasText: /Close|Cancel|✕/i });
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
    } else {
      await page.keyboard.press('Escape');
    }
  });

  test('should verify Scanned Color Copy checklist does NOT contain Auto-Fill demo button', async ({ page }) => {
    // Verify "Auto-Fill All Slots" demo button is REMOVED
    const autoFillBtn = page.locator('button').filter({ hasText: /Auto-Fill All Slots/i });
    await expect(autoFillBtn).toHaveCount(0);
  });

  test('should display all 10 counter service and management items in left side menu', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Wallet')).toBeVisible();
    await expect(sidebar.getByText('Customer')).toBeVisible();
    await expect(sidebar.getByText('GST Filing')).toBeVisible();
    await expect(sidebar.getByText('GST Registration')).toBeVisible();
    await expect(sidebar.getByText('IT Filing')).toBeVisible();
    await expect(sidebar.getByText('Eseva Services')).toBeVisible();
    await expect(sidebar.getByText('Pan Card')).toBeVisible();
    await expect(sidebar.getByText('Passport')).toBeVisible();
    await expect(sidebar.getByText('Report')).toBeVisible();
  });

  test('should navigate to Customer desk and open Add Customer modal', async ({ page }) => {
    const sidebar = page.locator('aside');
    await sidebar.getByText('Customer').click();
    await page.waitForTimeout(500);

    await expect(page).toHaveURL(/desk=customers/);
    const addCustBtn = page.locator('button').filter({ hasText: /Add Customer/i });
    await expect(addCustBtn.first()).toBeVisible();

    await addCustBtn.first().click();
    const modalHeading = page.locator('text=/Add New Customer/i');
    await expect(modalHeading.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display Month Dropdown and Customer Invoices Compilation in IT Filing desk', async ({ page }) => {
    const sidebar = page.locator('aside');
    await sidebar.getByText('IT Filing').click();
    await page.waitForTimeout(500);

    await expect(page).toHaveURL(/desk=itr/);

    // Switch to Monthly Mode
    const monthlyBtn = page.locator('button').filter({ hasText: /Monthly Invoices/i });
    if (await monthlyBtn.count() > 0) {
      await monthlyBtn.first().click();
      await page.waitForTimeout(300);
    }

    // Verify Month selector
    const monthSelect = page.locator('select');
    await expect(monthSelect.first()).toBeVisible({ timeout: 5000 });

    // Verify Attach Customer Invoice button
    const attachBtn = page.locator('button').filter({ hasText: /Attach Customer Invoice/i });
    await expect(attachBtn.first()).toBeVisible();
  });
});
