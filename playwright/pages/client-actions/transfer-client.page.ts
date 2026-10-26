/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { TRANSFER_CLIENT_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';

/**
 * TransferClientPage — Page Object for the Mifos X transfer-client action form.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `TRANSFER_CLIENT_SELECTORS` (form fields)
 *   - routes:    `ROUTES.clientAction(id, 'Transfer Client')`
 *
 * Confirm/Cancel buttons are resolved by accessible name (the value of
 * `TRANSFER_CLIENT_SELECTORS.confirmButton` / `cancelButton`) so the same
 * code path works against the React counterpart.
 *
 * The destination-office dropdown is populated by the `Transfer Client`
 * route resolver (`ClientsService.getOffices()`). The page object
 * exposes `selectDestinationOffice(name)` so specs pick offices by
 * label regardless of the row id assigned by the current tenant seed.
 *
 * Route-encoding note: the action name contains a space, so
 * `ROUTES.clientAction` percent-encodes it to `Transfer%20Client`. The
 * `waitForLoad` regex therefore matches the encoded form — that is
 * what the browser exposes through `page.url()` in Angular's hash
 * router.
 */
export class TransferClientPage extends BasePage {
  readonly url: string;

  /**
   * Builds the transfer-client action page object for a specific client id.
   * @param page - The Playwright Page instance
   * @param clientId - The client id used to build action URLs and locators
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.clientAction(clientId, 'Transfer Client');
  }

  /**
   * Returns the destination office select field.
   */
  get destinationOfficeSelect(): Locator {
    return this.page.locator(TRANSFER_CLIENT_SELECTORS.destinationOfficeSelect);
  }

  /**
   * Returns the transfer date input used by the transfer-client form.
   */
  get transferDateInput(): Locator {
    return this.page.locator(TRANSFER_CLIENT_SELECTORS.transferDateInput);
  }

  /**
   * Returns the optional note textarea used by the transfer-client form.
   */
  get noteInput(): Locator {
    return this.page.locator(TRANSFER_CLIENT_SELECTORS.noteInput);
  }

  /**
   * Returns the form submission control for transferring the client.
   */
  get confirmButton(): Locator {
    return this.page.getByRole('button', { name: TRANSFER_CLIENT_SELECTORS.confirmButton });
  }

  /**
   * Returns the cancel control that navigates back to the client view.
   */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: TRANSFER_CLIENT_SELECTORS.cancelButton });
  }

  /**
   * Returns a specific destination-office option by its visible label.
   * @param name - The visible label of the destination office
   * @returns The locator for the matching destination office option
   */
  destinationOfficeOption(name: string): Locator {
    return this.page.getByRole('option', { name });
  }

  /**
   * Waits for the transfer-client action form to load.
   *
   * Matches both the percent-encoded (`Transfer%20Client`) and raw
   * (`Transfer Client`) forms of the action segment because some
   * browsers normalise the URL after navigation while others preserve
   * the encoding produced by `encodeURIComponent`.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/actions/Transfer(?:%20|\\s)Client$`));
    await this.waitForVisible(this.destinationOfficeSelect, 30000);
  }

  /**
   * Opens the destination office select and chooses the requested office.
   * @param officeName - The visible destination office label to select
   */
  async selectDestinationOffice(officeName: string): Promise<void> {
    await this.destinationOfficeSelect.click();
    await this.destinationOfficeOption(officeName).click();
  }

  /**
   * Completes and submits the transfer-client form.
   * @param destinationOfficeName - The destination office label to select
   * @param transferDate - The transfer date to submit
   * @param note - Optional free-text note stored on the transfer request
   */
  async submitTransfer({
    destinationOfficeName,
    transferDate,
    note
  }: {
    destinationOfficeName: string;
    transferDate: string;
    note?: string;
  }): Promise<void> {
    await this.selectDestinationOffice(destinationOfficeName);

    await this.transferDateInput.fill(transferDate);
    await this.transferDateInput.blur();

    if (note !== undefined) {
      await this.noteInput.fill(note);
      await this.noteInput.blur();
    }

    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
  }

  /**
   * Waits until cancellation returns the browser to the client general view.
   */
  async waitForCancelNavigation(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/general$`));
  }
}
