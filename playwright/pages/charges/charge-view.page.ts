/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { CHARGE_VIEW_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { fillDateField } from '../material-form-helpers';

/**
 * ChargeViewPage — Page Object for the client charge detail view
 * (`/#/clients/:id/charges/:chargeId`) and its pay form (`.../pay`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CHARGE_VIEW_SELECTORS`
 *   - routes:    `ROUTES.clientChargeView(...)`, `ROUTES.clientChargePay(...)`
 *
 * ── No confirmation dialogs ─────────────────────────────────────────
 *
 * Both Waive and Delete act immediately. Delete then navigates back to
 * the client General tab; Waive stays put and refreshes in place. That
 * asymmetry is why {@link deleteCharge} waits for a URL change while
 * {@link waiveCharge} cannot, and instead leaves verification to the
 * caller — usually an API read-back, which is the only unambiguous
 * signal available.
 */
export class ChargeViewPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param clientId - Owning client id.
   * @param chargeId - Client charge id.
   */
  constructor(
    page: Page,
    private readonly clientId: number,
    private readonly chargeId: number
  ) {
    super(page);
    this.url = ROUTES.clientChargeView(clientId, chargeId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  get payButton(): Locator {
    return this.page.getByRole('button', { name: CHARGE_VIEW_SELECTORS.payButton, exact: true });
  }

  get waiveButton(): Locator {
    return this.page.getByRole('button', { name: CHARGE_VIEW_SELECTORS.waiveButton });
  }

  get deleteButton(): Locator {
    return this.page.getByRole('button', { name: CHARGE_VIEW_SELECTORS.deleteButton });
  }

  get payAmountInput(): Locator {
    return this.page.locator(CHARGE_VIEW_SELECTORS.payAmountInput);
  }

  get payDateInput(): Locator {
    return this.page.locator(CHARGE_VIEW_SELECTORS.payDateInput);
  }

  get paySubmitButton(): Locator {
    return this.page.getByRole('button', { name: CHARGE_VIEW_SELECTORS.paySubmitButton });
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the charge detail view to load. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/charges/${this.chargeId}(?:/|$)`));
    await this.waitForVisible(this.deleteButton, 30000);
  }

  /** Navigate directly to the pay form for this charge. */
  async openPayForm(): Promise<void> {
    await this.page.goto(ROUTES.clientChargePay(this.clientId, this.chargeId));
    await this.waitForVisible(this.payAmountInput, 30000);
  }

  /**
   * Fill and submit the pay form, then wait for the app to leave it.
   *
   * @param data.amount - Payment amount.
   * @param data.date - Transaction date in the tenant display format.
   */
  async payCharge(data: { amount: string; date: string }): Promise<void> {
    await this.payAmountInput.fill(data.amount);
    await this.payAmountInput.blur();
    await fillDateField(this.payDateInput, data.date);

    await expect(this.paySubmitButton).toBeEnabled({ timeout: 15000 });
    await this.paySubmitButton.click();

    await this.page.waitForURL((url) => !url.hash.includes('/pay'), { timeout: 30000 });
  }

  /**
   * Waive this charge.
   *
   * Fires immediately and refreshes in place, so there is no URL or
   * dialog to wait on. Callers verify through the API.
   */
  async waiveCharge(): Promise<void> {
    await expect(this.waiveButton).toBeEnabled({ timeout: 15000 });
    await this.waiveButton.click();
  }

  /**
   * Delete this charge and wait for the redirect to the General tab.
   */
  async deleteCharge(): Promise<void> {
    await expect(this.deleteButton).toBeEnabled({ timeout: 15000 });
    await this.deleteButton.click();
    await this.page.waitForURL(new RegExp(`/clients/${this.clientId}/general`), { timeout: 30000 });
  }
}
