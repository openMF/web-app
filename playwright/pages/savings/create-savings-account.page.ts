/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { CREATE_SAVINGS_ACCOUNT_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { selectOption, fillDateField, fillIfVisible } from '../material-form-helpers';

/**
 * CreateSavingsAccountPage — Page Object for the create-savings-account
 * stepper (`/#/clients/:id/savings-accounts/create`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CREATE_SAVINGS_ACCOUNT_SELECTORS`
 *   - routes:    `ROUTES.savingsAccountCreate(clientId)`
 *
 * ── Why the step order is enforced rather than jumped ───────────────
 *
 * The template gates two things on runtime state:
 *
 *   1. Every DETAILS field except the product dropdown sits inside
 *      `@if (savingsProductSelected)`. Filling submitted-on before
 *      picking a product targets an element that does not exist.
 *   2. The PREVIEW step sits inside `@if (savingsAccountFormValid)`,
 *      so its header is absent until DETAILS and TERMS are satisfied.
 *
 * `submitApplication()` therefore walks the stepper with Next clicks
 * instead of clicking step headers directly. That is slower but it is
 * the only sequence the component actually supports, and it mirrors
 * what a user does.
 *
 * Cross-framework portability: all Material-overlay interaction is
 * delegated to `material-form-helpers`. The React port swaps that one
 * import for `radix-form-helpers` (identical signatures) and changes
 * nothing else in this class.
 */
export class CreateSavingsAccountPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param clientId - Owning client id; savings routes are nested
   *   under the client, so this is required to build the URL.
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.savingsAccountCreate(clientId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** The product dropdown — the only DETAILS field present on load. */
  get productDropdown(): Locator {
    return this.page.locator(CREATE_SAVINGS_ACCOUNT_SELECTORS.productDropdown);
  }

  /** Submitted-on date input. Only exists once a product is selected. */
  get submittedOnDateInput(): Locator {
    return this.page.locator(CREATE_SAVINGS_ACCOUNT_SELECTORS.submittedOnDateInput);
  }

  /** Optional external id input on the DETAILS step. */
  get externalIdInput(): Locator {
    return this.page.locator(CREATE_SAVINGS_ACCOUNT_SELECTORS.externalIdInput);
  }

  /** Nominal annual interest rate on the TERMS step. */
  get nominalAnnualInterestRateInput(): Locator {
    return this.page.locator(CREATE_SAVINGS_ACCOUNT_SELECTORS.nominalAnnualInterestRateInput);
  }

  /**
   * The Next button of the currently selected step.
   *
   * Scoped through `activeStepNextButton` rather than filtering all
   * Next buttons by visibility: a vertical stepper animates between
   * steps, and during that animation both the outgoing and incoming
   * panels report visible, so a visibility filter picks a button that
   * is about to be detached.
   */
  get nextButton(): Locator {
    return this.page.locator(CREATE_SAVINGS_ACCOUNT_SELECTORS.activeStepNextButton);
  }

  /** The final Submit button, rendered only on the PREVIEW step. */
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: CREATE_SAVINGS_ACCOUNT_SELECTORS.submitButton });
  }

  /** Validation errors rendered by the reactive form. */
  get validationErrors(): Locator {
    return this.page.locator(CREATE_SAVINGS_ACCOUNT_SELECTORS.validationError);
  }

  /** A step header addressed by its visible label. */
  stepHeader(label: string): Locator {
    return this.page.getByRole(CREATE_SAVINGS_ACCOUNT_SELECTORS.stepHeaderRole, { name: label });
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits until the stepper is mounted and the product dropdown is interactive. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/savings-accounts/create`));
    await this.waitForVisible(this.productDropdown, 30000);
  }

  /**
   * Select a savings product by its visible name.
   *
   * Waits for `submittedOnDateInput` afterwards because that field is
   * the observable signal that `savingsProductSelected` flipped and
   * the template re-rendered. Without the wait, the next `fill()`
   * races the conditional block.
   *
   * @param productName - Visible product name, e.g. the shared E2E product.
   */
  async selectProduct(productName: string): Promise<void> {
    await selectOption(this.page, this.productDropdown, productName);
    await this.waitForVisible(this.submittedOnDateInput, 15000);
  }

  /**
   * Fill the DETAILS step. Assumes a product is already selected.
   *
   * @param data.submittedOnDate - Date in the tenant display format.
   * @param data.externalId - Optional external id.
   */
  async fillDetailsStep(data: { submittedOnDate: string; externalId?: string }): Promise<void> {
    await fillDateField(this.submittedOnDateInput, data.submittedOnDate);
    await fillIfVisible(this.externalIdInput, data.externalId);
  }

  /**
   * Advance one step using the visible Next button.
   *
   * Asserts the button is enabled first so a step whose form is
   * invalid fails with "expected enabled" rather than a silent no-op
   * that only surfaces as a confusing timeout three steps later.
   */
  async goToNextStep(): Promise<void> {
    const next = this.nextButton.first();
    await next.waitFor({ state: 'visible', timeout: 15000 });
    await expect(next).toBeEnabled({ timeout: 15000 });
    await next.click();
  }

  /**
   * Drive the full happy path: product → details → terms → charges →
   * preview → submit.
   *
   * TERMS and CHARGES are pre-populated from the product template, so
   * the happy path only needs to click through them. `interestRate` is
   * exposed for specs that want to override the product default.
   *
   * @param data.productName - Visible savings product name.
   * @param data.submittedOnDate - Submitted-on date, display format.
   * @param data.externalId - Optional external id.
   * @param data.interestRate - Optional nominal annual interest rate override.
   */
  async submitApplication(data: {
    productName: string;
    submittedOnDate: string;
    externalId?: string;
    interestRate?: string;
  }): Promise<void> {
    await this.selectProduct(data.productName);
    await this.fillDetailsStep(data);
    await this.goToNextStep();

    // TERMS — defaults come from the product template.
    await this.waitForVisible(this.nominalAnnualInterestRateInput, 15000);
    await fillIfVisible(this.nominalAnnualInterestRateInput, data.interestRate);
    await this.goToNextStep();

    // CHARGES — optional, skipped on the happy path.
    await this.goToNextStep();

    // PREVIEW — only rendered once `savingsAccountFormValid` is true.
    await this.waitForVisible(this.submitButton, 15000);
    await this.submitButton.click();
  }
}
