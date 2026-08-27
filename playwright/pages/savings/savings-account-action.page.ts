/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { SAVINGS_ACCOUNT_ACTION_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { fillDateField, fillIfVisible } from '../material-form-helpers';

/**
 * Savings lifecycle actions this page object covers.
 *
 * These strings are also the URL segment Angular reads as the `:name`
 * route param, so the union doubles as the route contract.
 */
export type SavingsAccountAction = 'Approve' | 'Activate' | 'Reject' | 'Undo Approval';

/**
 * SavingsAccountActionPage — Page Object for the savings lifecycle
 * action forms (`/#/clients/:cid/savings-accounts/:sid/actions/:name`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `SAVINGS_ACCOUNT_ACTION_SELECTORS`
 *   - routes:    `ROUTES.savingsAccountAction(...)`
 *
 * ── Why one class covers four actions ───────────────────────────────
 *
 * Approve, Activate, Reject and Undo Approval are four separate
 * Angular components, but structurally they are the same form: an
 * optional date, an optional note, Confirm and Cancel. Giving each one
 * its own page object would produce four near-identical files that
 * drift apart on maintenance — the client-action pages in this suite
 * already show that pattern's cost.
 *
 * The one real difference is the date field's form-control name, which
 * varies per action (`approvedOnDate`, `activatedOnDate`,
 * `rejectedOnDate`) and is absent entirely for Undo Approval. That
 * mapping lives in {@link dateInput} and nowhere else.
 */
export class SavingsAccountActionPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param clientId - Owning client id.
   * @param savingsId - Savings account id.
   * @param action - Which lifecycle action this form represents.
   */
  constructor(
    page: Page,
    private readonly clientId: number,
    private readonly savingsId: number,
    private readonly action: SavingsAccountAction
  ) {
    super(page);
    this.url = ROUTES.savingsAccountAction(clientId, savingsId, action);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /**
   * The date input for this action, or `null` when the action has no
   * date field (Undo Approval).
   *
   * Returning `null` rather than an empty locator makes the "this
   * action has no date" case explicit at every call site instead of
   * failing later as a timeout on an element that never existed.
   */
  get dateInput(): Locator | null {
    switch (this.action) {
      case 'Approve':
        return this.page.locator(SAVINGS_ACCOUNT_ACTION_SELECTORS.approvedOnDateInput);
      case 'Activate':
        return this.page.locator(SAVINGS_ACCOUNT_ACTION_SELECTORS.activatedOnDateInput);
      case 'Reject':
        return this.page.locator(SAVINGS_ACCOUNT_ACTION_SELECTORS.rejectedOnDateInput);
      case 'Undo Approval':
      default:
        return null;
    }
  }

  /** The optional note textarea. */
  get noteInput(): Locator {
    return this.page.locator(SAVINGS_ACCOUNT_ACTION_SELECTORS.noteInput);
  }

  /** The Confirm button. Savings forms label this "Confirm", not "Submit". */
  get confirmButton(): Locator {
    return this.page.getByRole('button', { name: SAVINGS_ACCOUNT_ACTION_SELECTORS.confirmButton });
  }

  /** The Cancel button, which routes back to the account view. */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: SAVINGS_ACCOUNT_ACTION_SELECTORS.cancelButton });
  }

  // ── Actions ────────────────────────────────────────────────────────

  /**
   * Waits for the action form to load.
   *
   * Waits on the Confirm button rather than the date input because
   * Undo Approval renders no fields at all — Confirm is the only
   * control common to every action in the union.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(`/clients/${this.clientId}/savings-accounts/${this.savingsId}/actions/`)
    );
    await this.waitForVisible(this.confirmButton, 30000);
  }

  /**
   * Fill and submit the action form, and wait until the app has
   * navigated away from the action route.
   *
   * ── Why the navigation wait is part of submit ───────────────────
   *
   * Clicking Confirm only *starts* the command request. Returning
   * immediately lets a spec read the account back through the API
   * before Fineract has processed it, so the assertion sees the old
   * status and the test fails with a message ("expected Active,
   * received Approved") that looks like a broken transition rather
   * than a race.
   *
   * Waiting for the route to change is the reliable signal, because
   * every action component navigates only in its success handler.
   * Note it cannot be a wait for one specific destination: approve
   * lands on `/general`, activate on `/transactions`. So the condition
   * is "no longer on an action route".
   *
   * @param data.date - Date in the tenant display format. Ignored when
   *   the action has no date field.
   * @param data.note - Optional note.
   */
  async submit(data: { date?: string; note?: string } = {}): Promise<void> {
    const dateInput = this.dateInput;
    if (dateInput && data.date) {
      await fillDateField(dateInput, data.date);
    }
    await fillIfVisible(this.noteInput, data.note);

    await expect(this.confirmButton).toBeEnabled({ timeout: 15000 });
    await this.confirmButton.click();

    await this.page.waitForURL((url) => !url.hash.includes('/actions/'), { timeout: 30000 });
  }
}
