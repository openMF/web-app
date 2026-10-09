/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { REJECT_CLIENT_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';

/**
 * RejectClientPage — Page Object for the Mifos X reject-client action form.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `REJECT_CLIENT_SELECTORS` (form fields)
 *   - routes:    `ROUTES.clientAction(id, 'Reject')`
 *
 * Confirm/Cancel buttons are resolved by accessible name (the value of
 * `REJECT_CLIENT_SELECTORS.confirmButton` / `cancelButton`) so the same
 * code path works against the React counterpart.
 *
 * The reason dropdown is populated by the `Reject` route resolver via
 * `getClientCommandTemplate('reject')`. The page object exposes a
 * `selectRejectionReason(name)` helper so specs pick options by label
 * regardless of the code-value id assigned by the current tenant seed.
 */
export class RejectClientPage extends BasePage {
  readonly url: string;

  /**
   * Builds the reject-client action page object for a specific client id.
   * @param page - The Playwright Page instance
   * @param clientId - The client id used to build action URLs and locators
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.clientAction(clientId, 'Reject');
  }

  /**
   * Returns the rejection date input used by the reject-client form.
   */
  get rejectionDateInput(): Locator {
    return this.page.locator(REJECT_CLIENT_SELECTORS.rejectionDateInput);
  }

  /**
   * Returns the rejection reason select field.
   */
  get rejectionReasonSelect(): Locator {
    return this.page.locator(REJECT_CLIENT_SELECTORS.rejectionReasonSelect);
  }

  /**
   * Returns the form submission control for rejecting the client.
   */
  get confirmButton(): Locator {
    return this.page.getByRole('button', { name: REJECT_CLIENT_SELECTORS.confirmButton });
  }

  /**
   * Returns the cancel control that navigates back to the client view.
   */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: REJECT_CLIENT_SELECTORS.cancelButton });
  }

  /**
   * Returns a specific rejection reason option by its visible label.
   * @param name - The visible label of the rejection reason
   * @returns The locator for the matching rejection reason option
   */
  rejectionReasonOption(name: string): Locator {
    return this.page.getByRole('option', { name });
  }

  /**
   * Waits for the reject-client action form to load.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/actions/Reject$`));
    await this.waitForVisible(this.rejectionDateInput, 30000);
  }

  /**
   * Opens the reason select and chooses the requested rejection reason.
   * @param reasonName - The visible rejection reason label to select
   */
  async selectRejectionReason(reasonName: string): Promise<void> {
    await this.rejectionReasonSelect.click();
    await this.rejectionReasonOption(reasonName).click();
  }

  /**
   * Completes and submits the reject-client form.
   * @param rejectionDate - The rejection date to submit
   * @param reasonName - The rejection reason label to select
   */
  async submitRejection({ rejectionDate, reasonName }: { rejectionDate: string; reasonName: string }): Promise<void> {
    await this.rejectionDateInput.fill(rejectionDate);
    await this.rejectionDateInput.blur();

    await this.selectRejectionReason(reasonName);

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
