/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { REACTIVATE_CLIENT_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';

/**
 * ReactivateClientPage — Page Object for the Mifos X reactivate-client action form.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `REACTIVATE_CLIENT_SELECTORS` (form fields)
 *   - routes:    `ROUTES.clientAction(id, 'Reactivate')`
 *
 * Confirm/Cancel buttons are resolved by accessible name (the value of
 * `REACTIVATE_CLIENT_SELECTORS.confirmButton` / `cancelButton`) so the same
 * code path works against the React counterpart.
 *
 * Reactivation is the inverse of Close — the form carries a single
 * `reactivationDate` control, no reason dropdown. The React counterpart
 * models the same shape.
 */
export class ReactivateClientPage extends BasePage {
  readonly url: string;

  /**
   * Builds the reactivate-client action page object for a specific client id.
   * @param page - The Playwright Page instance
   * @param clientId - The client id used to build action URLs and locators
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.clientAction(clientId, 'Reactivate');
  }

  /**
   * Returns the reactivation date input used by the reactivate-client form.
   */
  get reactivationDateInput(): Locator {
    return this.page.locator(REACTIVATE_CLIENT_SELECTORS.reactivationDateInput);
  }

  /**
   * Returns the form submission control for reactivating the client.
   */
  get confirmButton(): Locator {
    return this.page.getByRole('button', { name: REACTIVATE_CLIENT_SELECTORS.confirmButton });
  }

  /**
   * Returns the cancel control that navigates back to the client view.
   */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: REACTIVATE_CLIENT_SELECTORS.cancelButton });
  }

  /**
   * Waits for the reactivate-client action form to load.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/actions/Reactivate$`));
    await this.waitForVisible(this.reactivationDateInput, 30000);
  }

  /**
   * Completes and submits the reactivate-client form.
   * @param reactivationDate - The reactivation date to submit
   */
  async submitReactivation({ reactivationDate }: { reactivationDate: string }): Promise<void> {
    await this.reactivationDateInput.fill(reactivationDate);
    await this.reactivationDateInput.blur();

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
