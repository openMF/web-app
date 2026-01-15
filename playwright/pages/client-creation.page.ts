import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ClientCreationPage - Page Object for the Mifos X Client Creation page.
 *
 * Encapsulates all client creation form interactions and element locators.
 * Extends BasePage for common functionality.
 *
 * Used for testing the "Show advanced fields" toggle feature (WEB-564).
 */
export class ClientCreationPage extends BasePage {
  /**
   * The URL path for the client creation page.
   */
  readonly url = '/#/clients/create';

  // ============================================
  // Basic Fields (Always Visible)
  // ============================================

  /**
   * Get the Office dropdown.
   */
  get officeDropdown(): Locator {
    return this.page.locator('mat-select[formcontrolname="officeId"]');
  }

  /**
   * Get the Legal Form dropdown.
   */
  get legalFormDropdown(): Locator {
    return this.page.locator('mat-select[formcontrolname="legalFormId"]');
  }

  /**
   * Get the External ID input field.
   * This is a basic field and should always be visible.
   */
  get externalIdInput(): Locator {
    return this.page.locator('input[formcontrolname="externalId"]');
  }

  /**
   * Get the First Name input field (visible when legal form is Person).
   */
  get firstNameInput(): Locator {
    return this.page.locator('input[formcontrolname="firstname"]');
  }

  /**
   * Get the Middle Name input field (visible when legal form is Person).
   */
  get middleNameInput(): Locator {
    return this.page.locator('input[formcontrolname="middlename"]');
  }

  /**
   * Get the Last Name input field (visible when legal form is Person).
   */
  get lastNameInput(): Locator {
    return this.page.locator('input[formcontrolname="lastname"]');
  }

  /**
   * Get the Full Name input field (visible when legal form is Entity).
   */
  get fullNameInput(): Locator {
    return this.page.locator('input[formcontrolname="fullname"]');
  }

  /**
   * Get the Mobile No input field.
   */
  get mobileNoInput(): Locator {
    return this.page.locator('input[formcontrolname="mobileNo"]');
  }

  /**
   * Get the Email Address input field.
   */
  get emailAddressInput(): Locator {
    return this.page.locator('input[formcontrolname="emailAddress"]');
  }

  /**
   * Get the Date of Birth date picker input.
   */
  get dateOfBirthInput(): Locator {
    return this.page.locator('input[formcontrolname="dateOfBirth"]');
  }

  /**
   * Get the Submitted On date picker input.
   */
  get submittedOnInput(): Locator {
    return this.page.locator('input[formcontrolname="submittedOnDate"]');
  }

  /**
   * Get the Gender dropdown (visible when legal form is Person).
   */
  get genderDropdown(): Locator {
    return this.page.locator('mat-select[formcontrolname="genderId"]');
  }

  /**
   * Get the Active checkbox.
   */
  get activeCheckbox(): Locator {
    return this.page.locator('mat-checkbox[formcontrolname="active"]');
  }

  /**
   * Get the Open Savings Account checkbox.
   */
  get addSavingsCheckbox(): Locator {
    return this.page.locator('mat-checkbox[formcontrolname="addSavings"]');
  }

  // ============================================
  // Toggle Control
  // ============================================

  /**
   * Get the "Show advanced fields" toggle checkbox.
   */
  get showAdvancedFieldsToggle(): Locator {
    return this.page.locator('mat-checkbox').filter({ hasText: 'Show advanced fields' });
  }

  /**
   * Check if advanced fields toggle is checked.
   */
  async isAdvancedFieldsToggleChecked(): Promise<boolean> {
    const checkbox = this.showAdvancedFieldsToggle.locator('input[type="checkbox"]');
    return checkbox.isChecked();
  }

  /**
   * Enable advanced fields by checking the toggle.
   */
  async enableAdvancedFields(): Promise<void> {
    const isChecked = await this.isAdvancedFieldsToggleChecked();
    if (!isChecked) {
      await this.showAdvancedFieldsToggle.click();
    }
  }

