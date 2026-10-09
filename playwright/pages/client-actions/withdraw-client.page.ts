/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { WITHDRAW_CLIENT_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';

/**
 * WithdrawClientPage — Page Object for the Mifos X withdraw-client action form.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `WITHDRAW_CLIENT_SELECTORS` (form fields)
 *   - routes:    `ROUTES.clientAction(id, 'Withdraw')`
 *
 * Confirm/Cancel buttons are resolved by accessible name (the value of
 * `WITHDRAW_CLIENT_SELECTORS.confirmButton` / `cancelButton`) so the same
 * code path works against the React counterpart.
 *
 * The reason dropdown is populated by the `Withdraw` route resolver via
 * `getClientCommandTemplate('withdraw')`. The page object exposes a
 * `selectWithdrawalReason(name)` helper so specs pick options by label
 * regardless of the code-value id assigned by the current tenant seed.
 */
export class WithdrawClientPage extends BasePage {
  readonly url: string;

  /**
   * Builds the withdraw-client action page object for a specific client id.
   * @param page - The Playwright Page instance
   * @param clientId - The client id used to build action URLs and locators
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.clientAction(clientId, 'Withdraw');
  }

  /**
   * Returns the withdrawal date input used by the withdraw-client form.
   */
  get withdrawalDateInput(): Locator {
    return this.page.locator(WITHDRAW_CLIENT_SELECTORS.withdrawalDateInput);
  }

  /**
   * Returns the withdrawal reason select field.
   */
  get withdrawalReasonSelect(): Locator {
    return this.page.locator(WITHDRAW_CLIENT_SELECTORS.withdrawalReasonSelect);
  }

  /**
   * Returns the form submission control for withdrawing the client.
   */
  get confirmButton(): Locator {
    return this.page.getByRole('button', { name: WITHDRAW_CLIENT_SELECTORS.confirmButton });
  }

  /**
   * Returns the cancel control that navigates back to the client view.
   */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: WITHDRAW_CLIENT_SELECTORS.cancelButton });
  }

  /**
   * Returns a specific withdrawal reason option by its visible label.
   * @param name - The visible label of the withdrawal reason
   * @returns The locator for the matching withdrawal reason option
   */
  withdrawalReasonOption(name: string): Locator {
    return this.page.getByRole('option', { name });
  }

  /**
   * Waits for the withdraw-client action form to load.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/actions/Withdraw$`));
    await this.waitForVisible(this.withdrawalDateInput, 30000);
  }

  /**
   * Opens the reason select and chooses the requested withdrawal reason.
   * @param reasonName - The visible withdrawal reason label to select
   */
  async selectWithdrawalReason(reasonName: string): Promise<void> {
    await this.withdrawalReasonSelect.click();
    await this.withdrawalReasonOption(reasonName).click();
  }

  /**
   * Completes and submits the withdraw-client form.
   * @param withdrawalDate - The withdrawal date to submit
   * @param reasonName - The withdrawal reason label to select
   */
  async submitWithdrawal({
    withdrawalDate,
    reasonName
  }: {
    withdrawalDate: string;
    reasonName: string;
  }): Promise<void> {
    await this.withdrawalDateInput.fill(withdrawalDate);
    await this.withdrawalDateInput.blur();

    await this.selectWithdrawalReason(reasonName);

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
