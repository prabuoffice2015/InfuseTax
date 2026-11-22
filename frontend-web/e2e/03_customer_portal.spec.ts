import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('03 - Customer Client Portal (Tier 4)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'customer');
  });

  test('should land on /dashboard/customer with verified customer branding', async ({ page }) => {
    // 1. Verify URL
    await expect(page).toHaveURL(/\/dashboard\/customer/);

    // 2. Verify Customer Client Portal banner
    const bannerTag = page.locator('text=/Customer Client Portal/i');
    await expect(bannerTag.first()).toBeVisible({ timeout: 10000 });

    const welcomeHeading = page.locator('h1').filter({ hasText: /Welcome/i });
    await expect(welcomeHeading.first()).toBeVisible();

    // 3. Verify Tier 4 Customer role pill in sidebar
    const customerBadge = page.locator('aside').getByText(/Customer/i);
    await expect(customerBadge.first()).toBeVisible();

    const tier4Indicator = page.locator('aside').getByText(/Tier 4/i);
    await expect(tier4Indicator.first()).toBeVisible();

    // 4. Verify AI Copilot Active badge is NOT visible anywhere
    const aiCopilotBadge = page.locator('text=/AI Copilot Active/i');
    await expect(aiCopilotBadge).toHaveCount(0);

    // 5. Verify Wallet Balance & Top-Up button are NOT visible for customer
    const topUpBtn = page.locator('header button').filter({ hasText: /Top Up/i });
    await expect(topUpBtn).toHaveCount(0);
  });

  test('should render exactly 3 customer navigation items in left sidebar', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('My Filings')).toBeVisible();
    await expect(sidebar.getByText('Receipts')).toBeVisible();

    // Verify removed old tabs are NOT in customer sidebar
    await expect(sidebar.getByText('My Credentials')).toHaveCount(0);
    await expect(sidebar.getByText('Document Vault')).toHaveCount(0);
  });

  test('should enforce strict zero-amount visibility (no commercial fees or pricing displayed)', async ({ page }) => {
    // Check main page content has zero commercial pricing / fee indicators
    const feeCol = page.locator('text=/Fee \\(₹\\)|Portal Fee|Wholesale Price|Margin/i');
    await expect(feeCol).toHaveCount(0);

    // Switch to My Filings tab
    const myFilingsTab = page.locator('aside').getByText('My Filings').first();
    await myFilingsTab.click();
    await page.waitForTimeout(500);

    // Verify no fee column in filings
    const filingsFeeCol = page.locator('text=/Fee \\(₹\\)|Portal Fee/i');
    await expect(filingsFeeCol).toHaveCount(0);
  });

  test('should provide Month Selector dropdown and Daily Invoice Upload capability', async ({ page }) => {
    const myFilingsTab = page.locator('aside').getByText('My Filings').first();
    await myFilingsTab.click();
    await page.waitForTimeout(500);

    // Month selector dropdown should be visible
    const monthSelect = page.locator('select');
    await expect(monthSelect.first()).toBeVisible({ timeout: 5000 });

    // Upload daily invoice button should be present
    const uploadBtn = page.locator('button').filter({ hasText: /Upload Daily Invoice/i });
    await expect(uploadBtn.first()).toBeVisible();

    // Click upload daily invoice to open modal
    await uploadBtn.first().click();
    await page.waitForTimeout(300);

    // Modal should appear
    const modalHeading = page.locator('text=/Upload Daily Invoice/i');
    await expect(modalHeading.first()).toBeVisible();

    // Close modal
    const cancelBtn = page.locator('button').filter({ hasText: /Cancel|✕/i });
    await cancelBtn.first().click();
  });

  test('should navigate to Receipts tab and display Admin-Approved receipts', async ({ page }) => {
    // Click Receipts tab in sidebar
    const receiptsTab = page.locator('aside').getByText('Receipts').first();
    await receiptsTab.click();
    await page.waitForTimeout(500);

    // Verify Receipts section header
    const receiptsHeading = page.locator('text=/Department Receipts & Verified Slips/i');
    await expect(receiptsHeading.first()).toBeVisible({ timeout: 5000 });

    // Verify verified receipt button / link or empty state notice
    const downloadReceipt = page.locator('text=/Download Department Receipt|View Filing Slip|View Slip|No verified receipts issued yet/i');
    await expect(downloadReceipt.first()).toBeVisible({ timeout: 5000 });
  });
});