  /**
   * Disable advanced fields by unchecking the toggle.
   */
  async disableAdvancedFields(): Promise<void> {
    const isChecked = await this.isAdvancedFieldsToggleChecked();
    if (isChecked) {
      await this.showAdvancedFieldsToggle.click();
    }
  }

  // ============================================
  // Advanced Fields (Only visible when toggle is ON)
  // ============================================

  /**
   * Get the Staff dropdown (advanced field).
   */
  get staffDropdown(): Locator {
    return this.page.locator('mat-select[formcontrolname="staffId"]');
  }

  /**
   * Get the Client Type dropdown (advanced field).
   */
  get clientTypeDropdown(): Locator {
    return this.page.locator('mat-select[formcontrolname="clientTypeId"]');
  }

  /**
   * Get the Client Classification dropdown (advanced field).
   */
  get clientClassificationDropdown(): Locator {
    return this.page.locator('mat-select[formcontrolname="clientClassificationId"]');
  }

  /**
   * Get the "Is Staff" checkbox (advanced field, visible when legal form is Person).
   */
  get isStaffCheckbox(): Locator {
    return this.page.locator('mat-checkbox[formcontrolname="isStaff"]').first();
  }

  // ============================================
  // Navigation Buttons
  // ============================================

  /**
   * Get the Next button.
   */
  get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Next' });
  }

  /**
   * Get the Previous button.
   */
  get previousButton(): Locator {
    return this.page.getByRole('button', { name: 'Previous' });
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Wait for the client creation page to be fully loaded.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for the form to be visible
    await this.officeDropdown.waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Select an office from the dropdown.
   * @param officeName - The name of the office to select
   */
  async selectOffice(officeName: string): Promise<void> {
    await this.officeDropdown.click();
    await this.page.locator('mat-option').filter({ hasText: officeName }).click();
  }

  /**
   * Select a legal form from the dropdown.
   * @param legalFormName - The name of the legal form (e.g., 'Person' or 'Entity')
   */
  async selectLegalForm(legalFormName: string): Promise<void> {
    await this.legalFormDropdown.click();
    await this.page.locator('mat-option').filter({ hasText: legalFormName }).click();
  }

  /**
   * Fill in basic client details for a Person.
   * @param details - Object containing client details
   */
  async fillBasicPersonDetails(details: {
    firstName: string;
    lastName: string;
    middleName?: string;
    externalId?: string;
    mobileNo?: string;
    email?: string;
  }): Promise<void> {
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);

    if (details.middleName) {
      await this.middleNameInput.fill(details.middleName);
    }
    if (details.externalId) {
      await this.externalIdInput.fill(details.externalId);
    }
    if (details.mobileNo) {
      await this.mobileNoInput.fill(details.mobileNo);
    }
    if (details.email) {
      await this.emailAddressInput.fill(details.email);
    }
  }

  /**
   * Assert that all basic fields are visible.
   */
  async assertBasicFieldsVisible(): Promise<void> {
    await expect(this.officeDropdown).toBeVisible();
    await expect(this.legalFormDropdown).toBeVisible();
    await expect(this.externalIdInput).toBeVisible();
    await expect(this.mobileNoInput).toBeVisible();
    await expect(this.emailAddressInput).toBeVisible();
    await expect(this.submittedOnInput).toBeVisible();
    await expect(this.showAdvancedFieldsToggle).toBeVisible();
  }

  /**
   * Assert that advanced fields are visible.
   */
  async assertAdvancedFieldsVisible(): Promise<void> {
    await expect(this.staffDropdown).toBeVisible();
    await expect(this.clientTypeDropdown).toBeVisible();
    await expect(this.clientClassificationDropdown).toBeVisible();
  }

  /**
   * Assert that advanced fields are hidden.
   * Uses toHaveCount(0) because fields are conditionally rendered with *ngIf.
   */
  async assertAdvancedFieldsHidden(): Promise<void> {
    await expect(this.staffDropdown).toHaveCount(0);
    await expect(this.clientTypeDropdown).toHaveCount(0);
    await expect(this.clientClassificationDropdown).toHaveCount(0);
  }
}
