/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { SAVINGS_TRANSACTION_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { selectOption, fillDateField, fillIfVisible } from '../material-form-helpers';

/** The two money-movement transactions this page object drives. */
export type SavingsTransactionType = 'Deposit' | 'Withdrawal';

/**
 * SavingsTransactionPage — Page Object for the savings deposit and
 * withdrawal forms
 * (`/#/clients/:cid/savings-accounts/:sid/actions/Deposit|Withdrawal`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `SAVINGS_TRANSACTION_SELECTORS`
 *   - routes:    `ROUTES.savingsAccountAction(...)`
 *
 * ── Why submitting takes two clicks ─────────────────────────────────
 *
 * Unlike the lifecycle actions, this form is itself a **linear**
 * three-step mat-stepper: Transaction Details → Confirm Transaction
 * Details → Transaction Complete. `linear` means the confirmation step
 * cannot be skipped, so `submitTransaction()` clicks Next and then
 * Submit. Treating it as a single-shot form is the most likely reason
 * a naive port of this spec would hang on the Submit button.
 *
 * ── Why the amount selector is component-scoped ─────────────────────
 *
 * The amount field comes from the shared `mifosx-input-amount`
 * component, which binds through `[formControl]` rather than
 * `formControlName`. There is no `formcontrolname` attribute to target,
 * so the contract scopes to the component element instead.
 */
export class SavingsTransactionPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param clientId - Owning client id.
   * @param savingsId - Savings account id.
   * @param type - `'Deposit'` or `'Withdrawal'`.
   */
  constructor(
    page: Page,
    private readonly clientId: number,
    private readonly savingsId: number,
    private readonly type: SavingsTransactionType
  ) {
    super(page);
    this.url = ROUTES.savingsAccountAction(clientId, savingsId, type);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** Transaction date input. */
  get transactionDateInput(): Locator {
    return this.page.locator(SAVINGS_TRANSACTION_SELECTORS.transactionDateInput);
  }

  /** Transaction amount input, rendered by `mifosx-input-amount`. */
  get transactionAmountInput(): Locator {
    return this.page.locator(SAVINGS_TRANSACTION_SELECTORS.transactionAmountInput).first();
  }

  /** Payment type dropdown. */
  get paymentTypeDropdown(): Locator {
    return this.page.locator(SAVINGS_TRANSACTION_SELECTORS.paymentTypeDropdown);
  }

  /** Optional note textarea. */
  get noteInput(): Locator {
    return this.page.locator(SAVINGS_TRANSACTION_SELECTORS.noteInput);
  }

  /** Next button that advances to the confirmation step. */
  get nextButton(): Locator {
    return this.page.getByRole('button', { name: SAVINGS_TRANSACTION_SELECTORS.nextButton });
  }

  /** Submit button on the confirmation step. */
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: SAVINGS_TRANSACTION_SELECTORS.submitButton });
  }

  /** Done button on the third "Transaction Complete" step. */
  get doneButton(): Locator {
    return this.page.getByRole('button', { name: SAVINGS_TRANSACTION_SELECTORS.doneButton });
  }

  /** Success heading shown once the transaction has posted. */
  get successHeading(): Locator {
    return this.page.getByText(SAVINGS_TRANSACTION_SELECTORS.successHeading);
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the transaction form to load. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(`/clients/${this.clientId}/savings-accounts/${this.savingsId}/actions/${this.type}`)
    );
    await this.waitForVisible(this.transactionDateInput, 30000);
  }

  /**
   * Fill the transaction details step without submitting.
   *
   * Split out from {@link submitTransaction} so validation specs can
   * assert on a partially-filled form.
   *
   * Payment type is `required` on this form, so when the caller does
   * not name one the first configured option is selected. Leaving it
   * blank would leave Next disabled and surface as an opaque timeout
   * rather than a validation message. Payment types are tenant
   * configuration, so there is no label safe to hard-code here.
   *
   * @param data.date - Transaction date in the tenant display format.
   * @param data.amount - Transaction amount as a string.
   * @param data.paymentType - Optional payment type label; defaults to
   *   the first available option.
   * @param data.note - Optional note.
   */
  async fillTransactionDetails(data: {
    date: string;
    amount: string;
    paymentType?: string;
    note?: string;
  }): Promise<void> {
    await fillDateField(this.transactionDateInput, data.date);
    await this.transactionAmountInput.fill(data.amount);
    await this.transactionAmountInput.blur();

    if (data.paymentType) {
      await selectOption(this.page, this.paymentTypeDropdown, data.paymentType);
    } else {
      await this.selectFirstPaymentType();
    }
    await fillIfVisible(this.noteInput, data.note);
  }

  /**
   * Select whichever payment type the tenant lists first.
   *
   * Used when a spec does not care which payment type is applied — it
   * only cares that the balance moved.
   */
  async selectFirstPaymentType(): Promise<void> {
    await this.paymentTypeDropdown.click();
    const option = this.page.getByRole('option').first();
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();
  }

  /**
   * Fill the details step, advance through the confirmation step,
   * submit, and dismiss the completion receipt.
   *
   * The third step is easy to miss: the form does not navigate away
   * after Submit, it advances to a "Transaction Successful" receipt
   * and parks there. A spec that submits and then waits for the
   * account view times out on a page where the transaction has in fact
   * already posted — a confusing failure that says nothing about the
   * transaction itself. Clicking Done is what routes back.
   *
   * @param data - See {@link fillTransactionDetails}.
   */
  async submitTransaction(data: { date: string; amount: string; paymentType?: string; note?: string }): Promise<void> {
    await this.fillTransactionDetails(data);

    await expect(this.nextButton).toBeEnabled({ timeout: 15000 });
    await this.nextButton.click();

    // Confirmation step — mandatory, the stepper is `linear`.
    await this.waitForVisible(this.submitButton, 15000);
    await this.submitButton.click();

    // Completion step — asserting the receipt appeared means a
    // server-side rejection fails here, with the form still on screen,
    // rather than surfacing later as an unexplained balance mismatch.
    await this.waitForVisible(this.successHeading, 30000);
    await this.doneButton.click();
  }
}
