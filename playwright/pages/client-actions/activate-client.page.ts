/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { ACTIVATE_CLIENT_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';

/**
 * ActivateClientPage — Page Object for the Mifos X activate-client action form.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `ACTIVATE_CLIENT_SELECTORS` (form fields)
 *   - routes:    `ROUTES.clientAction(id, 'Activate')`
 *
 * Confirm/Cancel buttons are resolved by accessible name (the value of
 * `ACTIVATE_CLIENT_SELECTORS.confirmButton` / `cancelButton`) so the same
 * code path works against the React counterpart.
 *
 * Cross-framework portability: the class extends {@link BasePage}, whose
 * `navigate()` uses the `url` field set from `ROUTES`. The React port
 * exports a `RouterProvider`-based counterpart that resolves the same
 * logical action path — swapping frameworks is a `ROUTES` change, not a
 * page-object rewrite.
 */
export class ActivateClientPage extends BasePage {
  readonly url: string;

  /**
   * Builds the activate-client action page object for a specific client id.
   * @param page - The Playwright Page instance
   * @param clientId - The client id used to build action URLs and locators
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.clientAction(clientId, 'Activate');
  }

  /**
   * Returns the activation date input used by the activate-client form.
   */
  get activationDateInput(): Locator {
    return this.page.locator(ACTIVATE_CLIENT_SELECTORS.activationDateInput);
  }

  /**
   * Returns the form submission control for activating the client.
   */
  get confirmButton(): Locator {
    return this.page.getByRole('button', { name: ACTIVATE_CLIENT_SELECTORS.confirmButton });
  }

  /**
   * Returns the cancel control that navigates back to the client view.
   */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: ACTIVATE_CLIENT_SELECTORS.cancelButton });
  }

  /**
   * Waits for the activate-client action form to load.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/actions/Activate$`));
    await this.waitForVisible(this.activationDateInput, 30000);
  }

  /**
   * Completes and submits the activate-client form.
   * @param activationDate - The activation date to submit
   */
  async submitActivation({ activationDate }: { activationDate: string }): Promise<void> {
    await this.activationDateInput.fill(activationDate);
    await this.activationDateInput.blur();

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
