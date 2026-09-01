/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { CLIENT_CHARGES_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';

/**
 * ClientChargesPage — Page Object for the "Upcoming Charges" table on
 * the client General tab, and the read-only Charges Overview it links
 * to (`/#/clients/:id/charges/overview`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CLIENT_CHARGES_SELECTORS`
 *   - routes:    `ROUTES.clientView(id)`, `ROUTES.clientChargesOverview(id)`
 *
 * ── The row-click trap ──────────────────────────────────────────────
 *
 * Each table row is itself a `routerLink` to the charge detail view,
 * and the Pay/Waive buttons sit *inside* that row, relying on
 * `routeEdit($event)` to stop propagation. A click that lands a few
 * pixels off the button navigates instead of acting, and the resulting
 * failure looks like "the waive did nothing" rather than "we ended up
 * on another page". {@link waiveCharge} and {@link openChargeDetail}
 * are therefore separate, explicit operations.
 *
 * ── Waive is immediate ──────────────────────────────────────────────
 *
 * Unlike most destructive actions in this app, the row-level waive
 * fires straight away with no confirmation dialog. It also refetches
 * the table rather than navigating, so the observable signal is the
 * row's Waived cell changing — not a URL change.
 */
export class ClientChargesPage extends BasePage {
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
    this.url = ROUTES.clientView(clientId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** All rows of the Upcoming Charges table. */
  get chargeRows(): Locator {
    return this.page.locator(CLIENT_CHARGES_SELECTORS.chargeRow);
  }

  /** The "Charges Overview →" link in the section header. */
  get chargesOverviewLink(): Locator {
    return this.page.getByRole('link', { name: CLIENT_CHARGES_SELECTORS.chargesOverviewLink });
  }

  /** Rows of the read-only Charges Overview table. */
  get overviewRows(): Locator {
    return this.page.locator(CLIENT_CHARGES_SELECTORS.overviewRow);
  }

  /**
   * Locate a charge row by its visible name.
   *
   * @param chargeName - Charge definition name shown in the Name cell.
   */
  chargeRowByName(chargeName: string): Locator {
    return this.chargeRows.filter({ hasText: chargeName }).first();
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the client General tab to load. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/general`));
  }

  /**
   * Wait until a charge with this name is listed.
   *
   * @param chargeName - Charge definition name.
   */
  async waitForCharge(chargeName: string): Promise<void> {
    await expect(this.chargeRowByName(chargeName)).toBeVisible({ timeout: 30000 });
  }

  /**
   * Read one cell of a charge's row.
   *
   * Columns are Name, Due as of, Due, Paid, Waived, Outstanding,
   * Actions — indexed from 0.
   *
   * @param chargeName - Charge definition name.
   * @param columnIndex - Zero-based cell index.
   */
  async getChargeCellText(chargeName: string, columnIndex: number): Promise<string> {
    const cell = this.chargeRowByName(chargeName).locator('td').nth(columnIndex);
    return (await cell.innerText()).trim();
  }

  /**
   * Click the row's waive button and wait for the table to reflect it.
   *
   * The button carries only an icon, so it is addressed positionally
   * within the Actions cell: Pay first, Waive second. Addressing it by
   * icon class would bind the contract to Font Awesome.
   *
   * @param chargeName - Charge definition name.
   */
  async waiveCharge(chargeName: string): Promise<void> {
    const row = this.chargeRowByName(chargeName);
    await expect(row).toBeVisible({ timeout: 30000 });
    // Waive is the second action button (Pay first) — address it by
    // position per this method's contract, not `.last()`, so a future
    // third action button cannot silently shift the target.
    await row.locator('button').nth(1).click();

    // Waive refetches the table in place rather than navigating, so the
    // Waived cell (column 4, per getChargeCellText's column map) turning
    // non-zero is the only observable completion signal — as the class
    // doc promises.
    await expect(row.locator('td').nth(4)).not.toHaveText(/^0(\.0+)?$/, { timeout: 30000 });
  }

  /**
   * Open the charge detail view by clicking the row itself.
   *
   * Targets the Name cell rather than the row, so the click can never
   * land on an action button by accident.
   *
   * @param chargeName - Charge definition name.
   */
  async openChargeDetail(chargeName: string): Promise<void> {
    const row = this.chargeRowByName(chargeName);
    await expect(row).toBeVisible({ timeout: 30000 });
    await row.locator('td').first().click();
    await this.page.waitForURL(/\/charges\/\d+/, { timeout: 30000 });
  }

  /** Navigate to the read-only Charges Overview tab. */
  async openChargesOverview(): Promise<void> {
    await this.page.goto(ROUTES.clientChargesOverview(this.clientId));
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/charges/overview`));
  }
}
