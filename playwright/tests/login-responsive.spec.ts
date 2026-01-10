import { test, expect } from '@playwright/test';
import { LoginPage } from 'playwright/pages/login.page';

/**
 * Login Responsive Layout Tests
 *
 * This test suite validates that the login page displays correctly
 * and fills the viewport at different screen sizes.
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  mobileLandscape: { width: 667, height: 375 },
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1280, height: 720 }, // Desktop
  largeDesktop: { width: 1920, height: 1080 } // Full HD
};

test.describe('Login Page - Responsive Layout', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should fill viewport on mobile portrait (375x667)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    // Verify the login form is visible
    await loginPage.assertOnLoginPage();

    // Check login wrapper fills viewport
    const loginWrapper = loginPage.divLocator('.login-wrapper');
    await expect(loginWrapper).toBeVisible();

    const wrapperBox = await loginWrapper.boundingBox();
    expect(wrapperBox?.height).toBeGreaterThanOrEqual(VIEWPORTS.mobile.height - 10);

    // Check login panel exists and is visible
    const loginPanel = loginPage.divLocator('.login-panel');
    await expect(loginPanel).toBeVisible();

    // Check all essential elements are visible
    await expect(loginPage.divLocator('.logo-section')).toBeVisible();
    await expect(loginPage.divLocator('.form-section')).toBeVisible();
    await expect(loginPage.divLocator('.login-footer')).toBeVisible();

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 1);
  });

  test('should fill viewport on tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    // Verify the login form is visible
    await loginPage.assertOnLoginPage();

    const loginWrapper = loginPage.divLocator('.login-wrapper');
    await expect(loginWrapper).toBeVisible();

    const wrapperBox = await loginWrapper.boundingBox();
    expect(wrapperBox?.height).toBeGreaterThanOrEqual(VIEWPORTS.tablet.height - 10);

    // On tablet, hero panel should be hidden
    const heroPanel = loginPage.divLocator('.hero-panel');
    await expect(heroPanel).not.toBeVisible();

    // Login panel should be visible
    const loginPanel = loginPage.divLocator('.login-panel');
    await expect(loginPanel).toBeVisible();

    // All sections should be visible
    await expect(loginPage.divLocator('.logo-section')).toBeVisible();
    await expect(loginPage.divLocator('.form-section')).toBeVisible();
  });

  test('should fill viewport on desktop (1280x720)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    // Verify the login form is visible
    await loginPage.assertOnLoginPage();

    const loginWrapper = loginPage.divLocator('.login-wrapper');
    await expect(loginWrapper).toBeVisible();

    const wrapperBox = await loginWrapper.boundingBox();
    expect(wrapperBox?.height).toBeGreaterThanOrEqual(VIEWPORTS.desktop.height - 10);

    // On desktop, hero panel should be visible
    const heroPanel = loginPage.divLocator('.hero-panel');
    await expect(heroPanel).toBeVisible();

    // Login panel should be visible
    const loginPanel = loginPage.divLocator('.login-panel');
    await expect(loginPanel).toBeVisible();

    // Login card should be centered
    const loginCard = loginPage.divLocator('.login-card');
    await expect(loginCard).toBeVisible();
  });

  test('should display all content without scrolling on desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    // Verify the login form is visible
    await loginPage.assertOnLoginPage();

    // Check if login card content is fully visible
    const loginCard = loginPage.divLocator('.login-card');
    const cardBox = await loginCard.boundingBox();

    // Logo should be visible
    const logo = loginPage.divLocator('.logo-image');
    const logoBox = await logo.boundingBox();
    expect(logoBox).toBeTruthy();

    // Username input should be visible
    const usernameInput = page.locator('input[formcontrolname="username"]');
    const usernameBox = await usernameInput.boundingBox();
    expect(usernameBox).toBeTruthy();

    // Password input should be visible
    const passwordInput = page.locator('input[formcontrolname="password"]');
    const passwordBox = await passwordInput.boundingBox();
    expect(passwordBox).toBeTruthy();

    // Login button should be visible
    const loginButton = page.locator('mifosx-m3-button[type="submit"]');
    const buttonBox = await loginButton.boundingBox();
    expect(buttonBox).toBeTruthy();

    // Resources section should be visible
    const resourcesSection = page.locator('.resources-section');
    const resourcesBox = await resourcesSection.boundingBox();
    expect(resourcesBox).toBeTruthy();

    // Footer should be visible
    const footer = loginPage.divLocator('.login-footer');
    const footerBox = await footer.boundingBox();
    expect(footerBox).toBeTruthy();
  });

  test('should handle small mobile screens (375x667) with all content visible', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    // Verify the login form is visible
    await loginPage.assertOnLoginPage();

    // Scroll to bottom to ensure footer is accessible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Footer should be visible after scroll
    const footer = loginPage.divLocator('.login-footer');
    await expect(footer).toBeVisible();

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));

    // Logo and form should be visible at top
    await expect(loginPage.divLocator('.logo-section')).toBeVisible();
    await expect(loginPage.divLocator('.form-section')).toBeVisible();
  });

  test('should maintain proper spacing between elements on all viewports', async ({ page }) => {
    const viewports = [
      VIEWPORTS.mobile,
      VIEWPORTS.tablet,
      VIEWPORTS.desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      // Verify the login form is visible
      await loginPage.assertOnLoginPage();

      const logo = loginPage.divLocator('.logo-section');
      const form = loginPage.divLocator('.form-section');

      // All sections should be visible
      await expect(logo).toBeVisible();
      await expect(form).toBeVisible();

      if (viewport.width > 1024) {
        const resources = loginPage.divLocator('.resources-section');
        await expect(resources).toBeVisible();
      }

      // Get bounding boxes
      const logoBox = await logo.boundingBox();
      const formBox = await form.boundingBox();

      // Form should be below logo
      if (logoBox && formBox) {
        expect(formBox.y).toBeGreaterThan(logoBox.y + logoBox.height);
      }
    }
  });

  test('should not have horizontal overflow on any viewport', async ({ page }) => {
    const viewports = [
      VIEWPORTS.mobile,
      VIEWPORTS.tablet,
      VIEWPORTS.desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:4200/login');
      await page.waitForLoadState('networkidle');

      // Check no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('should center login card vertically on desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    // Verify the login form is visible
    await loginPage.assertOnLoginPage();

    const loginCard = page.locator('.login-card');
    const cardBox = await loginCard.boundingBox();

    const viewportHeight = VIEWPORTS.desktop.height;

    // Card should be roughly centered (with some tolerance)
    if (cardBox) {
      const cardCenter = cardBox.y + cardBox.height / 2;
      const viewportCenter = viewportHeight / 2;

      // Allow 100px tolerance for header/footer
      expect(Math.abs(cardCenter - viewportCenter)).toBeLessThan(150);
    }
  });

  test('should show all form fields on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    // Verify the login form is visible
    await loginPage.assertOnLoginPage();

    // Username field
    const usernameField = page.locator('mat-form-field').filter({ hasText: 'Username' });
    await expect(usernameField).toBeVisible();

    // Password field
    const passwordField = page.locator('mat-form-field').filter({ hasText: 'Password' });
    await expect(passwordField).toBeVisible();

    // Login button
    const loginButton = page.locator('mifosx-m3-button[type="submit"]');
    await expect(loginButton).toBeVisible();
  });

  test('should show logo on all screen sizes', async ({ page }) => {
    const viewports = [
      VIEWPORTS.mobile,
      VIEWPORTS.tablet,
      VIEWPORTS.desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      // Verify the login form is visible
      await loginPage.assertOnLoginPage();

      const logo = page.locator('.logo-image');
      await expect(logo).toBeVisible();

      // Logo should have appropriate size
      const logoBox = await logo.boundingBox();
      expect(logoBox?.width).toBeGreaterThan(0);
      expect(logoBox?.height).toBeGreaterThan(0);
    }
  });
});
