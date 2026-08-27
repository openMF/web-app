/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../factories/client.factory';
import { createTestGroup } from '../../factories/group.factory';
import { GroupViewPage } from '../../pages/groups/group-view.page';
import { ManageGroupMembersPage } from '../../pages/groups/manage-group-members.page';

/**
 * Groups · Manage members.
 *
 * Covers the `associateClients` / `disassociateClients` commands
 * through the Manage Members action screen.
 *
 * ── Why this surface and not the create form ────────────────────────
 *
 * The create form only stages members in memory. This screen issues a
 * POST per click and then mutates its list in the response handler —
 * which is where the interesting failure mode lives.
 *
 * ── The defect being pinned ─────────────────────────────────────────
 *
 * `ManageGroupMembersComponent` is `OnPush`, and both `push` and
 * `splice` run inside the async subscribe of the HTTP response with
 * nothing to mark the view dirty. The write lands; the list may not
 * move.
 *
 * The observation test below is written deliberately *loosely*: it
 * asserts the API state hard, and records what the un-reloaded UI did
 * without demanding a particular answer. Under classic Zone.js an
 * ancestor marked dirty in the same turn can mask the staleness, so a
 * strict `toBeHidden()` here would be asserting a race, not a
 * behaviour. What it does assert strictly is the part that must always
 * hold: after a reload, the list agrees with the server.
 *
 * ── On teardown ─────────────────────────────────────────────────────
 *
 * A group with members cannot be hard-deleted, so the factory's
 * deleter fails on teardown for any test that leaves a member
 * attached. The disassociate test ends with an empty group and so
 * cleans up fully; the associate test does not, by design.
 */
test.describe('Groups · Manage members', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('associates a client with a group', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const group = await createTestGroup(apiSetup, cleanupGuard);

    const membersPage = new ManageGroupMembersPage(page, group.resourceId);
    await membersPage.navigate();
    await membersPage.waitForLoad();

    await membersPage.associateClient(client.displayName);

    const members = await fineractApi.getGroupClientMembers(group.resourceId);
    expect(members.some((member) => member?.id === client.resourceId)).toBe(true);
  });

  test('reaches manage members through the group actions menu', async ({ page, apiSetup, cleanupGuard }) => {
    // The menu item is the only thing proving this action is
    // reachable at all — the route works whether or not anything
    // links to it.
    const group = await createTestGroup(apiSetup, cleanupGuard);

    const viewPage = new GroupViewPage(page, group.resourceId);
    await viewPage.navigate();
    await viewPage.waitForLoad();

    await viewPage.openManageMembers();

    const membersPage = new ManageGroupMembersPage(page, group.resourceId);
    await membersPage.waitForLoad();
    await expect(membersPage.clientSearchInput).toBeVisible();
  });

  test('persists the association even though the list may not update in place', async ({
    page,
    fineractApi,
    apiSetup,
    cleanupGuard
  }) => {
    // ── This test documents a real defect ─────────────────────────
    //
    // `addClient()` pushes onto `clientMembers` inside the subscribe
    // of the associate response. The component is OnPush and never
    // calls `markForCheck()`, so the render is not guaranteed.
    //
    // The assertion is split deliberately: the API state is checked
    // strictly, the un-reloaded UI is only observed, and the
    // post-reload state is checked strictly again. If someone fixes
    // the component this test keeps passing; if someone breaks the
    // *write*, it fails immediately and unambiguously.
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const group = await createTestGroup(apiSetup, cleanupGuard);

    const membersPage = new ManageGroupMembersPage(page, group.resourceId);
    await membersPage.navigate();
    await membersPage.waitForLoad();

    await membersPage.chooseClient(client.displayName);
    await membersPage.addClientButton.click();

    // The write really did happen...
    await expect
      .poll(
        async () => {
          const members = await fineractApi.getGroupClientMembers(group.resourceId);
          return members.some((member) => member?.id === client.resourceId);
        },
        { timeout: 30000 }
      )
      .toBe(true);

    // ...whatever the un-reloaded list happens to show. Recorded, not
    // asserted — see the block comment above.
    const renderedBeforeReload = await membersPage.memberByName(client.displayName).isVisible();
    test.info().annotations.push({
      type: 'observed',
      description: `member rendered without reload: ${renderedBeforeReload}`
    });

    // After a reload the list must agree with the server.
    await membersPage.reload();
    await expect(membersPage.memberByName(client.displayName)).toBeVisible({ timeout: 30000 });
  });

  test('disassociates a client through the confirm dialog', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const group = await createTestGroup(apiSetup, cleanupGuard);

    // Arrange the membership over the API so the test spends its time
    // on the removal path rather than re-covering association.
    await fineractApi.executeGroupCommand(group.resourceId, 'associateClients', {
      clientMembers: [client.resourceId]
    });

    const membersPage = new ManageGroupMembersPage(page, group.resourceId);
    await membersPage.navigate();
    await membersPage.waitForLoad();
    await expect(membersPage.memberByName(client.displayName)).toBeVisible({ timeout: 30000 });

    await membersPage.removeMember(client.displayName);

    await expect
      .poll(
        async () => {
          const members = await fineractApi.getGroupClientMembers(group.resourceId);
          return members.some((member) => member?.id === client.resourceId);
        },
        { timeout: 30000 }
      )
      .toBe(false);
  });
});
