import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Company Bank Accounts & Dynamic UPI QR Configurations (Super Admin & Retailer)', () => {

  test('Super Admin configures Bank Accounts and UPI QR settings in DB, and Retailer sees them dynamically', async ({ page }) => {
    // -------------------------------------------------------------------------
    // STEP 1: Super Admin Login & Configure Bank Account and UPI Settings
    // -------------------------------------------------------------------------
    await loginAs(page, 'superadmin');
    await expect(page).toHaveURL(/\/dashboard\/company/);

    // Navigate to Bank & QR Settings tab via URL or Sidebar
    const bankTabLink = page.locator('a[href*="tab=bank-accounts"]');
    if (await bankTabLink.isVisible()) {
      await bankTabLink.click();
    } else {
      await page.goto('/dashboard/company?tab=bank-accounts');
    }
    await page.waitForLoadState('networkidle');

    // Verify Tab Header
    await expect(page.getByText('Company Bank Accounts & Dynamic UPI QR Desk')).toBeVisible();
    await expect(page.getByText('Configured Company Bank Accounts (DB Level)')).toBeVisible();

    // Verify existing database seeded accounts are rendered in the accounts table
    const table = page.locator('table');
    await expect(table.getByText('HDFC Bank').first()).toBeVisible();
    await expect(table.getByText('ICICI Bank').first()).toBeVisible();
    await expect(table.getByText('State Bank of India').first()).toBeVisible();

    // Add a new company bank account at database level
    const addAccountBtn = page.getByRole('button', { name: /Add Company Bank Account/i });
    await expect(addAccountBtn).toBeVisible();
    await addAccountBtn.click();

    // Fill Modal
    const modalHeading = page.getByRole('heading', { name: 'Add Company Bank Account' });
    await expect(modalHeading).toBeVisible();

    const addModal = page.locator('div.fixed').filter({ hasText: 'Add Company Bank Account' });
    await addModal.locator('input[placeholder*="e.g. HDFC Bank"]').fill('Federal Bank');
    await addModal.locator('input[placeholder*="e.g. 50200012345678"]').fill('123456789012');
    await addModal.locator('input[placeholder*="e.g. HDFC0001234"]').fill('FDRL0001234');
    await addModal.locator('input[placeholder*="Anna Nagar"]').fill('Alwarpet, Chennai');
    await addModal.locator('input[placeholder*="taxpartner.retail@icici"]').fill('taxpartner.federal@federal');

    // Submit Modal
    const submitAccountBtn = addModal.getByRole('button', { name: 'Add Account' });
    await submitAccountBtn.click();

    // Verify Toast and Table presence
    await expect(table.getByText(/Federal Bank/i).first()).toBeVisible({ timeout: 10000 });
    await expect(table.getByText('123456789012').first()).toBeVisible();
    await expect(table.getByText('IFSC: FDRL0001234').first()).toBeVisible();

    // Update UPI QR Settings (GPay / PhonePe handle)
    const upiForm = page.locator('form').filter({ hasText: /Primary UPI VPA/i });
    const vpaInput = upiForm.locator('input[placeholder*="taxpartner.retail@icici"]');
    await vpaInput.fill('taxpartner.gpay@icici');
    const saveUpiBtn = upiForm.getByRole('button', { name: /Save UPI QR Settings/i });
    await saveUpiBtn.click();
    await expect(page.getByText(/Dynamic UPI QR settings/i)).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------------------
    // STEP 2: Retailer Login & Verify Bank Account Dropdown & UPI Modal
    // -------------------------------------------------------------------------
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.context().clearCookies();
    await page.goto('/sign-in');
    await loginAs(page, 'retailer');
    await expect(page).toHaveURL(/\/dashboard\/retailer/);

    // Open Top-Up Modal via Navbar "+ Top Up" button
    const navbarTopUpBtn = page.locator('header button[title="Request Bank UTR Top-Up"]');
    await navbarTopUpBtn.click();

    // Verify Modal Heading
    await expect(page.getByText('Wallet Top-Up Request')).toBeVisible();
    await expect(page.getByText('Deposit to Company Bank & submit UTR')).toBeVisible();

    // Verify the newly created Federal Bank is in the dropdown
    const bankSelect = page.locator('select').filter({ hasText: /Federal Bank/i });
    await expect(bankSelect).toBeVisible();

    // Select the new Federal Bank account
    const federalOption = bankSelect.locator('option', { hasText: 'Federal Bank' }).first();
    const federalValue = await federalOption.getAttribute('value');
    await bankSelect.selectOption(federalValue || '');

    // Verify the dynamic Bank Account Details preview box reflects Federal Bank
    await expect(page.locator('span', { hasText: '123456789012' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'FDRL0001234' })).toBeVisible();
    await expect(page.getByText('Alwarpet, Chennai')).toBeVisible();
    await expect(page.locator('span', { hasText: 'taxpartner.federal@federal' })).toBeVisible();

    // Close Bank UTR Top-up Modal
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Now test Dynamic UPI QR Top-Up
    const upiTopUpBtn = page.getByRole('button', { name: /\+ Top Up Via UPI QR|Instant UPI Top-up/i }).first();
    await upiTopUpBtn.click();

    // Verify Dynamic UPI QR Top-Up Modal
    await expect(page.getByText('Dynamic UPI QR Top-Up')).toBeVisible();
    await expect(page.getByText('Instant Wallet Balance Credit (0% Fees)')).toBeVisible();

    // Verify the configured UPI VPA is shown
    await expect(page.getByText('VPA: taxpartner.gpay@icici')).toBeVisible({ timeout: 5000 });

    // Verify supported UPI apps row
    await expect(page.getByText('GPay').first()).toBeVisible();
    await expect(page.getByText('PhonePe').first()).toBeVisible();
    await expect(page.getByText('Paytm').first()).toBeVisible();

    // Simulate Payment Webhook Credit
    const paySimBtn = page.getByRole('button', { name: /I Have Paid/i });
    await paySimBtn.click();
    await expect(page.getByText('Payment Verified!')).toBeVisible({ timeout: 8000 });

    // -------------------------------------------------------------------------
    // STEP 3: Cleanup by Super Admin
    // -------------------------------------------------------------------------
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.context().clearCookies();
    await page.goto('/sign-in');
    await loginAs(page, 'superadmin');
    await page.goto('/dashboard/company?tab=bank-accounts');
    await page.waitForLoadState('networkidle');

    // Reset UPI VPA back to original
    const resetUpiForm = page.locator('form').filter({ hasText: /Primary UPI VPA/i });
    const vpaResetInput = resetUpiForm.locator('input[placeholder*="taxpartner.retail@icici"]');
    await vpaResetInput.fill('taxpartner.retail@icici');
    await resetUpiForm.getByRole('button', { name: /Save UPI QR Settings/i }).click();

    // Delete the temporary Federal Bank account
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    const federalRow = page.locator('tr', { hasText: 'Federal Bank' });
    const deleteBtn = federalRow.locator('button[title="Delete Bank Account"]');
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(page.getByText(/removed successfully/i)).toBeVisible({ timeout: 10000 });
    }
  });

});
