/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { GROUP_VIEW_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';

/**
 * GroupViewPage — Page Object for the group view shell and its General
 * tab (`/#/groups/:id/general`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `GROUP_VIEW_SELECTORS`
 *   - routes:    `ROUTES.groupView(id)`
 *
 * ── Asserting status without a status label ─────────────────────────
 *
 * The header renders status as a `<i class="fa fa-stop">` whose class
 * comes from a `statusLookup` pipe, plus a `matTooltip`. Neither is a
 * good assertion target: the pipe's output strings are an internal
 * detail, and the tooltip text is not in the DOM until hover.
 *
 * The actions menu is far more honest. "Activate" is rendered inside
 * `@if (!(groupViewData.status.value === 'Active'))`, so its presence
 * *is* the pending state and its absence *is* the active state. That
 * is what {@link isPending} reads, and why this page object has no
 * `getStatusText()`.
 *
 * ── The members table may not exist ─────────────────────────────────
 *
 * The General tab wraps the client-members table in
 * `@if (groupClientMembers)`. A group with no members renders no table
 * at all, so {@link getMemberNames} normalises that to an empty array
 * rather than making every caller distinguish "absent" from "empty".
 *
 * The tab also renders several other `table[mat-table]` elements
 * (loans, savings, GSIM, GLIM); the members table is the first, which
 * is why the locator is pinned with `.first()`.
 */
export class GroupViewPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param groupId - The group being viewed.
   */
  constructor(
    page: Page,
    private readonly groupId: number
  ) {
    super(page);
    this.url = ROUTES.groupView(groupId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** The `aria-label`led actions menu trigger in the group header. */
  get actionsMenuButton(): Locator {
    return this.page.getByRole('button', { name: GROUP_VIEW_SELECTORS.actionsMenuButton });
  }

  /** The `<h3>` carrying the group name. */
  get groupNameHeading(): Locator {
    return this.page.locator(GROUP_VIEW_SELECTORS.groupNameHeading);
  }

  /** Client-members table; absent for a memberless group. */
  get clientMembersTable(): Locator {
    return this.page.locator(GROUP_VIEW_SELECTORS.clientMembersTable).first();
  }

  /** Rows of the client-members table. */
  get clientMembersRows(): Locator {
    return this.clientMembersTable.locator(GROUP_VIEW_SELECTORS.clientMembersRow);
  }

  /**
   * Locate a member row by client display name.
   *
   * @param displayName - Any substring of the client's display name.
   */
  memberRowByName(displayName: string): Locator {
    return this.clientMembersRows.filter({ hasText: displayName }).first();
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the group General tab to load. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/groups/${this.groupId}/general`));
    await this.waitForVisible(this.groupNameHeading, 30000);
  }

  /** Reload the view so the group and its members re-resolve. */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForLoad();
  }

  /** Open the group actions menu. */
  async openActionsMenu(): Promise<void> {
    await this.actionsMenuButton.click();
    await this.page.getByRole('menu').first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Close the actions menu if it is open.
   *
   * The menu overlay has a full-viewport backdrop, so leaving it open
   * silently swallows the next click anywhere on the page.
   */
  async closeActionsMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.getByRole('menu').first().waitFor({ state: 'hidden', timeout: 15000 });
  }

  /**
   * Whether the group is still pending.
   *
   * Read from the presence of the "Activate" menu item rather than any
   * status text — see the class docstring. Leaves the menu closed.
   *
   * @returns true when the group has not been activated.
   */
  async isPending(): Promise<boolean> {
    await this.openActionsMenu();
    const activate = this.page.getByRole('menuitem', { name: GROUP_VIEW_SELECTORS.activateMenuItem, exact: true });
    const pending = (await activate.count()) > 0;
    await this.closeActionsMenu();
    return pending;
  }

  /**
   * Navigate to the Manage Members action screen via the menu.
   *
   * Goes through the UI rather than `page.goto` so the menu item stays
   * covered — it is the only thing that proves the action is reachable.
   */
  async openManageMembers(): Promise<void> {
    await this.openActionsMenu();
    await this.page.getByRole('menuitem', { name: GROUP_VIEW_SELECTORS.manageMembersMenuItem, exact: true }).click();
    await this.page.waitForURL(/\/groups\/\d+\/actions\/Manage(%20|\s)Members/, { timeout: 30000 });
  }

  /**
   * Display names of the currently listed client members.
   *
   * @returns Member names, or an empty array when the table is absent.
   */
  async getMemberNames(): Promise<string[]> {
    if ((await this.clientMembersTable.count()) === 0) {
      return [];
    }
    // `td:first-child` rather than `locator('td').first()` — the
    // latter collapses every row to a single cell.
    const cells = await this.clientMembersRows.locator('td:first-child').allTextContents();
    return cells.map((text) => text.trim()).filter((text) => text.length > 0);
  }
}
