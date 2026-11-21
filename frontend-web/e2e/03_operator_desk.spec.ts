import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('03 - Operator Counter Desk & Document Checklist', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'operator');
  });

  test('should load Operator Desk with service tabs and document upload zone', async ({ page }) => {
    // 1. Verify service selector or desk controls exist
    const serviceTab = page.locator('text=/GST Registration|GSTR|ITR/i');
    await expect(serviceTab.first()).toBeVisible({ timeout: 10000 });

    // 2. Verify Scanned Color Copy checklist
    const checklistHeader = page.locator('text=/SCANNED COLOR COPY|DOCUMENTS CHECKLIST/i');
    await expect(checklistHeader.first()).toBeVisible();

    // 3. Verify Bulk Upload Dropzone exists
    const bulkDropzone = page.locator('text=/BULK UPLOAD ALL COLOR DOCUMENTS/i');
    await expect(bulkDropzone.first()).toBeVisible();

    // 4. Verify "Bulk Select Files" button exists
    const bulkSelectBtn = page.locator('button').filter({ hasText: /Bulk Select Files/i });
    await expect(bulkSelectBtn.first()).toBeVisible();

    // 5. CRITICAL: Verify "Auto-Fill All Slots" demo button is REMOVED
    const autoFillBtn = page.locator('button').filter({ hasText: /Auto-Fill All Slots/i });
    await expect(autoFillBtn).toHaveCount(0);
  });

  test('should switch between entity types and update checklist slots', async ({ page }) => {
    // If entity type radio/tabs exist (Sole Proprietorship, Private Limited, Partnership)
    const pvtLtdOption = page.locator('text=/Private Limited|PVT LTD/i');
    if (await pvtLtdOption.count() > 0) {
      await pvtLtdOption.first().click();
      await page.waitForTimeout(500);
      // Verify COI or Director documents appear
      const coiSlot = page.locator('text=/Incorporation|COI|Director/i');
      await expect(coiSlot.first()).toBeVisible();
    }
  });
});
