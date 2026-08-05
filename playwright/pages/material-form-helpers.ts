/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Layer 3 — Angular Material form-interaction helpers.
 *
 * Angular Material renders `<mat-select>` options, datepicker
 * calendars, and dialogs into a CDK overlay that lives OUTSIDE the
 * component's DOM subtree. Driving any of them therefore takes a
 * two-step click sequence (open the trigger, then act on the overlay)
 * plus an explicit visibility wait, because the overlay is animated in.
 * Repeating that sequence inline in every page object is how the
 * suite would end up with a dozen subtly-different dropdown helpers.
 *
 * ── Why these are standalone functions, not `BasePage` methods ──────
 *
 * `BasePage` is deliberately framework-agnostic: its docstring states
 * that staying free of Angular/Material specifics is exactly what lets
 * the same class back both the Angular and React page objects
 * (proposal §8). A `selectMatOption` method on `BasePage` would break
 * that contract — `mat-option` means nothing to a React port built on
 * Radix/ShadCN, and a React contributor inheriting the method would
 * have no way to act on it.
 *
 * So the swap point stays where §8 puts it: at the framework-specific
 * layer. The React port ships its own `radix-form-helpers.ts` exporting
 * the SAME function signatures (`selectOption`, `fillDateField`,
 * `fillIfVisible`, …). Page objects change one import path; their
 * method bodies and public API do not change at all.
 *
 * ── Usage ───────────────────────────────────────────────────────────
 *
 * ```ts
 * import { selectOption, fillIfVisible } from './material-form-helpers';
 *
 * export class CreateSavingsAccountPage extends BasePage {
 *   async selectProduct(name: string): Promise<void> {
 *     await selectOption(this.page, this.productDropdown, name);
 *   }
 * }
 * ```
 */

import { expect, Locator, Page } from '@playwright/test';

/** Default wait for a CDK overlay to animate in. */
const DEFAULT_OVERLAY_TIMEOUT_MS = 10000;

/** Options accepted by {@link selectOption}. */
export interface SelectOptionOptions {
  /** Overlay visibility timeout in ms. Defaults to 10 000. */
  timeout?: number;
  /**
   * Require the option label to match exactly. Defaults to `false`,
   * because Material option text is frequently padded by the
   * `translateKey` pipe and by nested `<span>` whitespace.
   */
  exact?: boolean;
}

/**
 * Open a `<mat-select>` and pick the option whose visible text matches
 * `optionLabel`.
 *
 * Waits for the overlay option to become visible before clicking —
 * Material animates the overlay in, so an immediate click races the
 * animation and lands on nothing.
 *
 * @param page - The Playwright page, needed to reach the CDK overlay
 *   which is rendered outside the component subtree.
 * @param trigger - Locator for the `<mat-select>` element itself.
 * @param optionLabel - Visible text of the option to pick.
 * @param options - See {@link SelectOptionOptions}.
 */
export async function selectOption(
  page: Page,
  trigger: Locator,
  optionLabel: string,
  options: SelectOptionOptions = {}
): Promise<void> {
  const timeout = options.timeout ?? DEFAULT_OVERLAY_TIMEOUT_MS;
  await trigger.click();
  const option = page.getByRole('option', { name: optionLabel, exact: options.exact ?? false });
  await option.first().waitFor({ state: 'visible', timeout });
  await option.first().click();
}

/**
 * Open a searchable `<mat-select>` (one wrapped in `mat-select-filter`),
 * type into its filter box, then pick the matching option.
 *
 * The loan-product dropdown on the create-loan-account stepper uses
 * this pattern, and its options are keyed by product NAME rather than
 * id — so the plain {@link selectOption} path cannot reach an option
 * that the filter has not yet revealed.
 *
 * @param page - The Playwright page.
 * @param trigger - Locator for the `<mat-select>` element.
 * @param searchInput - Locator for the filter input inside the overlay.
 * @param optionLabel - Visible text of the option to pick; also used
 *   as the search term.
 * @param options - See {@link SelectOptionOptions}.
 */
export async function selectFilteredOption(
  page: Page,
  trigger: Locator,
  searchInput: Locator,
  optionLabel: string,
  options: SelectOptionOptions = {}
): Promise<void> {
  const timeout = options.timeout ?? DEFAULT_OVERLAY_TIMEOUT_MS;
  await trigger.click();
  await searchInput.waitFor({ state: 'visible', timeout });
  await searchInput.fill(optionLabel);

  const option = page.getByRole('option', { name: optionLabel, exact: options.exact ?? false });
  await option.first().waitFor({ state: 'visible', timeout });
  await option.first().click();
}

/**
 * Fill a Material datepicker input by typing the formatted date.
 *
 * Typing beats driving the calendar popup: the popup requires N clicks
 * to reach an arbitrary month, and its markup differs between Material
 * versions. The trade-off is that the string must match the tenant's
 * configured display format (`DD MMMM YYYY` in the Angular app's
 * `dateFormat` setting) — which is NOT the same string as the API's
 * `dd MMMM yyyy` wire format, even though both render identically.
 *
 * @param input - Locator for the datepicker's `<input>`.
 * @param value - Date string in the tenant's display format.
 */
export async function fillDateField(input: Locator, value: string): Promise<void> {
  await input.click();
  await input.fill(value);
  // Blur so Material's `dateInput`/`dateChange` events fire and the
  // bound form control updates. Without this the control can stay
  // pristine and leave the step's Next button disabled.
  await input.press('Escape');
  await input.blur();
}

/**
 * Fill an input only when it is currently visible.
 *
 * Several Mifos forms render fields conditionally on tenant
 * configuration — the client address dialog is built from
 * `/fieldconfiguration/ADDRESS`, and the add-charge form swaps its
 * date controls based on the selected charge's time type. A helper
 * that no-ops on an absent field keeps page objects free of
 * `if (await x.isVisible())` noise.
 *
 * Passing `undefined` is also a no-op, so callers can forward optional
 * data fields directly.
 *
 * @param locator - Locator for the input.
 * @param value - Value to fill, or `undefined` to skip.
 */
export async function fillIfVisible(locator: Locator, value: string | undefined): Promise<void> {
  if (value === undefined) {
    return;
  }
  if (await locator.isVisible()) {
    await locator.fill(value);
  }
}

/**
 * Click a button inside an open `<mat-dialog>`, then wait for the
 * dialog to close.
 *
 * Many client sub-entity flows (address, identifiers, documents, note
 * edit) submit through a dialog. Asserting the dialog is gone before
 * returning prevents the next action from clicking through a
 * still-animating overlay backdrop.
 *
 * @param page - The Playwright page.
 * @param buttonName - Accessible name of the dialog button, e.g. `'Add'`.
 * @param options - Optional dismissal timeout in ms. Defaults to 10 000.
 */
export async function confirmDialog(page: Page, buttonName: string, options: { timeout?: number } = {}): Promise<void> {
  const timeout = options.timeout ?? DEFAULT_OVERLAY_TIMEOUT_MS;
  const dialog = page.locator('mat-dialog-container');
  await dialog.waitFor({ state: 'visible', timeout });
  await dialog.getByRole('button', { name: buttonName }).first().click();
  await expect(dialog).toBeHidden({ timeout });
}
