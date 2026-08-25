/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { ADD_CHARGE_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { selectOption, fillDateField, fillIfVisible } from '../material-form-helpers';

/**
 * AddChargePage — Page Object for the client Add Charge form
 * (`/#/clients/:id/actions/Add Charge`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `ADD_CHARGE_SELECTORS`
 *   - routes:    `ROUTES.clientAction(id, 'Add Charge')`
 *
 * ── The form does not exist until a charge is chosen ────────────────
 *
 * On first render this page is a single dropdown. Everything else —
 * amount, the calculation/time echoes, and whichever date control
 * applies — is inside `@if (chargeDetails)`, and `chargeDetails` is
 * only assigned when the `GET /charges/{id}?template=true` triggered by
 * the dropdown's `valueChanges` resolves.
 *
 * So {@link selectCharge} does not return until `amount` is present.
 * Without that wait, callers race the network and fail on a control
 * that is genuinely absent rather than merely not-yet-enabled, which
 * reads as a broken selector instead of a timing bug.
 *
 * ── Which date control appears ──────────────────────────────────────
 *
 * Driven by the definition's charge time type, not by anything the
 * caller passes: specified-due-date charges render `dueDate`, annual
 * and monthly render `feeOnMonthDay`, monthly adds `feeInterval`.
 * {@link fillDates} fills whichever is on screen, so one call site
 * works for every variant.
 */
export class AddChargePage extends BasePage {
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
    this.url = ROUTES.clientAction(clientId, 'Add Charge');
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** The charge definition dropdown — the only control present initially. */
  get chargeDropdown(): Locator {
    return this.page.locator(ADD_CHARGE_SELECTORS.chargeDropdown);
  }

  /** Amount. Appears only once a charge definition is selected. */
  get amountInput(): Locator {
    return this.page.locator(ADD_CHARGE_SELECTORS.amountInput);
  }

  /** Charge calculation type — rendered disabled, for assertion only. */
  get chargeCalculationTypeDropdown(): Locator {
    return this.page.locator(ADD_CHARGE_SELECTORS.chargeCalculationTypeDropdown);
  }

  /** Charge time type — rendered disabled, for assertion only. */
  get chargeTimeTypeDropdown(): Locator {
    return this.page.locator(ADD_CHARGE_SELECTORS.chargeTimeTypeDropdown);
  }

  /** Due date. Present only for specified-due-date charges. */
  get dueDateInput(): Locator {
    return this.page.locator(ADD_CHARGE_SELECTORS.dueDateInput);
  }

  /** Due-on month/day. Present only for annual and monthly charges. */
  get feeOnMonthDayInput(): Locator {
    return this.page.locator(ADD_CHARGE_SELECTORS.feeOnMonthDayInput);
  }

  /** Repeat interval. Present only for monthly charges. */
  get feeIntervalInput(): Locator {
    return this.page.locator(ADD_CHARGE_SELECTORS.feeIntervalInput);
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: ADD_CHARGE_SELECTORS.submitButton });
  }

  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: ADD_CHARGE_SELECTORS.cancelButton });
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the form to be reachable. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/actions/`));
    await this.waitForVisible(this.chargeDropdown, 30000);
  }

  /**
   * Select a charge definition and wait for its template to land.
   *
   * The dropdown renders each option as `"<name> (<currency name>)"`,
   * so the caller's plain definition name will not match exactly —
   * hence substring matching via a regex rather than `selectOption`'s
   * exact name lookup.
   *
   * @param chargeName - Definition name, matched as a substring.
   */
  async selectCharge(chargeName: string): Promise<void> {
    await this.chargeDropdown.click();
    const option = this.page.getByRole('option').filter({ hasText: chargeName }).first();
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();

    // The conditional block below the dropdown is the observable proof
    // that the charge template request resolved.
    //
    // The timeout is deliberately longer than this suite's norm. The
    // dropdown is populated by the route resolver, but the per-charge
    // template is a *separate* request fired on selection — and on a
    // cold JVM that first call has been observed taking over 30s. A
    // shorter wait fails here with "amount input not visible", which
    // reads as a broken selector rather than a slow backend.
    await this.waitForVisible(this.amountInput, 60000);
  }

  /**
   * Fill whichever date control this charge variant renders.
   *
   * Both are optional from the caller's point of view: passing a value
   * for a control the form did not render is a silent no-op, which
   * keeps one call site working across all three time types.
   *
   * @param data.dueDate - Specified-due-date charges.
   * @param data.feeOnMonthDay - Annual/monthly charges.
   * @param data.feeInterval - Monthly charges.
   */
  async fillDates(data: { dueDate?: string; feeOnMonthDay?: string; feeInterval?: string }): Promise<void> {
    if (data.dueDate && (await this.dueDateInput.isVisible().catch(() => false))) {
      await fillDateField(this.dueDateInput, data.dueDate);
    }
    if (data.feeOnMonthDay && (await this.feeOnMonthDayInput.isVisible().catch(() => false))) {
      await fillDateField(this.feeOnMonthDayInput, data.feeOnMonthDay);
    }
    await fillIfVisible(this.feeIntervalInput, data.feeInterval);
  }

  /**
   * Drive the whole form: select, override amount, fill dates, submit,
   * then wait for the navigation the success handler performs.
   *
   * Waiting for the route to leave `/actions/` is what makes the
   * create observable — see the savings action page object for the
   * same reasoning. Without it a spec can read the client's charges
   * back before Fineract has stored the new one.
   *
   * @param data.chargeName - Definition name, matched as a substring.
   * @param data.amount - Optional amount override; the definition's
   *   amount is prefilled.
   * @param data.dueDate - Specified-due-date charges.
   * @param data.feeOnMonthDay - Annual/monthly charges.
   * @param data.feeInterval - Monthly charges.
   */
  async submitCharge(data: {
    chargeName: string;
    amount?: string;
    dueDate?: string;
    feeOnMonthDay?: string;
    feeInterval?: string;
  }): Promise<void> {
    await this.selectCharge(data.chargeName);

    if (data.amount) {
      await this.amountInput.fill(data.amount);
      await this.amountInput.blur();
    }

    await this.fillDates(data);

    await expect(this.submitButton).toBeEnabled({ timeout: 15000 });
    await this.submitButton.click();

    await this.page.waitForURL((url) => !url.hash.includes('/actions/'), { timeout: 30000 });
  }

  /**
   * Read the disabled charge-time-type echo.
   *
   * Exposed so a spec can prove the form reacted to the *specific*
   * definition it picked, rather than to any definition at all.
   */
  async getChargeTimeTypeText(): Promise<string> {
    return (await this.chargeTimeTypeDropdown.innerText()).trim();
  }

  /** Read the disabled charge-calculation-type echo. */
  async getChargeCalculationTypeText(): Promise<string> {
    return (await this.chargeCalculationTypeDropdown.innerText()).trim();
  }

  /**
   * Select an option in an arbitrary dropdown on this form.
   *
   * Thin passthrough kept so specs never import the Material helper
   * directly — that import is the seam the React port replaces.
   */
  async selectDropdownOption(dropdown: Locator, optionName: string): Promise<void> {
    await selectOption(this.page, dropdown, optionName);
  }
}
