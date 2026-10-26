/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { MANAGE_GROUP_MEMBERS_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { confirmDialog } from '../material-form-helpers';

/** Action name as it appears in the route and in the group menu. */
export const MANAGE_MEMBERS_ACTION = 'Manage Members';

/**
 * ManageGroupMembersPage — Page Object for the Manage Members action
 * screen (`/#/groups/:id/actions/Manage%20Members`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `MANAGE_GROUP_MEMBERS_SELECTORS`
 *   - routes:    `ROUTES.groupAction(id, 'Manage Members')`
 *
 * ── Known app defect: the list is stale after a write ───────────────
 *
 * `ManageGroupMembersComponent` is `ChangeDetectionStrategy.OnPush`,
 * and both mutations happen inside the **async subscribe of the HTTP
 * response**:
 *
 * ```ts
 * this.groupsService.executeGroupCommand(id, 'associateClients', {...})
 *   .subscribe(() => { this.clientMembers.push(this.clientChoice.value); });
 * ```
 *
 * Nothing marks the view dirty at that point — there is no
 * `ChangeDetectorRef`, no `markForCheck()` and no `async` pipe anywhere
 * in the component. So the rendered list can lag behind a write that
 * genuinely succeeded.
 *
 * This is *not* the same defect as the notes tab, which passes a
 * mutated array as an `@Input` to a separate OnPush child. Here there
 * is no child component at all; the list is rendered inline by the
 * same component that mutates it. Under classic Zone.js the mutation
 * is sometimes picked up anyway, when an ancestor happens to have been
 * marked dirty in the same turn — which is exactly why the specs
 * assert *observed* behaviour plus an API poll rather than asserting
 * the mechanism.
 *
 * Every mutating method here therefore reloads before asserting, and
 * the reload is deliberately visible. If the component is ever fixed
 * to update in place these methods still pass; the day someone deletes
 * a reload, the failure points straight back at this docstring.
 *
 * ── The autocomplete is scoped to the group's office ────────────────
 *
 * The search passes `orphansOnly: true` and the group's `officeId`, so
 * a candidate client must be in the same office and not already in any
 * group. An empty result set is much more often one of those two
 * constraints than a broken selector.
 *
 * ── Removal is dialog-confirmed ─────────────────────────────────────
 *
 * The trash button opens the shared `DeleteDialogComponent`, whose
 * affirmative button reads **"Confirm"**, not "Delete". That dialog
 * also dereferences `response.delete` with no null guard, so
 * dismissing it with ESC or a backdrop click throws a TypeError —
 * {@link removeMember} always clicks Confirm.
 */
export class ManageGroupMembersPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param groupId - Owning group id.
   */
  constructor(
    page: Page,
    private readonly groupId: number
  ) {
    super(page);
    this.url = ROUTES.groupAction(groupId, MANAGE_MEMBERS_ACTION);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** Client autocomplete search box. */
  get clientSearchInput(): Locator {
    return this.page.locator(MANAGE_GROUP_MEMBERS_SELECTORS.clientSearchInput);
  }

  /** Icon-only "associate client" button. */
  get addClientButton(): Locator {
    return this.page.locator(MANAGE_GROUP_MEMBERS_SELECTORS.addClientButton);
  }

  /** Current member rows. */
  get memberItems(): Locator {
    return this.page.locator(MANAGE_GROUP_MEMBERS_SELECTORS.memberItem);
  }

  /**
   * Locate a member row by client display name.
   *
   * @param displayName - Any substring of the client's display name.
   */
  memberByName(displayName: string): Locator {
    return this.memberItems.filter({ hasText: displayName }).first();
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the manage-members screen to be interactive. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/groups/${this.groupId}/actions/Manage(%20|\\s)Members`));
    await this.waitForVisible(this.clientSearchInput, 30000);
  }

  /**
   * Reload so the member list re-resolves from the server.
   *
   * Necessary because the component mutates its array in an async
   * subscribe without marking the view dirty — see the class
   * docstring. Kept public so a spec can state plainly that it is
   * asserting post-reload state.
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForLoad();
  }

  /**
   * Pick a client in the autocomplete without associating it.
   *
   * Split out from {@link associateClient} so a spec can drive the add
   * click itself and observe what the un-reloaded list does.
   *
   * @param displayName - Client display name, or a unique prefix. At
   *   least 2 characters are required before the search fires.
   */
  async chooseClient(displayName: string): Promise<void> {
    await this.clientSearchInput.fill(displayName);

    const option = this.page.getByRole('option', { name: displayName });
    await option.first().waitFor({ state: 'visible', timeout: 30000 });
    await option.first().click();
    await expect(this.addClientButton).toBeEnabled({ timeout: 15000 });
  }

  /**
   * Associate a client with the group.
   *
   * Reloads before asserting, because the list does not reliably
   * update in place.
   *
   * @param displayName - Client display name, or a unique prefix.
   */
  async associateClient(displayName: string): Promise<void> {
    await this.chooseClient(displayName);
    await this.addClientButton.click();

    await this.reload();
    await expect(this.memberByName(displayName)).toBeVisible({ timeout: 30000 });
  }

  /**
   * Remove a client from the group and confirm the dialog.
   *
   * @param displayName - Substring identifying the member to remove.
   */
  async removeMember(displayName: string): Promise<void> {
    const row = this.memberByName(displayName);
    await expect(row).toBeVisible({ timeout: 30000 });
    await row.locator(MANAGE_GROUP_MEMBERS_SELECTORS.removeMemberButton).click();

    await confirmDialog(this.page, MANAGE_GROUP_MEMBERS_SELECTORS.confirmButton);

    await this.reload();
    await expect(this.memberByName(displayName)).toBeHidden({ timeout: 30000 });
  }

  /** Count the currently rendered member rows. */
  async getMemberCount(): Promise<number> {
    return this.memberItems.count();
  }
}
