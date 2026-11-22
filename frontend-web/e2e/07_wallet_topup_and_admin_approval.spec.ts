import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('07 - Wallet Top-Up Request & Admin Approval Flow', () => {
  test('should allow Retailer to submit wallet UTR top-up and Admin to approve with balance credit', async ({ page }) => {
    // -------------------------------------------------------------
    // Step 1: Retailer logs in and reads current wallet balance
    // -------------------------------------------------------------
    await loginAs(page, 'retailer');
    await expect(page).toHaveURL(/\/dashboard\/retailer/);

    const walletBalanceEl = page.locator('div').filter({ hasText: 'Wallet Balance' }).locator('text=/₹[0-9,]+(\.[0-9]{2})?/').first();
    await expect(walletBalanceEl).toBeVisible({ timeout: 10000 });
    const initialWalletText = await walletBalanceEl.innerText();
    const initialBalance = parseFloat(initialWalletText.replace(/[^0-9.]/g, '')) || 0;
    expect(initialBalance).toBeGreaterThan(0);

    // -------------------------------------------------------------
    // Step 2: Retailer opens Top-Up Modal and submits UTR request
    // -------------------------------------------------------------
    const topUpBtn = page.locator('button').filter({ hasText: /Top Up|\+ Top Up/i });
    await expect(topUpBtn.first()).toBeVisible({ timeout: 10000 });
    await topUpBtn.first().click();

    // Verify modal is open
    await expect(page.getByText('Wallet Top-Up Request')).toBeVisible({ timeout: 5000 });

    const testTopupAmount = 5000;
    const testUtr = `UTR-PW-${Date.now()}`;

    // Fill Top-Up form
    await page.locator('input[placeholder="e.g. 10000"]').fill(testTopupAmount.toString());
    await page.locator('input[placeholder="e.g. 423512349876"]').fill(testUtr);

    // Submit Top-Up Request
    const submitBtn = page.locator('button').filter({ hasText: /Submit UTR for Approval/i });
    await submitBtn.click();

    // Verify confirmation message
    await expect(page.getByText(/Top-Up Request Submitted!/i)).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // Step 3: Admin logs in and accesses Wallet Approvals
    // -------------------------------------------------------------
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.context().clearCookies();
    await page.goto('/sign-in');
    await loginAs(page, 'distributor');
    await expect(page).toHaveURL(/\/dashboard\/(admin|distributor)/);

    // Click "Wallet Approval" in Admin sidebar
    const walletApprovalNav = page.locator('aside').getByText('Wallet Approval');
    await expect(walletApprovalNav).toBeVisible({ timeout: 10000 });
    await walletApprovalNav.click();
    await page.waitForLoadState('networkidle');

    // Verify we are on Wallet Approvals desk
    await expect(page.getByText('Downline Wallet Float Approvals (T3 & T4)')).toBeVisible({ timeout: 10000 });

    // Ensure Pending tab is active
    const pendingTab = page.locator('button').filter({ hasText: /^pending/i });
    await pendingTab.click();

    // Verify the newly created UTR is displayed in the pending table
    const requestRow = page.locator('tr').filter({ hasText: testUtr });
    await expect(requestRow).toBeVisible({ timeout: 15000 });
    await expect(requestRow).toContainText('₹5,000');

    // -------------------------------------------------------------
    // Step 4: Admin Approves the UTR request
    // -------------------------------------------------------------
    const approveBtn = requestRow.locator('button').filter({ hasText: /Approve & Credit/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Verify feedback toast or row removal from pending
    await expect(
      page.getByText(/approved and downline outlet credited/i).or(page.getByText(/approved/i))
    ).toBeVisible({ timeout: 10000 });

    // Verify request now appears under Approved tab
    const approvedTab = page.locator('button').filter({ hasText: /^approved/i });
    await approvedTab.click();
    await expect(page.locator('tr').filter({ hasText: testUtr })).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // Step 5: Retailer logs back in and verifies credited balance
    // -------------------------------------------------------------
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.context().clearCookies();
    await page.goto('/sign-in');
    await loginAs(page, 'retailer');
    await expect(page).toHaveURL(/\/dashboard\/retailer/);

    const updatedWalletBalanceEl = page.locator('div').filter({ hasText: 'Wallet Balance' }).locator('text=/₹[0-9,]+(\.[0-9]{2})?/').first();
    await expect(updatedWalletBalanceEl).toBeVisible({ timeout: 10000 });
    const updatedWalletText = await updatedWalletBalanceEl.innerText();
    const updatedBalance = parseFloat(updatedWalletText.replace(/[^0-9.]/g, '')) || 0;

    // The updated balance should reflect the +₹5,000 credit
    expect(updatedBalance).toBeGreaterThanOrEqual(initialBalance + testTopupAmount);
  });

  test('should display GST Filing desk without database column errors', async ({ page }) => {
    await loginAs(page, 'retailer');
    await page.goto('/dashboard/retailer?desk=gstr_filing');
    await page.waitForLoadState('networkidle');

    // Verify GST Filing desk heading
    await expect(page.getByText('Filing GST Return for Customer:').first()).toBeVisible({ timeout: 10000 });

    // Verify there are no SQL error banners
    const errorBanner = page.locator('text=/SQLSTATE|column.*does not exist/i');
    await expect(errorBanner).toHaveCount(0);
  });
});
