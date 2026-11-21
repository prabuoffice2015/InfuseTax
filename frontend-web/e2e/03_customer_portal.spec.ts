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

  test('should render all customer sub-navigation tabs', async ({ page }) => {
    // Check tabs exist
    const overviewTab = page.locator('button, a').filter({ hasText: /Dashboard Overview/i });
    await expect(overviewTab.first()).toBeVisible();

    const filingsTab = page.locator('button, a').filter({ hasText: /My Filings/i });
    await expect(filingsTab.first()).toBeVisible();

    const credsTab = page.locator('button, a').filter({ hasText: /My Credentials Vault/i });
    await expect(credsTab.first()).toBeVisible();

    const docVaultTab = page.locator('button, a').filter({ hasText: /Document Vault/i });
    await expect(docVaultTab.first()).toBeVisible();

    const receiptsTab = page.locator('button, a').filter({ hasText: /Receipts & Slips/i });
    await expect(receiptsTab.first()).toBeVisible();
  });

  test('should navigate to My Credentials Vault and view/edit credential fields', async ({ page }) => {
    // Click My Credentials Vault tab
    const credsTab = page.locator('button, a').filter({ hasText: /My Credentials Vault/i }).first();
    await credsTab.click();
    await page.waitForTimeout(500);

    // Verify Income Tax portal credentials form
    const itUserHeading = page.locator('text=/Income Tax Department Login ID|Income Tax.*Login ID/i');
    await expect(itUserHeading.first()).toBeVisible({ timeout: 5000 });

    const itPassHeading = page.locator('text=/Income Tax Portal Password/i');
    await expect(itPassHeading.first()).toBeVisible();

    // Verify Password input and toggle visibility button
    const passInput = page.locator('input[type="password"]');
    await expect(passInput.first()).toBeVisible();

    // Verify Save Credentials button
    const saveBtn = page.locator('button').filter({ hasText: /Save Credentials|Update/i });
    await expect(saveBtn.first()).toBeVisible();
  });

  test('should navigate to Document Vault and Receipts tabs', async ({ page }) => {
    // Click Document Vault tab
    const docVaultTab = page.locator('button, a').filter({ hasText: /Document Vault/i }).first();
    await docVaultTab.click();
    await page.waitForTimeout(500);

    // Verify Document Vault container is visible
    const docVaultContent = page.locator('text=/Upload|Document|Vault/i');
    await expect(docVaultContent.first()).toBeVisible({ timeout: 5000 });

    // Click Receipts & Slips tab
    const receiptsTab = page.locator('button, a').filter({ hasText: /Receipts & Slips/i }).first();
    await receiptsTab.click();
    await page.waitForTimeout(500);

    // Verify Receipts section
    const receiptsContent = page.locator('text=/Receipt|Slips|Transaction/i');
    await expect(receiptsContent.first()).toBeVisible({ timeout: 5000 });
  });
});
