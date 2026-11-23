import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('08 - Monthly GST Return Lock & Admin Service Approvals Flow', () => {

  test('should execute complete workflow: Retailer submits monthly return -> Customer month locked -> Admin lists with wallet fee & approves', async ({ page }) => {
    // Automatically accept any browser confirmation dialogs (e.g. window.confirm)
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    const testMonth = '2026-11';

    // -------------------------------------------------------------------------
    // Step 1: Retailer logs in and navigates to GST Filing desk
    // -------------------------------------------------------------------------
    await loginAs(page, 'retailer');
    await expect(page).toHaveURL(/\/dashboard\/retailer/);

    const gstFilingNav = page.locator('aside').getByText('GST Filing');
    await expect(gstFilingNav).toBeVisible({ timeout: 10000 });
    await gstFilingNav.click();
    await page.waitForLoadState('networkidle');

    // Select customer Ligadesshwaren p (Customer) from customer dropdown
    const customerSelect = page.locator('select').filter({ hasText: /Choose Customer/i });
    await expect(customerSelect).toBeVisible({ timeout: 10000 });
    const optionVal = await customerSelect.locator('option').filter({ hasText: /Ligadesshwaren/i }).getAttribute('value');
    if (optionVal) await customerSelect.selectOption(optionVal);
    await page.waitForTimeout(1000);

    // Select November 2026 from Return Month dropdown
    const monthSelect = page.locator('select').filter({ hasText: /November 2026/i });
    await expect(monthSelect).toBeVisible({ timeout: 10000 });
    await monthSelect.selectOption(testMonth);
    await page.waitForTimeout(1500);

    // Check if return was already submitted or submit it now
    const alreadySubmitted = await page.getByText(/Monthly GST Return for November 2026 Under Admin Review/i).isVisible();

    if (!alreadySubmitted) {
      // Fill GSTR return form
      const gstinInput = page.locator('input[placeholder*="GSTIN" i], input[maxlength="15"]').first();
      if (await gstinInput.isVisible()) {
        await gstinInput.fill('33AABCT9981K1Z2');
      }

      // Submit Monthly Return
      const submitReturnBtn = page.locator('button').filter({ hasText: /Submit Monthly GST Return/i });
      await expect(submitReturnBtn).toBeVisible({ timeout: 10000 });
      await submitReturnBtn.click();

      // Verify review banner
      await expect(
        page.getByText(/Monthly GST Return for November 2026 Under Admin Review/i)
      ).toBeVisible({ timeout: 15000 });
    }

    // Verify Month Locked badge is shown on Retailer desk
    await expect(page.getByText(/Month Locked \(Return Submitted\)/i)).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------------------
    // Step 2: Customer (Sailesh) logs in and checks that Month is Locked
    // -------------------------------------------------------------------------
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.context().clearCookies();
    await page.goto('/sign-in');

    await loginAs(page, 'sailesh');
    await expect(page).toHaveURL(/\/dashboard\/customer/);

    // Click "Manage Monthly Invoices" button to open the invoices desk
    const manageInvoicesBtn = page.locator('button').filter({ hasText: /Manage Monthly Invoices/i });
    if (await manageInvoicesBtn.isVisible()) {
      await manageInvoicesBtn.click();
    } else {
      await page.locator('aside').getByText('My Filings').click();
    }
    await page.waitForTimeout(1000);

    // Verify GST Daily Invoices Desk is present
    await expect(page.getByText('GST Daily Invoices Desk (Month-Wise)')).toBeVisible({ timeout: 10000 });

    // Select test month (November 2026) from customer month selector
    const custMonthSelect = page.locator('select').filter({ hasText: /November 2026/i });
    await expect(custMonthSelect).toBeVisible({ timeout: 10000 });
    await custMonthSelect.selectOption(testMonth);
    await page.waitForTimeout(1500);

    // Verify Customer sees Under Review / Submitted banner
    await expect(page.getByText(/Monthly GST Return for November 2026 Submitted/i)).toBeVisible({ timeout: 10000 });

    // Verify Customer sees "Month Locked (Return Submitted)" badge
    await expect(page.getByText(/Month Locked \(Return Submitted\)/i)).toBeVisible({ timeout: 10000 });

    // Verify "+ Upload Daily Invoice" is NOT visible for customer
    await expect(page.getByRole('button', { name: '+ Upload Daily Invoice' })).not.toBeVisible();

    // Verify direct upload API call is rejected with HTTP 422
    const directApiUploadResult = await page.evaluate(async (month) => {
      const token = localStorage.getItem('infusetax_jwt_token') || 
                    document.cookie.split('; ').find(row => row.startsWith('infusetax_token='))?.split('=')[1] || '';
      const res = await fetch('/api/v1/customer/invoices/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          month: month,
          invoice_date: '2026-11-23',
          invoice_title: 'Blocked Daily Invoice',
          invoice_number: 'INV-BLOCKED-99',
          file_url: 'https://example.com/blocked_invoice.pdf'
        })
      });
      const data = await res.json();
      return { status: res.status, data };
    }, testMonth);

    expect(directApiUploadResult.status).toBe(422);
    expect(directApiUploadResult.data.message).toContain('already been submitted');

    // -------------------------------------------------------------------------
    // Step 3: Admin logs in, views All Service Approvals with Wallet Fee
    // -------------------------------------------------------------------------
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.context().clearCookies();
    await page.goto('/sign-in');

    await loginAs(page, 'distributor');
    await expect(page).toHaveURL(/\/dashboard\/(admin|distributor)/);

    // Click "All Service Approvals" in Admin sidebar
    const allApprovalsNav = page.locator('aside').getByText('All Service Approvals');
    await expect(allApprovalsNav).toBeVisible({ timeout: 10000 });
    await allApprovalsNav.click();
    await page.waitForLoadState('networkidle');

    // Verify Header
    await expect(page.getByText('All Service Approvals (Network Submissions)')).toBeVisible({ timeout: 10000 });

    // Verify Table Headers
    await expect(page.getByText('ARN / Ref')).toBeVisible();
    await expect(page.getByText('Customer / Client')).toBeVisible();
    await expect(page.getByText('Service & Constitution')).toBeVisible();
    await expect(page.getByText('Retailer / Submitter')).toBeVisible();
    await expect(page.getByText('Fee (₹)')).toBeVisible();

    // Locate the row for our submitted Monthly GST Return
    const monthlyReturnRow = page.locator('tr').filter({ hasText: /Monthly GST Return/i }).first();
    await expect(monthlyReturnRow).toBeVisible({ timeout: 10000 });

    // Verify wallet amount is displayed in the table (₹350.00)
    await expect(monthlyReturnRow).toContainText('₹350.00');

    // Click "View & Approve" button
    const viewApproveBtn = monthlyReturnRow.locator('button').filter({ hasText: /View & Approve/i });
    await expect(viewApproveBtn).toBeVisible();
    await viewApproveBtn.click();

    // Verify inspection modal shows Debited Wallet Fee
    await expect(page.getByText('Debited Wallet Fee')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('₹350.00').first()).toBeVisible({ timeout: 5000 });

    // Approve the monthly return if approval button exists
    const approveBtn = page.locator('button').filter({ hasText: /Approve Application|Approve Service/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForTimeout(1000);
    }
  });

});
