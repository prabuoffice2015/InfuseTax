import { Page, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';

export type UserRoleKey = keyof typeof TEST_USERS;

/**
 * Perform UI login on /sign-in page with given role
 */
export async function loginAs(page: Page, roleKey: UserRoleKey) {
  const user = TEST_USERS[roleKey];
  await page.goto('/sign-in');
  await page.waitForLoadState('networkidle');

  // Fill in login credentials (identifier input accepts email/mobile)
  const identifierInput = page.locator('input[placeholder*="company.com" i], input[placeholder*="email" i], input[type="text"]').first();
  const passwordInput = page.locator('input[type="password"], input[placeholder*="password" i]').first();

  await identifierInput.fill(user.email);
  await passwordInput.fill(user.password);

  // Submit login
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.click();

  // Wait for redirect to expected dashboard path
  await page.waitForURL(new RegExp(user.expectedPath), { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  return user;
}
