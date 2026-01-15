/**
 * Client Creation - Advanced Fields Toggle Tests (WEB-564)
 *
 * This test suite validates the "Show advanced fields" toggle functionality
 * in the Client Creation form using Cypress.
 *
 * Test Coverage:
 * - Toggle default state (hidden/off)
 * - Basic fields always visible (including externalId)
 * - Advanced fields visibility based on toggle state
 */

describe('Client Creation - Advanced Fields Toggle', () => {
  beforeEach(() => {
    // Login and navigate to client creation
    cy.visit('/');
    cy.get('input[formcontrolname="username"]').type(Cypress.env('username') || 'mifos');
    cy.get('input[formcontrolname="password"]').type(Cypress.env('password') || 'password');
    cy.get('button').contains('Login').click();

    // Wait for login to complete by checking URL change
    cy.url().should('not.include', '/login');
    // Wait for dashboard element to be present
    cy.get('mifosx-sidenav', { timeout: 10000 }).should('exist');

    // Navigate to client creation
    cy.visit('/#/clients/create');
    // Wait for form to load by checking for a key element
    cy.get('mat-select[formcontrolname="officeId"]', { timeout: 10000 }).should('be.visible');
  });

  describe('Toggle Default State', () => {
    it('should have advanced fields toggle visible', () => {
      cy.contains('Show advanced fields').should('be.visible');
    });

    it('should have advanced fields toggle unchecked by default', () => {
      cy.contains('Show advanced fields').parent().find('input[type="checkbox"]').should('not.be.checked');
    });

    it('should hide advanced fields by default', () => {
      // Advanced fields should not be visible
      cy.get('mat-select[formcontrolname="staffId"]').should('not.exist');
      cy.get('mat-select[formcontrolname="clientTypeId"]').should('not.exist');
      cy.get('mat-select[formcontrolname="clientClassificationId"]').should('not.exist');
    });
  });

  describe('Basic Fields Visibility', () => {
    it('should always display externalId field as a basic field', () => {
      // External ID should be visible by default (toggle OFF)
      cy.get('input[formcontrolname="externalId"]').should('be.visible');
    });

    it('should display externalId when toggle is enabled', () => {
      // Enable advanced fields
      cy.contains('Show advanced fields').click();

      // External ID should still be visible
      cy.get('input[formcontrolname="externalId"]').should('be.visible');
    });

    it('should display externalId when toggle is disabled again', () => {
      // Enable then disable advanced fields
      cy.contains('Show advanced fields').click();
      cy.contains('Show advanced fields').click();

      // External ID should still be visible
      cy.get('input[formcontrolname="externalId"]').should('be.visible');
    });

    it('should always display other basic fields', () => {
      // Office dropdown
      cy.get('mat-select[formcontrolname="officeId"]').should('be.visible');

      // Legal Form dropdown
      cy.get('mat-select[formcontrolname="legalFormId"]').should('be.visible');

      // Mobile No
      cy.get('input[formcontrolname="mobileNo"]').should('be.visible');

      // Email Address
      cy.get('input[formcontrolname="emailAddress"]').should('be.visible');

      // Submitted On date
      cy.get('input[formcontrolname="submittedOnDate"]').should('be.visible');
    });
  });

  describe('Advanced Fields Toggle Behavior', () => {
    it('should show advanced fields when toggle is enabled', () => {
      // Click toggle to enable advanced fields
      cy.contains('Show advanced fields').click();

      // Verify checkbox is now checked
      cy.contains('Show advanced fields').parent().find('input[type="checkbox"]').should('be.checked');

      // Advanced fields should now be visible
      cy.get('mat-select[formcontrolname="staffId"]').should('be.visible');
      cy.get('mat-select[formcontrolname="clientTypeId"]').should('be.visible');
      cy.get('mat-select[formcontrolname="clientClassificationId"]').should('be.visible');
    });

    it('should hide advanced fields when toggle is disabled', () => {
      // Enable first
      cy.contains('Show advanced fields').click();
      cy.get('mat-select[formcontrolname="staffId"]').should('be.visible');

      // Disable
      cy.contains('Show advanced fields').click();

      // Advanced fields should be hidden
      cy.get('mat-select[formcontrolname="staffId"]').should('not.exist');
      cy.get('mat-select[formcontrolname="clientTypeId"]').should('not.exist');
      cy.get('mat-select[formcontrolname="clientClassificationId"]').should('not.exist');
    });

    it('should toggle visibility multiple times correctly', () => {
      // First toggle ON
      cy.contains('Show advanced fields').click();
      cy.get('mat-select[formcontrolname="staffId"]').should('be.visible');

      // Toggle OFF
      cy.contains('Show advanced fields').click();
      cy.get('mat-select[formcontrolname="staffId"]').should('not.exist');

      // Toggle ON again
      cy.contains('Show advanced fields').click();
      cy.get('mat-select[formcontrolname="staffId"]').should('be.visible');

      // Basic fields should remain visible throughout
      cy.get('input[formcontrolname="externalId"]').should('be.visible');
      cy.get('mat-select[formcontrolname="officeId"]').should('be.visible');
    });
  });

  describe('Form Interaction with Toggle States', () => {
    it('should allow entering externalId with toggle OFF', () => {
      cy.get('input[formcontrolname="externalId"]').type('TEST-EXT-001').should('have.value', 'TEST-EXT-001');
    });

    it('should preserve externalId value when toggling advanced fields', () => {
      // Enter external ID
      cy.get('input[formcontrolname="externalId"]').type('PRESERVE-TEST');

      // Enable advanced fields
      cy.contains('Show advanced fields').click();

      // Value should be preserved
      cy.get('input[formcontrolname="externalId"]').should('have.value', 'PRESERVE-TEST');

      // Disable advanced fields
      cy.contains('Show advanced fields').click();

      // Value should still be preserved
      cy.get('input[formcontrolname="externalId"]').should('have.value', 'PRESERVE-TEST');
    });

    it('should preserve all basic field values when toggling', () => {
      // Fill multiple basic fields
      cy.get('input[formcontrolname="externalId"]').type('EXT-123');
      cy.get('input[formcontrolname="mobileNo"]').type('1234567890');
      cy.get('input[formcontrolname="emailAddress"]').type('test@example.com');

      // Toggle ON
      cy.contains('Show advanced fields').click();

      // All values should be preserved
      cy.get('input[formcontrolname="externalId"]').should('have.value', 'EXT-123');
      cy.get('input[formcontrolname="mobileNo"]').should('have.value', '1234567890');
      cy.get('input[formcontrolname="emailAddress"]').should('have.value', 'test@example.com');

      // Toggle OFF
      cy.contains('Show advanced fields').click();

      // All values should still be preserved
      cy.get('input[formcontrolname="externalId"]').should('have.value', 'EXT-123');
      cy.get('input[formcontrolname="mobileNo"]').should('have.value', '1234567890');
      cy.get('input[formcontrolname="emailAddress"]').should('have.value', 'test@example.com');
    });
  });

  describe('Backend Compatibility', () => {
    it('should have externalId in the form model regardless of toggle state', () => {
      // With toggle OFF - externalId should exist in form
      cy.get('input[formcontrolname="externalId"]').should('exist').and('be.visible');

      // With toggle ON - externalId should still exist
      cy.contains('Show advanced fields').click();
      cy.get('input[formcontrolname="externalId"]').should('exist').and('be.visible');
    });
  });
});
