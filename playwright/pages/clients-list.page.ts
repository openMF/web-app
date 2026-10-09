/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { CLIENTS_LIST_SELECTORS } from '../config/selectors';
import { ROUTES } from '../config/routes';

/**
 * ClientsListPage - Page Object for the Mifos X clients list (`/#/clients`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CLIENTS_LIST_SELECTORS` (toolbar, list rows, empty state)
 *   - routes:    `ROUTES.clients`
 *
 * Public method signatures (`search`, `clickCreateClient`, `openClient`)
 * are framework-agnostic so the React port can implement the same
 * surface on top of a shadcn `<DataTable>` without changing specs.
 *
 * Role-based locators are preferred where the underlying element
 * exposes a stable accessible name (`Create Client`, `Import Client`,
 * pagination buttons). They resolve identically against the React
 * counterpart and form part of the cross-framework contract.
 */
export class ClientsListPage extends BasePage {
  /**
   * The URL path for the clients list, sourced from the Layer-2 route
   * registry.
   */
  readonly url = ROUTES.clients;

  /**
   * Creates a new ClientsListPage instance.
   * @param page - The Playwright Page instance
   */
  constructor(page: Page) {
    super(page);
  }

  // ── Toolbar ────────────────────────────────────────────────────────

  /**
   * Returns the search input that filters the list by displayName.
   */
  get searchInput(): Locator {
    return this.page.locator(CLIENTS_LIST_SELECTORS.searchInput);
  }

  /**
   * Returns the clear-search (×) button that appears once a query is typed.
   */
  get searchClearButton(): Locator {
    return this.page.locator(CLIENTS_LIST_SELECTORS.searchClearButton);
  }

  /**
   * Returns the "Show Closed Accounts" toggle.
   */
  get showClosedToggle(): Locator {
    return this.page.locator(CLIENTS_LIST_SELECTORS.showClosedToggle);
  }

  /**
   * Returns the primary "Create Client" CTA.
   *
   * Resolved by accessible name so the same locator works against the
   * React port (anchor / button with the same visible label).
   */
  get createClientButton(): Locator {
    return this.page.getByRole('link', { name: CLIENTS_LIST_SELECTORS.createClientButton });
  }

  /**
   * Returns the "Import Client" secondary CTA.
   */
  get importClientButton(): Locator {
    return this.page.getByRole('link', { name: CLIENTS_LIST_SELECTORS.importClientButton });
  }

  /**
   * Returns the indeterminate progress bar shown while the list loads.
   */
  get loadingBar(): Locator {
    return this.page.locator(CLIENTS_LIST_SELECTORS.loadingBar);
  }

  /**
   * Returns the result count badge ("123 clients").
   */
  get countBadge(): Locator {
    return this.page.locator(CLIENTS_LIST_SELECTORS.countBadge);
  }

  // ── List / rows ────────────────────────────────────────────────────

  /**
   * Returns the list container that wraps the rendered rows.
   */
  get list(): Locator {
    return this.page.locator(CLIENTS_LIST_SELECTORS.list);
  }

  /**
   * Returns all rendered client rows on the current page.
   */
  get rows(): Locator {
    return this.page.locator(CLIENTS_LIST_SELECTORS.row);
  }

  /**
   * Returns the row matching the given displayName, scoped to its name cell.
   *
   * Uses exact text matching to avoid ambiguous results when one name
   * is a substring of another (e.g. "John" vs "Johnny").
   * @param name - The exact visible displayName to match
   */
  rowByName(name: string): Locator {
    return this.rows.filter({
      has: this.page.locator(CLIENTS_LIST_SELECTORS.rowName).getByText(name, { exact: true })
    });
  }

  /**
   * Returns the empty-state container ("No client was found").
   */
  get emptyState(): Locator {
    return this.page.locator(CLIENTS_LIST_SELECTORS.emptyState);
  }

  /**
   * Returns the pagination "Next page" control.
   */
  get nextPageButton(): Locator {
    return this.page.getByRole('button', { name: CLIENTS_LIST_SELECTORS.nextPageButton });
  }

  /**
   * Returns the pagination "Previous page" control.
   */
  get previousPageButton(): Locator {
    return this.page.getByRole('button', { name: CLIENTS_LIST_SELECTORS.previousPageButton });
  }

  // ── Actions ────────────────────────────────────────────────────────

  /**
   * Waits until the clients list page is loaded and the toolbar is interactive.
   *
   * The regex anchors to the bare list route (`/#/clients` or `/clients`)
   * and rejects sub-routes like `/clients/create` or `/clients/123/general`.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(/\/#\/clients$|\/clients(?:\?[^/]*)?$/);
    await this.waitForVisible(this.searchInput, 30000);
  }

  /**
   * Fills the search input and submits via Enter, then waits for the
   * debounced result set to settle.
   * @param query - The search query to type
   */
  async search(query: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clears the search input via the inline clear (×) button.
   */
  async clearSearch(): Promise<void> {
    if (await this.searchClearButton.isVisible()) {
      await this.searchClearButton.click();
      await this.page.waitForLoadState('networkidle');
    } else {
      await this.searchInput.fill('');
    }
  }

  /**
   * Toggles the "Show Closed Accounts" filter and waits for the
   * list to re-render so subsequent assertions read fresh rows.
   */
  async toggleShowClosedAccounts(): Promise<void> {
    await this.showClosedToggle.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clicks the primary "Create Client" CTA and waits for the create form.
   */
  async clickCreateClient(): Promise<void> {
    await this.createClientButton.click();
    await this.page.waitForURL(/\/clients\/create(?:[/?#]|$)/, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
  }

  /**
   * Opens the client whose displayName matches `name` and waits for the
   * client general view to load.
   * @param name - The visible displayName to open
   */
  async openClient(name: string): Promise<void> {
    const row = this.rowByName(name);
    await this.waitForVisible(row, 15000);
    await row.click();
    await this.page.waitForURL(/\/clients\/\d+\/general$/, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
  }

  /**
   * Opens the first rendered client row and waits for the client general
   * view to load. Useful for smoke specs that don't care which client.
   */
  async openFirstClient(): Promise<void> {
    const first = this.rows.first();
    await this.waitForVisible(first, 15000);
    await first.click();
    await this.page.waitForURL(/\/clients\/\d+\/general$/, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
  }

  /**
   * Returns the count of rendered rows on the current page.
   */
  async getRenderedRowCount(): Promise<number> {
    return this.rows.count();
  }

  /**
   * Asserts that the empty-state placeholder is visible.
   */
  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Asserts that at least one client row is rendered.
   */
  async assertHasRows(): Promise<void> {
    await expect(this.rows.first()).toBeVisible();
  }
}
