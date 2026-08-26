/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { LOAN_ACCOUNT_VIEW_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { BEHAVIOR } from '../../config/behavior';

/**
 * LoanAccountViewPage — Page Object for the loan account general view
 * (`/#/clients/:cid/loans-accounts/:lid/general`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `LOAN_ACCOUNT_VIEW_SELECTORS`
 *   - routes:    `ROUTES.loanAccountView(clientId, loanId)`
 *   - behavior:  `BEHAVIOR.overlayDismissNeeded`
 *
 * ── Why `chooseAction()` searches three menus ───────────────────────
 *
 * `LoansAccountButtonConfiguration` spreads actions across a top-level
 * menu plus nested "Payments" and "More" submenus, and which bucket an
 * action lands in changes with account status. `Approve` is top-level
 * when pending; `Write Off` is under "More" when active. Encoding that
 * table into specs would make them break whenever the app reshuffles
 * its menu, so `chooseAction()` probes top-level, then Payments, then
 * More, and callers just name the action.
 */
export class LoanAccountViewPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param clientId - Owning client id.
   * @param loanId - Loan account id.
   */
  constructor(
    page: Page,
    private readonly clientId: number,
    private readonly loanId: number
  ) {
    super(page);
    this.url = ROUTES.loanAccountView(clientId, loanId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** The account actions (hamburger) menu trigger. */
  get actionsButton(): Locator {
    return this.page.locator(LOAN_ACCOUNT_VIEW_SELECTORS.actionsButton);
  }

  /** The nested "More" submenu trigger. */
  get moreMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: LOAN_ACCOUNT_VIEW_SELECTORS.moreSubmenuTrigger });
  }

  /** The nested "Payments" submenu trigger. */
  get paymentsMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: LOAN_ACCOUNT_VIEW_SELECTORS.paymentsSubmenuTrigger });
  }

  /** A menu item addressed by its visible label. */
  actionMenuItem(name: string): Locator {
    return this.page.getByRole('menuitem', { name, exact: true });
  }

  /** The colour-coded status dot; its tooltip carries the status text. */
  get statusBadge(): Locator {
    return this.page.locator(LOAN_ACCOUNT_VIEW_SELECTORS.statusBadge);
  }

  /** Success/error snackbar container. */
  get successSnackbar(): Locator {
    return this.page.locator(LOAN_ACCOUNT_VIEW_SELECTORS.successSnackbar);
  }

  /** The Material overlay backdrop. */
  get overlayBackdrop(): Locator {
    return this.page.locator(LOAN_ACCOUNT_VIEW_SELECTORS.overlayBackdrop);
  }

  /** A tab in the account-view navigation, by accessible name. */
  tab(name: string): Locator {
    return this.page.getByRole(LOAN_ACCOUNT_VIEW_SELECTORS.tabRole, { name });
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits until the loan general view is loaded and interactive. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/loans-accounts/${this.loanId}/general`));
    await this.waitForVisible(this.actionsButton, 30000);
  }

  /**
   * Dismisses an open Material overlay so subsequent clicks land.
   * No-op where `BEHAVIOR.overlayDismissNeeded` is false (React).
   */
  async dismissOverlay(): Promise<void> {
    if (!BEHAVIOR.overlayDismissNeeded) {
      return;
    }
    if (await this.overlayBackdrop.isVisible()) {
      await this.overlayBackdrop.click({ force: true });
      await this.overlayBackdrop.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  /** Opens the account actions menu. */
  async openActionsMenu(): Promise<void> {
    await this.actionsButton.click();
    await this.page.getByRole('menu').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Opens the requested action, probing the top-level menu and then
   * each nested submenu in turn.
   *
   * @param name - Action label, e.g. `'Approve'`, `'Disburse'`,
   *   `'Undo Approval'`, `'Undo Disbursal'`, `'Reject'`.
   */
  async chooseAction(name: string): Promise<void> {
    await this.openActionsMenu();

    const target = this.actionMenuItem(name);
    if (await target.isVisible().catch(() => false)) {
      await target.click();
      return;
    }

    for (const submenu of [
      this.paymentsMenuItem,
      this.moreMenuItem
    ]) {
      if (!(await submenu.isVisible().catch(() => false))) {
        continue;
      }
      await submenu.click();
      if (await target.isVisible().catch(() => false)) {
        await target.click();
        return;
      }
    }

    throw new Error(
      `LoanAccountViewPage.chooseAction: "${name}" was not found in the top-level menu, Payments, or More. ` +
        `Check the account status — LoansAccountButtonConfiguration only renders actions valid for the current state.`
    );
  }

  /** Activates a tab by its visible label. */
  async gotoTab(name: string): Promise<void> {
    const tab = this.tab(name);
    await this.waitForVisible(tab, 10000);
    await tab.click();
  }
}
