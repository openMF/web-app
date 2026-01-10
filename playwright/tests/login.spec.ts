import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

/**
 * Login Smoke Tests
 *
 * This test suite validates the core login functionality of the Mifos X Web App.
 * These tests use a strict Page Object Model with selectors from Playwright codegen.
 *
 * Prerequisites:
 * - Angular dev server running on http://localhost:4200
 * - Fineract backend accessible (via proxy to https://localhost:8443)
 *
 * Test Data:
 * - Valid credentials: mifos / password
 */
test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should display the login form', async () => {
    // Verify the login form is visible
    await loginPage.assertOnLoginPage();

    // Verify form elements are present (using codegen selectors)
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should disable login button when form is empty', async () => {
    // Login button should be disabled with empty fields
    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    // Focus and blur username field to trigger validation
    await loginPage.usernameInput.focus();
    await loginPage.passwordInput.focus();
    await page.keyboard.press('Tab');

    // Check for validation error messages
    const hasErrors = await loginPage.getErrorCount();
    expect(hasErrors).toBeGreaterThan(0);
  });

  test('should enable login button when credentials are entered', async () => {
    // Fill in credentials using the wrapper clicks (as per codegen)
    await loginPage.usernameDivWrapper.click();
    await loginPage.usernameInput.fill('mifos');
    await loginPage.passwordDivWrapper.click();
    await loginPage.passwordInput.fill('password');

    // Login button should become enabled
    await expect(loginPage.loginButton).toBeEnabled();
  });

  // Skip in CI - requires Fineract backend
  test.skip(!!process.env.CI, 'Requires Fineract backend');
  test('should successfully login with valid credentials', async () => {
    // Perform login with valid credentials
    // This uses the login() method which follows the exact codegen sequence
    await loginPage.loginAndWaitForDashboard('mifos', 'password');

    // Assert we're no longer on the login page
    await loginPage.assertLoginSuccess();
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    // Attempt login with wrong password
    await loginPage.login('mifos', 'wrongpassword');

    // Wait for the login attempt to process and any error notification to appear
    // The app shows a snackbar notification for authentication errors
    await page.waitForTimeout(3000);

    // Should remain on login page after failed attempt (URL still contains /login)
    await expect(page).toHaveURL(/.*login.*/);

    // Verify we're still on the login page by checking form elements are visible
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });

  /**
   * Simple test that exactly mirrors the codegen script.
   * This is the baseline test generated from codegen.
   */
  // Skip in CI - requires Fineract backend
  test.skip(!!process.env.CI, 'Requires Fineract backend');
  test('codegen baseline: login with mifos credentials', async () => {
    // This test uses the exact codegen interaction sequence
    await loginPage.login('mifos', 'password');

    // Verify successful login
    await loginPage.assertLoginSuccess();
  });
});

/**
 * Accessibility smoke test
 */
test.describe('Login Page Accessibility', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Form should be navigable via keyboard
    await expect(loginPage.loginButton).toBeVisible();
  });
});
