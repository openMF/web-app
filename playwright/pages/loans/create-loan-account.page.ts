/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { CREATE_LOAN_ACCOUNT_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { fillDateField, fillIfVisible } from '../material-form-helpers';

/** Default wait for the server-computed repayment schedule. */
const SCHEDULE_TIMEOUT_MS = 30000;

/**
 * CreateLoanAccountPage — Page Object for the create-loan-account
 * stepper (`/#/clients/:id/loans-accounts/create`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CREATE_LOAN_ACCOUNT_SELECTORS`
 *   - routes:    `ROUTES.loanAccountCreate(clientId)`
 *
 * This is the most fragile form in the client module, for three
 * reasons that are all worth stating explicitly because each one
 * produces a different, misleading failure if ignored.
 *
 * **1. The product dropdown is a search-select, keyed by short name.**
 * It embeds `ngx-mat-select-search`, and each `mat-option`'s *value*
 * is the product short name while its *visible label* is the product
 * name prefixed by product type ("LOAN : E2E Loan Product"). Clicking
 * by exact name misses. {@link selectProduct} types into the search box
 * to narrow the list, then matches the option by substring.
 *
 * **2. Downstream steps do not exist until a product is chosen.**
 * TERMS/CHARGES are wrapped in `@if (productId)`; REPAYMENT SCHEDULE
 * and PREVIEW additionally in `@if (loansAccountFormValid)`. Filling
 * the principal before the product resolves targets nothing.
 *
 * **3. The repayment schedule is server-computed.**
 * Advancing past TERMS triggers a `/loans/template` round-trip that
 * builds the schedule. Clicking Next again immediately walks past an
 * empty table and reaches a Preview built from stale state.
 * {@link waitForSchedule} waits on a populated row, not on the step
 * header — the header appears before the data arrives.
 *
 * Cross-framework portability: all Material-overlay interaction is
 * delegated to `material-form-helpers`; the React port swaps that one
 * import and keeps this class byte-identical otherwise.
 */
export class CreateLoanAccountPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param clientId - Owning client id.
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.loanAccountCreate(clientId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** The loan product search-select. */
  get productDropdown(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.productDropdown);
  }

  /** The `ngx-mat-select-search` filter input inside the open overlay. */
  get productSearchInput(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.productSearchInput).first();
  }

  /** Submitted-on date input on the DETAILS step. */
  get submittedOnDateInput(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.submittedOnDateInput);
  }

  /** Expected disbursement date input on the DETAILS step. */
  get expectedDisbursementDateInput(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.expectedDisbursementDateInput);
  }

  /** Optional external id input. */
  get externalIdInput(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.externalIdInput);
  }

  /** Principal amount, rendered by `mifosx-input-amount`. */
  get principalInput(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.principalInput).first();
  }

  /** Number of repayments input on the TERMS step. */
  get numberOfRepaymentsInput(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.numberOfRepaymentsInput);
  }

  /** Nominal interest rate per period on the TERMS step. */
  get interestRatePerPeriodInput(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.interestRatePerPeriodInput);
  }

  /** Rows of the server-computed repayment schedule table. */
  get scheduleRows(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.scheduleRow);
  }

  /** Button that requests the repayment schedule from the server. */
  get generateScheduleButton(): Locator {
    return this.page.getByRole('button', { name: CREATE_LOAN_ACCOUNT_SELECTORS.generateScheduleButton });
  }

  /**
   * The Next button of the currently selected step. See the savings
   * counterpart for why this is scoped rather than visibility-filtered.
   */
  get nextButton(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.activeStepNextButton);
  }

  /** The final Submit button on the PREVIEW step. */
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: CREATE_LOAN_ACCOUNT_SELECTORS.submitButton });
  }

  /** Validation errors rendered by the reactive form. */
  get validationErrors(): Locator {
    return this.page.locator(CREATE_LOAN_ACCOUNT_SELECTORS.validationError);
  }

  /** A step header addressed by its visible label. */
  stepHeader(label: string): Locator {
    return this.page.getByRole(CREATE_LOAN_ACCOUNT_SELECTORS.stepHeaderRole, { name: label });
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits until the stepper is mounted and the product select is interactive. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/loans-accounts/create`));
    await this.waitForVisible(this.productDropdown, 30000);
  }

  /**
   * Select a loan product by its visible name.
   *
   * Not delegated to `selectFilteredOption` because that helper opens
   * the trigger and locates the search box in one shot, whereas this
   * dropdown renders its search box *inside* a `mat-option`, so the
   * overlay has to be open before the input can be found. The option
   * is then matched by substring, since the rendered label is prefixed
   * with the product type.
   *
   * Waits for the TERMS-step principal field afterwards — that is the
   * observable signal that `productId` is set and the gated steps have
   * rendered.
   *
   * @param productName - Visible loan product name.
   */
  async selectProduct(productName: string): Promise<void> {
    await this.productDropdown.click();

    // The search box is only *usable* above ngx-mat-select-search's
    // option-count threshold; below it the input still renders but
    // carries `mat-select-search-hidden`. Treating it as required made
    // the page object fail on exactly the small product catalogue a
    // fresh test tenant has. Filtering is an optimisation here — the
    // option match below is what actually selects the product — so a
    // hidden box is skipped rather than waited on.
    if (await this.productSearchInput.isVisible().catch(() => false)) {
      await this.productSearchInput.fill(productName);
    }

    const option = this.page.getByRole('option').filter({ hasText: productName }).first();
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();

    await this.waitForVisible(this.submittedOnDateInput, 15000);
  }

  /**
   * Fill the DETAILS step. Assumes a product is already selected.
   *
   * @param data.submittedOnDate - Submitted-on date, display format.
   * @param data.expectedDisbursementDate - Expected disbursement date.
   * @param data.externalId - Optional external id.
   */
  async fillDetailsStep(data: {
    submittedOnDate: string;
    expectedDisbursementDate: string;
    externalId?: string;
  }): Promise<void> {
    await fillDateField(this.submittedOnDateInput, data.submittedOnDate);
    await fillDateField(this.expectedDisbursementDateInput, data.expectedDisbursementDate);
    await fillIfVisible(this.externalIdInput, data.externalId);
  }

  /**
   * Fill the TERMS step, overriding only what the caller supplies.
   *
   * Every field here is pre-populated from the product template, so
   * the happy path can pass an empty object and still produce a valid
   * application.
   *
   * @param data.principal - Optional principal override.
   * @param data.numberOfRepayments - Optional repayment count override.
   * @param data.interestRate - Optional nominal interest rate override.
   */
  async fillTermsStep(
    data: { principal?: string; numberOfRepayments?: string; interestRate?: string } = {}
  ): Promise<void> {
    await this.waitForVisible(this.principalInput, 15000);
    if (data.principal) {
      await this.principalInput.fill(data.principal);
      await this.principalInput.blur();
    }
    await fillIfVisible(this.numberOfRepaymentsInput, data.numberOfRepayments);
    await fillIfVisible(this.interestRatePerPeriodInput, data.interestRate);
  }

  /**
   * Advance one step using the visible Next button.
   *
   * Asserts enabled first so an invalid step reports "expected
   * enabled" rather than timing out several steps later on an element
   * that was never going to appear.
   */
  async goToNextStep(): Promise<void> {
    const next = this.nextButton.first();
    await next.waitFor({ state: 'visible', timeout: 15000 });
    await expect(next).toBeEnabled({ timeout: 15000 });
    await next.click();
  }

  /**
   * Request the repayment schedule and wait until it has rendered at
   * least one row.
   *
   * ── Why the button click is required ────────────────────────────
   *
   * The schedule step renders its table shell — headers and a zeroed
   * total row — immediately, but the body stays empty until
   * "Generate Repayment Schedule" triggers the server round-trip.
   * Waiting on the step header alone is therefore doubly wrong: the
   * header appears as soon as `loansAccountFormValid` flips, and the
   * schedule would never arrive regardless.
   *
   * The click is skipped only when a schedule already exists, so this
   * method stays safe to call more than once.
   */
  async waitForSchedule(): Promise<void> {
    const firstRow = this.scheduleRows.first();
    // Skip the trigger only when a schedule already exists (rows are
    // present) — the button is removed after generation, so this stays
    // safe to call more than once. Crucially, WAIT for the trigger to
    // appear rather than probing its visibility once: the schedule step
    // mounts asynchronously after Next, so a one-shot check races the
    // mount, skips the required click, and leaves the body empty — the
    // exact failure this method exists to prevent, and one that only
    // surfaces on slower (CI) runners.
    if (!(await firstRow.isVisible().catch(() => false))) {
      await this.generateScheduleButton.waitFor({ state: 'visible', timeout: SCHEDULE_TIMEOUT_MS });
      await this.generateScheduleButton.click();
    }
    await expect(firstRow).toBeVisible({ timeout: SCHEDULE_TIMEOUT_MS });
  }

  /**
   * Drive the full happy path: product → details → terms → charges →
   * repayment schedule → preview → submit.
   *
   * @param data.productName - Visible loan product name.
   * @param data.submittedOnDate - Submitted-on date, display format.
   * @param data.expectedDisbursementDate - Expected disbursement date.
   * @param data.principal - Optional principal override.
   * @param data.numberOfRepayments - Optional repayment count override.
   * @param data.interestRate - Optional interest rate override.
   * @param data.externalId - Optional external id.
   */
  async submitApplication(data: {
    productName: string;
    submittedOnDate: string;
    expectedDisbursementDate: string;
    principal?: string;
    numberOfRepayments?: string;
    interestRate?: string;
    externalId?: string;
  }): Promise<void> {
    await this.selectProduct(data.productName);
    await this.fillDetailsStep(data);
    await this.goToNextStep();

    await this.fillTermsStep(data);
    await this.goToNextStep();

    // CHARGES — optional, skipped on the happy path.
    await this.goToNextStep();

    // REPAYMENT SCHEDULE — server-computed, must be populated first.
    await this.waitForSchedule();
    await this.goToNextStep();

    // PREVIEW.
    await this.waitForVisible(this.submitButton, 15000);
    await this.submitButton.click();
  }
}
