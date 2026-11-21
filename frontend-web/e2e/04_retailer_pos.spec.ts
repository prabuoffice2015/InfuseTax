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
});
