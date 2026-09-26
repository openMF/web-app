/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ClientPage - Page Object for the Mifos X Clients module.
 *
 * Encapsulates all client-related interactions and element locators.
 * Extends BasePage for common functionality.
 *
 * Locator Strategy:
 * - Uses formcontrolname attributes for form inputs
 * - Uses getByRole for buttons
 * - Uses CSS selectors for table elements
 */
export class ClientPage extends BasePage {
  // The URL path for the clients list page.
  readonly url = '/#/clients';

  // Get the search input on the clients list page.
  get searchInput(): Locator {
    return this.page.locator('mat-form-field.search-box input');
  }

  // Get the "Create Client" button.
  get createClientButton(): Locator {
    return this.page.getByRole('button', { name: /Create Client/i });
  }

  // Get the "Import Client" button.
  get importClientButton(): Locator {
    return this.page.getByRole('button', { name: /Import Client/i });
  }

  // Get the client list table element.
  get clientTable(): Locator {
    return this.page.locator('table.bordered-table');
  }

  // Get all rows in the client list table.
  get clientRows(): Locator {
    return this.page.locator('table.bordered-table tbody tr');
  }

  // Get the first client name cell (the displayName column carries the routerLink).
  get firstClientNameCell(): Locator {
    return this.page.locator('table.bordered-table tbody tr td.mat-column-displayName').first();
  }

  // Get the "No client was found" alert message.
  get noClientFoundMessage(): Locator {
    return this.page.locator('.alert .message');
  }

  // Get the paginator.
  get paginator(): Locator {
    return this.page.locator('mat-paginator');
  }

  // Get the Office select dropdown.
  get officeSelect(): Locator {
    return this.page.locator('mat-select[formcontrolname="officeId"]');
  }

  // Get the Legal Form select dropdown.
  get legalFormSelect(): Locator {
    return this.page.locator('mat-select[formcontrolname="legalFormId"]');
  }

  // Get the First Name input field.
  get firstNameInput(): Locator {
    return this.page.locator('input[formcontrolname="firstname"]');
  }

  // Get the Middle Name input field.
  get middleNameInput(): Locator {
    return this.page.locator('input[formcontrolname="middlename"]');
  }

  // Get the Last Name input field.
  get lastNameInput(): Locator {
    return this.page.locator('input[formcontrolname="lastname"]');
  }

  // Get the External ID input field.
  get externalIdInput(): Locator {
    return this.page.locator('input[formcontrolname="externalId"]');
  }

  // Get the Submitted On date input field.
  get submittedOnDateInput(): Locator {
    return this.page.locator('input[formcontrolname="submittedOnDate"]');
  }

  // Get the "Performance History" heading on the client detail page.
  get performanceHistoryHeading(): Locator {
    return this.page.getByRole('heading', { name: /Performance History/i });
  }

  // Get the "Loan Accounts" heading on the client detail page.
  get loanAccountsHeading(): Locator {
    return this.page.getByRole('heading', { name: /Loan Accounts/i });
  }

  // Get the "Saving Accounts" heading on the client detail page.
  get savingAccountsHeading(): Locator {
    return this.page.getByRole('heading', { name: /Saving Accounts/i });
  }

  // Navigate to the Clients list page.
  async navigateToClients(): Promise<void> {
    await this.page.goto(this.url, {
      waitUntil: 'load',
      timeout: 60000
    });
    await this.waitForLoad();
  }

  /**
   * Wait for the clients page to be fully loaded.
   * Overrides BasePage to wait for page-specific elements.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (e) {
      console.log('Network idle timeout on clients page - proceeding anyway');
    }
    // Verify the UI is ready by checking for the search input
    await this.searchInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Search for a client by name using the search input.
   * @param name - The client name to search for
   */
  async searchClient(name: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.searchInput.press('Enter');
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      console.log('Network idle timeout after search - proceeding anyway');
    }
    // Wait for observable results: either rows appear or "no client found" message
    await Promise.race([
      this.clientRows.first().waitFor({ state: 'visible', timeout: 15000 }),
      this.noClientFoundMessage.waitFor({ state: 'visible', timeout: 15000 })
    ]);
  }

  /**
   * Click the "Create Client" button and wait for navigation to the form.
   */
  async openCreateClientForm(): Promise<void> {
    await this.createClientButton.click();
    await this.page.waitForURL(/.*clients\/create.*/, {
      timeout: 30000,
      waitUntil: 'networkidle'
    });
  }

  /**
   * Fill the client creation form with first name and last name.
   *
   * @param firstName - The first name to enter
   * @param lastName - The last name to enter
   */
  async fillClientForm(firstName: string, lastName: string): Promise<void> {
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(firstName);

    await this.lastNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Click the "Next" button on the general step of the client creation stepper.
   */
  async submitClientForm(): Promise<void> {
    const nextButton = this.page.getByRole('button', { name: /Next/i });
    await nextButton.click();
  }

  /**
   * Click the first client name cell to open the client detail page.
   * The routerLink is on the name td, not the tr row.
   */
  async openClientProfile(): Promise<void> {
    await this.firstClientNameCell.waitFor({ state: 'visible', timeout: 15000 });
    await this.firstClientNameCell.click();

    // Avoid networkidle — the detail page fires many concurrent API calls
    await this.page.waitForURL(/.*clients\/\d+\/general.*/, {
      timeout: 30000
    });
    await this.performanceHistoryHeading.waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  /**
   * Assert that the client list page is visible.
   */
  async assertClientListVisible(): Promise<void> {
    await expect(this.searchInput).toBeVisible({ timeout: 15000 });
  }

  /**
   * Assert that the create client form is visible.
   */
  async assertCreateFormVisible(): Promise<void> {
    await expect(this.officeSelect).toBeVisible({ timeout: 15000 });
    await expect(this.legalFormSelect).toBeVisible({ timeout: 15000 });
  }

  /**
   * Assert that the client detail page is loaded.
   */
  async assertClientDetailVisible(): Promise<void> {
    await expect(this.performanceHistoryHeading).toBeVisible({ timeout: 15000 });
    await expect(this.page).toHaveURL(/.*clients\/\d+\/general.*/);
  }
}
