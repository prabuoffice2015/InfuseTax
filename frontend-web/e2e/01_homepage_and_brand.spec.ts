import { test, expect } from '@playwright/test';

test.describe('01 - Homepage & Brand Identity', () => {
  test('should load homepage with TaxPartner branding and navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Verify Page Title contains TaxPartner or tax platform
    await expect(page).toHaveTitle(/TaxPartner|InfuseTax/i);

    // 2. Verify Brand Logo / Image is visible
    const logo = page.locator('img[alt*="TaxPartner" i], img[src*="taxpartner" i], header img');
    await expect(logo.first()).toBeVisible();

    // 3. Verify Navigation Links
    const homeLink = page.locator('nav a, header a').filter({ hasText: /Home/i });
    await expect(homeLink.first()).toBeVisible();

    const servicesLink = page.locator('nav, header').getByText(/Services/i);
    await expect(servicesLink.first()).toBeVisible();

    // 4. Verify Sign-In CTA button exists
    const signInCta = page.locator('header a, nav a').filter({ hasText: /Sign In|Login|Portal/i });
    await expect(signInCta.first()).toBeVisible();

    // 5. Verify Hero headline
    const heroHeading = page.locator('h1');
    await expect(heroHeading.first()).toBeVisible();
    await expect(heroHeading.first()).toContainText(/Tax|Compliance/i);
  });

  test('should navigate to sign-in page when Sign In button is clicked', async ({ page }) => {
    await page.goto('/');
    const signInBtn = page.locator('header a, nav a').filter({ hasText: /Sign In|Login/i }).first();
    await signInBtn.click();
    await page.waitForURL(/\/sign-in/);
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
