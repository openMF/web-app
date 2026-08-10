/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { LOAN_ACCOUNT_ACTION_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { fillDateField, fillIfVisible } from '../material-form-helpers';

/**
 * Loan lifecycle actions this page object covers.
 *
 * These strings are also the URL segment Angular reads as the
 * `:action` route param.
 */
export type LoanAccountAction = 'Approve' | 'Disburse' | 'Reject' | 'Undo Approval' | 'Undo Disbursal';

/**
 * LoanAccountActionPage — Page Object for the loan lifecycle action
 * forms (`/#/clients/:cid/loans-accounts/:lid/actions/:action`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `LOAN_ACCOUNT_ACTION_SELECTORS`
 *   - routes:    `ROUTES.loanAccountAction(...)`
 *
 * ── Two app inconsistencies this class absorbs ──────────────────────
 *
 * **The submit control is labelled "Submit" here but "Confirm" on the
 * savings action forms.** Same logical control, different copy. Both
 * labels live in their respective Layer-2 contracts so no spec has to
 * remember which module it is in.
 *
 * **Undo Approval and Undo Disbursal render no form fields at all** —
 * just a submit button. `waitForLoad()` therefore waits on the submit
 * button rather than on a date input, since that is the only control
 * common to every action in the union.
 *
 * Note also that `loanAction()` navigates with a `productType` query
 * parameter, so the URL assertion deliberately stops at the action
 * segment rather than anchoring on `$`.
 */
export class LoanAccountActionPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param clientId - Owning client id.
   * @param loanId - Loan account id.
   * @param action - Which lifecycle action this form represents.
   */
  constructor(
    page: Page,
    private readonly clientId: number,
    private readonly loanId: number,
    private readonly action: LoanAccountAction
  ) {
    super(page);
    this.url = ROUTES.loanAccountAction(clientId, loanId, action);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /**
   * The primary date input for this action, or `null` for the undo
   * actions which have no fields.
   */
  get dateInput(): Locator | null {
    switch (this.action) {
      case 'Approve':
        return this.page.locator(LOAN_ACCOUNT_ACTION_SELECTORS.approvedOnDateInput);
      case 'Disburse':
        return this.page.locator(LOAN_ACCOUNT_ACTION_SELECTORS.actualDisbursementDateInput);
      case 'Reject':
        return this.page.locator(LOAN_ACCOUNT_ACTION_SELECTORS.rejectedOnDateInput);
      case 'Undo Approval':
      case 'Undo Disbursal':
      default:
        return null;
    }
  }

  /**
   * Expected disbursement date — rendered on the Approve form only,
   * alongside `approvedOnDate`.
   */
  get expectedDisbursementDateInput(): Locator {
    return this.page.locator(LOAN_ACCOUNT_ACTION_SELECTORS.expectedDisbursementDateInput);
  }

  /** Amount input, rendered by `mifosx-input-amount` on the Disburse form. */
  get amountInput(): Locator {
    return this.page.locator(LOAN_ACCOUNT_ACTION_SELECTORS.amountInput).first();
  }

  /** Optional note textarea. */
  get noteInput(): Locator {
    return this.page.locator(LOAN_ACCOUNT_ACTION_SELECTORS.noteInput);
  }

  /** The Submit button. Loan forms label this "Submit", not "Confirm". */
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: LOAN_ACCOUNT_ACTION_SELECTORS.submitButton });
  }

  /** The Cancel button, which routes back to the loan view. */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: LOAN_ACCOUNT_ACTION_SELECTORS.cancelButton });
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the action form to load. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/loans-accounts/${this.loanId}/actions/`));
    await this.waitForVisible(this.submitButton, 30000);
  }

  /**
   * Fill and submit the action form, and wait until the app has
   * navigated away from the action route.
   *
   * The navigation wait is what makes the command *observable*:
   * clicking Submit only starts the request, and every action
   * component navigates solely from its success handler. Without it a
   * spec can read the loan back before Fineract has applied the
   * command and fail with a stale-status message that looks like a
   * broken transition rather than a race.
   *
   * @param data.date - Primary date (approved-on / disbursement-on /
   *   rejected-on) in the tenant display format. Ignored for the undo
   *   actions.
   * @param data.expectedDisbursementDate - Approve form only.
   * @param data.amount - Disburse form only.
   * @param data.note - Optional note.
   */
  async submit(
    data: { date?: string; expectedDisbursementDate?: string; amount?: string; note?: string } = {}
  ): Promise<void> {
    const dateInput = this.dateInput;
    if (dateInput && data.date) {
      await fillDateField(dateInput, data.date);
    }

    if (data.expectedDisbursementDate && (await this.expectedDisbursementDateInput.isVisible())) {
      await fillDateField(this.expectedDisbursementDateInput, data.expectedDisbursementDate);
    }

    if (data.amount && (await this.amountInput.isVisible())) {
      await this.amountInput.fill(data.amount);
      await this.amountInput.blur();
    }

    await fillIfVisible(this.noteInput, data.note);

    await expect(this.submitButton).toBeEnabled({ timeout: 15000 });
    await this.submitButton.click();

    await this.page.waitForURL((url) => !url.hash.includes('/actions/'), { timeout: 30000 });
  }
}
