/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { CLIENT_VIEW_SELECTORS } from '../config/selectors';
import { ROUTES } from '../config/routes';
import { BEHAVIOR } from '../config/behavior';

/**
 * ClientViewPage - Page Object for the Mifos X client general view.
 *
 * Consumes Layer-2 contracts:
 *   - selectors:  `CLIENT_VIEW_SELECTORS` (overlay, snackbar, rows)
 *   - routes:     `ROUTES.clientView(id)`, `ROUTES.clientPersonalData(id)`
 *   - behavior:   `BEHAVIOR.overlayDismissNeeded`
 *
 * Role-based locators (`getByRole`) are intentionally retained because
 * they resolve identically against the React counterpart and form part
 * of the cross-framework contract.
 */
export class ClientViewPage extends BasePage {
  readonly url: string;

  /**
   * Builds the client general-view page object for a specific client id.
   * @param page - The Playwright Page instance
   * @param clientId - The client id used to build view URLs and locators
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.clientView(clientId);
  }

  /**
   * Returns the top-level client actions trigger button.
   */
  get clientActionsButton(): Locator {
    return this.page.getByRole('button', { name: 'Client actions' });
  }

  /**
   * Returns the nested Actions submenu trigger inside the client actions menu.
   */
  get actionsMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: CLIENT_VIEW_SELECTORS.actionsSubmenuTrigger });
  }

  /**
   * Returns a specific item inside the Actions submenu by its visible label.
   */
  actionMenuItem(name: string): Locator {
    return this.page.getByRole('menuitem', { name });
  }

  /**
   * Returns the personal data tab used to inspect post-action client fields.
   */
  get personalDataTab(): Locator {
    return this.page.getByRole('tab', { name: CLIENT_VIEW_SELECTORS.personalDataTab });
  }

  /**
   * Returns the snackbar container used for success and error notifications.
   */
  get successSnackbar(): Locator {
    return this.page.locator(CLIENT_VIEW_SELECTORS.successSnackbar);
  }

  /**
   * Returns the active overlay backdrop rendered by Angular Material menus.
   */
  get overlayBackdrop(): Locator {
    return this.page.locator(CLIENT_VIEW_SELECTORS.overlayBackdrop);
  }

  /**
   * Returns the personal-data field that shows the client's closed date.
   */
  closedDateValue(): Locator {
    return this.page
      .locator(CLIENT_VIEW_SELECTORS.closedDateRow, { hasText: 'Closed Date' })
      .locator(CLIENT_VIEW_SELECTORS.closedDateValue);
  }

  /**
   * Dismisses an open Material overlay so subsequent clicks are not blocked.
   *
   * No-op on frameworks where `BEHAVIOR.overlayDismissNeeded` is false
   * (React/shadcn), keeping the call safe to invoke from shared specs.
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

  /**
   * Waits until the client general view is loaded and interactive.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/general$`));
    await this.waitForVisible(this.clientActionsButton, 30000);
  }

  /**
   * Opens the top-level client actions menu.
   */
  async openActionsMenu(): Promise<void> {
    await this.clientActionsButton.click();
    await this.waitForVisible(this.actionsMenuItem, 10000);
  }

  /**
   * Opens the nested Actions submenu within the client actions menu.
   */
  async openActionsSubmenu(): Promise<void> {
    await this.openActionsMenu();
    await this.actionsMenuItem.hover();
    await this.actionsMenuItem.click();
  }

  /**
   * Opens the requested client action from the nested Actions submenu.
   */
  async chooseAction(name: string): Promise<void> {
    await this.openActionsSubmenu();
    await this.waitForVisible(this.actionMenuItem(name), 10000);
    await this.actionMenuItem(name).click();
  }

  /**
   * Navigates to the personal data tab for field-level verification.
   */
  async gotoPersonalDataTab(): Promise<void> {
    await this.personalDataTab.click();
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/personal-data$`));
  }
}
