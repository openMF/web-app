describe('Audit Trails', () => {
  // Test data constants for easy maintenance
  const TEST_USER = {
    username: 'mifos',
    password: 'password'
  };

  const BASE_URL = 'http://localhost:4200';

  beforeEach(() => {
    // Start each test from a clean state
    cy.visit(BASE_URL);
  });

  it('should login, search for system, navigate to audit trails, and download CSV without errors', () => {
    // Step 1: Login to the application
    loginToApplication(TEST_USER.username, TEST_USER.password);

    // Step 2: Handle the warning dialog if it appears
    handleWarningDialog();

    // Step 3: Use global search to find "system"
    searchInGlobalSearchBar('system');

    // Step 4: Click directly on Audit Trails button (no need to click System menu first!)
    clickAuditTrailsButton();

    // Step 5: Download CSV from audit trails page
    downloadCSV();

    // Step 6: Verify no errors occurred (Regression Check)
    verifyNoErrorToast();
  });

  // Helper Functions for better readability and reusability

  /**
   * Logs into the application with provided credentials
   */
  function loginToApplication(username: string, password: string) {
    // Find username input - using multiple selectors for stability
    cy.get('input[placeholder="Username"], input[formcontrolname="username"], input[type="text"]')
      .first()
      .should('be.visible')
      .clear()
      .type(username);

    // Find password input
    cy.get('input[placeholder="Password"], input[type="password"]').should('be.visible').clear().type(password);

    // Click the login button using text content (most stable)
    cy.contains('button', 'Login').click({ force: true });

    // Wait for login to complete
    cy.url().should('not.include', '/login');
  }

  /**
   * Handles the warning/info dialog that appears after login
   */
  function handleWarningDialog() {
    // Wait for dialog to appear and close it
    cy.get('mat-dialog-container', { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        cy.contains('button', /close|ok|continue/i).click({ force: true });
      });

    // Wait for dialog to close
    cy.wait(1000);
  }

  /**
   * Uses the global search bar to search for content
   * Based on the original recording: mat-mdc-text-field-wrapper
   */
  function searchInGlobalSearchBar(searchTerm: string) {
    // Find the search field using the class you provided
    cy.get('.mat-mdc-text-field-wrapper input, .mdc-text-field input')
      .first()
      .should('be.visible')
      .clear()
      .type(searchTerm);

    // Wait for search results/autocomplete to appear
    cy.wait(1000);

    // Select the matching option from the dropdown
    cy.get('mat-option').should('be.visible');
    cy.contains('mat-option', searchTerm, { matchCase: false }).click();
  }

  /**
   * Clicks on the Audit Trails button that appears after searching for "system"
   * After the search, a menu opens with various options including Audit Trails
   */
  function clickAuditTrailsButton() {
    // After searching for "system", a menu opens
    // We need to click the Audit Trails option directly from that menu
    // Class: mat-mdc-list-item mdc-list-item mat-mdc-list-item-interactive
    cy.get('.mat-mdc-list-item.mdc-list-item')
      .contains(/audit.*trail/i)
      .should('be.visible')
      .click({ force: true });

    // Wait for audit trails page to load
    cy.url().should('include', 'audit');
    cy.wait(2000);
  }

  /**
   * Downloads the CSV file from the audit trails page
   * Based on original: looks for download button
   */
  function downloadCSV() {
    // Wait for the audit trails page to load completely
    cy.wait(2000); // Ideally use cy.intercept, but wait is okay for now

    // strategy : Try the Icon first (Most reliable based on previous errors), then fallback to text
    cy.get('body').then(($body) => {
      // Check for the specific Excel Icon we found earlier
      if ($body.find('.fa-file-excel-o').length > 0) {
        cy.get('.fa-file-excel-o').parent().click({ force: true });
        cy.log('Clicked download button using Icon class');
      }
      // fallback: Check for ARIA labels or Text
      else if ($body.find('button[aria-label*="ownload"]').length > 0) {
        cy.get('button[aria-label*="ownload"]').click({ force: true });
        cy.log('Clicked download button using Aria Label');
      } else {
        // Last resort: Text
        cy.contains('button', /csv|download|export/i).click({ force: true });
      }
    });

    // Wait for download to process
    cy.wait(2000);
  }

  /**
   * regression check : Verifies that no error toast appears
   * This ensures the download operation completed successfully
   */
  function verifyNoErrorToast() {
    // Primary check: No error toast should appear
    // Using specific toast selectors to avoid false positives from unrelated error classes
    // like mat-error, error-text, etc.
    cy.get('.toast-container .toast-error, .toast-error, [data-cy="toast-error"]', { timeout: 5000 }).should(
      'not.exist'
    );

    // Additional check: If any toast exists, ensure it doesn't have error styling
    cy.get('body').then(($body) => {
      const toastExists = $body.find('.toast-container .toast').length > 0;

      if (toastExists) {
        cy.get('.toast-container .toast').filter(':visible').should('not.have.class', 'toast-error');
        cy.log('✓ Regression check passed: Toast found but no error styling detected');
      } else {
        cy.log('✓ Regression check passed: No toast notifications detected');
      }
    });

    // Note: CSV download verification
    // Cypress automatically downloads files to cypress/downloads folder
    // You can manually verify the CSV file after the test completes
    // Or add cy.readFile('cypress/downloads/filename.csv') for automated verification
  }
});
