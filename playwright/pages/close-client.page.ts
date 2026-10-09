/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { CLOSE_CLIENT_SELECTORS } from '../config/selectors';
import { ROUTES } from '../config/routes';

/**
 * CloseClientPage - Page Object for the Mifos X close-client action form.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CLOSE_CLIENT_SELECTORS` (form fields)
 *   - routes:    `ROUTES.clientAction(id, 'Close')`
 *
 * Confirm/Cancel buttons are resolved by accessible name (the value of
 * `CLOSE_CLIENT_SELECTORS.confirmButton` / `cancelButton`) so the same
 * code path works against the React counterpart.
 */
export class CloseClientPage extends BasePage {
  readonly url: string;

  /**
   * Builds the close-client action page object for a specific client id.
   * @param page - The Playwright Page instance
   * @param clientId - The client id used to build action URLs and locators
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.clientAction(clientId, 'Close');
  }

  /**
   * Returns the closure date input used by the close-client form.
   */
  get closureDateInput(): Locator {
    return this.page.locator(CLOSE_CLIENT_SELECTORS.closureDateInput);
  }

  /**
   * Returns the closure reason select field.
   */
  get closureReasonSelect(): Locator {
    return this.page.locator(CLOSE_CLIENT_SELECTORS.closureReasonSelect);
  }

  /**
   * Returns the form submission control for closing the client.
   */
  get confirmButton(): Locator {
    return this.page.getByRole('button', { name: CLOSE_CLIENT_SELECTORS.confirmButton });
  }

  /**
   * Returns the cancel control that navigates back to the client view.
   */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: CLOSE_CLIENT_SELECTORS.cancelButton });
  }

  /**
   * Returns a specific closure reason option by its visible label.
   * @param name - The visible label of the closure reason
   * @returns The locator for the matching closure reason option
   */
  closureReasonOption(name: string): Locator {
    return this.page.getByRole('option', { name });
  }

  /**
   * Waits for the close-client action form to load.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/actions/Close$`));
    await this.waitForVisible(this.closureDateInput, 30000);
  }

  /**
   * Opens the reason select and chooses the requested closure reason.
   * @param reasonName - The visible closure reason label to select
   */
  async selectClosureReason(reasonName: string): Promise<void> {
    await this.closureReasonSelect.click();
    await this.closureReasonOption(reasonName).click();
  }

  /**
   * Completes and submits the close-client form.
   * @param closureDate - The closure date to submit
   * @param reasonName - The closure reason label to select
   */
  async submitClosure({ closureDate, reasonName }: { closureDate: string; reasonName: string }): Promise<void> {
    await this.closureDateInput.fill(closureDate);
    await this.closureDateInput.blur();

    await this.selectClosureReason(reasonName);

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
