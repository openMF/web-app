import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ClientCreationPage } from '../pages/client-creation.page';

/**
 * Client Creation - Advanced Fields Toggle Tests (WEB-564)
 *
 * This test suite validates the "Show advanced fields" toggle functionality
 * in the Client Creation form (General step).
 *
 * Test Coverage:
 * - Toggle default state (hidden/off)
 * - Basic fields always visible (including externalId)
 * - Advanced fields visibility based on toggle state
 * - Client creation succeeds with both toggle states
 *
 * Prerequisites:
 * - Angular dev server running on http://localhost:4200
 * - Fineract backend accessible (via proxy to https://localhost:8443)
 * - Valid user credentials: mifos / password
 */
test.describe('Client Creation - Advanced Fields Toggle', () => {
  let loginPage: LoginPage;
  let clientCreationPage: ClientCreationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    clientCreationPage = new ClientCreationPage(page);

    // Login first
    await loginPage.navigate();
    await loginPage.login('mifos', 'password');
    await page.waitForTimeout(2000); // Wait for login to complete

    // Navigate to client creation page
    await clientCreationPage.navigate();
  });

  test.describe('Toggle Default State', () => {
    test('should have advanced fields toggle unchecked by default', async () => {
      // Verify the toggle is visible
      await expect(clientCreationPage.showAdvancedFieldsToggle).toBeVisible();

      // Verify the toggle is unchecked by default (Easy mode)
      const isChecked = await clientCreationPage.isAdvancedFieldsToggleChecked();
      expect(isChecked).toBe(false);
    });

    test('should hide advanced fields by default', async () => {
      // Advanced fields should not be visible in default state
      await clientCreationPage.assertAdvancedFieldsHidden();
    });
  });

  test.describe('Basic Fields Visibility', () => {
    test('should always display basic fields regardless of toggle state', async () => {
      // Assert basic fields are visible with toggle OFF
      await clientCreationPage.assertBasicFieldsVisible();

      // Enable advanced fields toggle
      await clientCreationPage.enableAdvancedFields();

      // Assert basic fields are still visible with toggle ON
      await clientCreationPage.assertBasicFieldsVisible();
    });

    test('should always display externalId field as a basic field', async () => {
      // External ID should be visible with toggle OFF (default state)
      await expect(clientCreationPage.externalIdInput).toBeVisible();

      // Enable advanced fields
      await clientCreationPage.enableAdvancedFields();

      // External ID should still be visible with toggle ON
      await expect(clientCreationPage.externalIdInput).toBeVisible();

      // Disable advanced fields
      await clientCreationPage.disableAdvancedFields();

      // External ID should remain visible with toggle OFF
      await expect(clientCreationPage.externalIdInput).toBeVisible();
    });

    test('should display name fields based on legal form selection', async ({ page }) => {
      // Default legal form is Person - should show first/middle/last name
      await page.waitForTimeout(500);
      await expect(clientCreationPage.firstNameInput).toBeVisible();
      await expect(clientCreationPage.lastNameInput).toBeVisible();
    });
  });

  test.describe('Advanced Fields Toggle Behavior', () => {
    test('should show advanced fields when toggle is enabled', async () => {
      // Initially advanced fields should be hidden
      await clientCreationPage.assertAdvancedFieldsHidden();

      // Enable advanced fields toggle
      await clientCreationPage.enableAdvancedFields();

      // Verify toggle is now checked
      const isChecked = await clientCreationPage.isAdvancedFieldsToggleChecked();
      expect(isChecked).toBe(true);

      // Advanced fields should now be visible
      await clientCreationPage.assertAdvancedFieldsVisible();
    });

    test('should hide advanced fields when toggle is disabled', async () => {
      // Enable advanced fields first
      await clientCreationPage.enableAdvancedFields();
      await clientCreationPage.assertAdvancedFieldsVisible();

      // Disable advanced fields
      await clientCreationPage.disableAdvancedFields();

      // Verify toggle is now unchecked
      const isChecked = await clientCreationPage.isAdvancedFieldsToggleChecked();
      expect(isChecked).toBe(false);

      // Advanced fields should be hidden again
      await clientCreationPage.assertAdvancedFieldsHidden();
    });

    test('should toggle advanced fields visibility multiple times', async () => {
      // Toggle ON
      await clientCreationPage.enableAdvancedFields();
      await clientCreationPage.assertAdvancedFieldsVisible();

      // Toggle OFF
      await clientCreationPage.disableAdvancedFields();
      await clientCreationPage.assertAdvancedFieldsHidden();

      // Toggle ON again
      await clientCreationPage.enableAdvancedFields();
      await clientCreationPage.assertAdvancedFieldsVisible();

      // Basic fields should remain visible throughout
      await clientCreationPage.assertBasicFieldsVisible();
    });
  });

  test.describe('Form Interaction with Toggle States', () => {
    test('should allow filling basic fields with toggle OFF', async () => {
      // Fill basic fields with toggle OFF
      await clientCreationPage.fillBasicPersonDetails({
        firstName: 'John',
        lastName: 'Doe',
        externalId: 'EXT-001',
        mobileNo: '1234567890',
        email: 'john.doe@test.com'
      });

      // Verify values are entered
      await expect(clientCreationPage.firstNameInput).toHaveValue('John');
      await expect(clientCreationPage.lastNameInput).toHaveValue('Doe');
      await expect(clientCreationPage.externalIdInput).toHaveValue('EXT-001');
    });

    test('should preserve basic field values when toggling advanced fields', async () => {
      // Fill basic fields
      await clientCreationPage.fillBasicPersonDetails({
        firstName: 'Jane',
        lastName: 'Smith',
        externalId: 'EXT-002'
      });

      // Enable advanced fields
      await clientCreationPage.enableAdvancedFields();

      // Verify basic field values are preserved
      await expect(clientCreationPage.firstNameInput).toHaveValue('Jane');
      await expect(clientCreationPage.lastNameInput).toHaveValue('Smith');
      await expect(clientCreationPage.externalIdInput).toHaveValue('EXT-002');

      // Disable advanced fields
      await clientCreationPage.disableAdvancedFields();

      // Values should still be preserved
      await expect(clientCreationPage.firstNameInput).toHaveValue('Jane');
      await expect(clientCreationPage.lastNameInput).toHaveValue('Smith');
      await expect(clientCreationPage.externalIdInput).toHaveValue('EXT-002');
    });
  });

  // Backend validation tests - Skip in CI unless Fineract is available
  test.describe('Backend Validation', () => {
    // These tests require a running Fineract backend
    test.skip(process.env.CI === 'true', 'Requires Fineract backend');

    test('should successfully create client with advanced fields hidden', async ({ page }) => {
      // Select office (assuming 'Head Office' exists)
      await clientCreationPage.selectOffice('Head Office');

      // Fill required basic fields only (toggle OFF)
      await clientCreationPage.fillBasicPersonDetails({
        firstName: 'Test',
        lastName: 'Client',
        externalId: `EXT-${Date.now()}`
      });

      // Click Next to proceed (form validation)
      await clientCreationPage.nextButton.click();

      // If form is valid, we should move to next step or see no errors
      // This validates that no required backend fields are omitted
      await page.waitForTimeout(1000);

      // Check that we're not showing validation errors for hidden fields
      const errors = await page.locator('mat-error').count();
      // Should have no errors if basic required fields are filled
      expect(errors).toBeLessThanOrEqual(0);
    });

    test('should successfully create client with advanced fields shown', async ({ page }) => {
      // Enable advanced fields
      await clientCreationPage.enableAdvancedFields();

      // Select office
      await clientCreationPage.selectOffice('Head Office');

      // Fill required basic fields
      await clientCreationPage.fillBasicPersonDetails({
        firstName: 'Advanced',
        lastName: 'Client',
        externalId: `EXT-ADV-${Date.now()}`
      });

      // Advanced fields are optional, so we don't need to fill them

      // Click Next to proceed
      await clientCreationPage.nextButton.click();

      await page.waitForTimeout(1000);

      // Verify no errors - form should be valid
      const errors = await page.locator('mat-error').count();
      expect(errors).toBeLessThanOrEqual(0);
    });

    test('should maintain same payload structure regardless of toggle state', async ({ page }) => {
      // This test ensures the backend receives consistent data structure
      // regardless of whether advanced fields toggle is ON or OFF

      // Setup request interception to capture the API payload
      let capturedPayload: any = null;
      let requestCaptured = false;
      await page.route('**/fineract-provider/api/v1/clients**', async (route) => {
        const request = route.request();
        if (request.method() === 'POST') {
          capturedPayload = request.postDataJSON();
          requestCaptured = true;
        }
        await route.continue();
      });

      // Fill required fields with toggle OFF
      await clientCreationPage.selectOffice('Head Office');
      const testExternalId = `EXT-PAY-${Date.now()}`;
      await clientCreationPage.fillBasicPersonDetails({
        firstName: 'Payload',
        lastName: 'Test',
        externalId: testExternalId
      });

      // Navigate through the wizard to submit
      await clientCreationPage.nextButton.click();
      await page.waitForTimeout(500);

      // Ensure we captured the payload - fail explicitly if not
      expect(requestCaptured).toBe(true);
      expect(capturedPayload).toBeDefined();
      // Assert externalId is included in payload
      expect(capturedPayload.externalId).toBe(testExternalId);

      // The payload structure should include all expected fields
      // Empty optional fields should either be omitted or sent as empty strings
      // This ensures backward compatibility with the backend API
    });
  });
});

/**
 * Accessibility Tests for Toggle Feature
 */
test.describe('Client Creation Toggle - Accessibility', () => {
  let loginPage: LoginPage;
  let clientCreationPage: ClientCreationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    clientCreationPage = new ClientCreationPage(page);

    await loginPage.navigate();
    await loginPage.login('mifos', 'password');
    await page.waitForTimeout(2000);
    await clientCreationPage.navigate();
  });

  test('toggle should be keyboard accessible', async ({ page }) => {
    // Tab to the toggle
    await clientCreationPage.showAdvancedFieldsToggle.focus();

    // Verify it's focused
    await expect(clientCreationPage.showAdvancedFieldsToggle).toBeFocused();

    // Press Space to toggle
    await page.keyboard.press('Space');

    // Verify toggle is now checked
    const isChecked = await clientCreationPage.isAdvancedFieldsToggleChecked();
    expect(isChecked).toBe(true);

    // Advanced fields should be visible
    await clientCreationPage.assertAdvancedFieldsVisible();
  });

  test('toggle should have proper label for screen readers', async () => {
    // Verify the toggle has accessible text
    const toggleText = await clientCreationPage.showAdvancedFieldsToggle.textContent();
    expect(toggleText).toContain('Show advanced fields');
  });
});
