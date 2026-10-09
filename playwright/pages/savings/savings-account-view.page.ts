/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { SAVINGS_ACCOUNT_VIEW_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { BEHAVIOR } from '../../config/behavior';

/**
 * SavingsAccountViewPage — Page Object for the savings account general
 * view (`/#/clients/:cid/savings-accounts/:sid/general`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `SAVINGS_ACCOUNT_VIEW_SELECTORS`
 *   - routes:    `ROUTES.savingsAccountView(clientId, savingsId)`
 *   - behavior:  `BEHAVIOR.overlayDismissNeeded`
 *
 * ── Why `chooseAction()` retries through the More submenu ───────────
 *
 * `SavingsButtonsConfiguration` splits the action menu by status: for
 * a pending account `Approve` is a top-level entry while `Reject` is
 * nested under "More". Specs should not have to know which bucket an
 * action falls into — that is presentation
 * detail that has already changed once in this app's history. So
 * `chooseAction()` looks top-level first and falls back to the submenu,
 * and callers just name the action.
 */
export class SavingsAccountViewPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param clientId - Owning client id.
   * @param savingsId - Savings account id.
   */
  constructor(
    page: Page,
    private readonly clientId: number,
    private readonly savingsId: number
  ) {
    super(page);
    this.url = ROUTES.savingsAccountView(clientId, savingsId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** The account actions (hamburger) menu trigger. */
  get actionsButton(): Locator {
    return this.page.locator(SAVINGS_ACCOUNT_VIEW_SELECTORS.actionsButton);
  }

  /** The nested "More" submenu trigger inside the actions menu. */
  get moreMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: SAVINGS_ACCOUNT_VIEW_SELECTORS.moreSubmenuTrigger });
  }

  /** A menu item addressed by its visible label. */
  actionMenuItem(name: string): Locator {
    return this.page.getByRole('menuitem', { name, exact: true });
  }

  /** The colour-coded status dot; its tooltip carries the status text. */
  get statusBadge(): Locator {
    return this.page.locator(SAVINGS_ACCOUNT_VIEW_SELECTORS.statusBadge);
  }

  /**
   * The account overview table holding current and available balance.
   *
   * Absent for rejected and pending accounts — the template wraps it
   * in `@if (!status.rejected && !status.submittedAndPendingApproval)`.
   */
  get accountOverview(): Locator {
    return this.page.locator(SAVINGS_ACCOUNT_VIEW_SELECTORS.accountBalanceRow);
  }

  /** Success/error snackbar container. */
  get successSnackbar(): Locator {
    return this.page.locator(SAVINGS_ACCOUNT_VIEW_SELECTORS.successSnackbar);
  }

  /** The Material overlay backdrop. */
  get overlayBackdrop(): Locator {
    return this.page.locator(SAVINGS_ACCOUNT_VIEW_SELECTORS.overlayBackdrop);
  }

  /** A tab in the account-view navigation, by accessible name. */
  tab(name: string): Locator {
    return this.page.getByRole(SAVINGS_ACCOUNT_VIEW_SELECTORS.tabRole, { name });
  }

  // ── Actions ────────────────────────────────────────────────────────

  /**
   * Waits until the savings account view is loaded and interactive.
   *
   * The URL check deliberately stops at the account id rather than
   * anchoring on `/general`. Savings actions do not all return to the
   * same tab — approve lands on `/transactions`, and activate's own
   * Cancel button routes to `../../transactions` — so anchoring on
   * `/general` would make every post-action wait fail for a reason
   * that has nothing to do with the transition under test. The actions
   * button is present on every tab, so it remains a valid readiness
   * signal.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(`/clients/${this.clientId}/savings-accounts/${this.savingsId}(?:/|$)`)
    );
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
   * Opens the requested action, transparently reaching into the "More"
   * submenu when the action is not a top-level entry.
   *
   * @param name - Action label, e.g. `'Approve'`, `'Reject'`, `'Deposit'`.
   */
  async chooseAction(name: string): Promise<void> {
    await this.openActionsMenu();

    const topLevel = this.actionMenuItem(name);
    if (await topLevel.isVisible().catch(() => false)) {
      await topLevel.click();
      return;
    }

    // Not a top-level entry — it lives under "More".
    await this.waitForVisible(this.moreMenuItem, 10000);
    await this.moreMenuItem.click();
    await this.waitForVisible(this.actionMenuItem(name), 10000);
    await this.actionMenuItem(name).click();
  }

  /** Activates a tab by its visible label. */
  async gotoTab(name: string): Promise<void> {
    const tab = this.tab(name);
    await this.waitForVisible(tab, 10000);
    await tab.click();
  }
}
