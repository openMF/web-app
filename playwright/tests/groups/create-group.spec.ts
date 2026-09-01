/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../factories/client.factory';
import { generateE2EName } from '../../utils/naming';
import { CreateGroupPage } from '../../pages/groups/create-group.page';
import { GroupViewPage } from '../../pages/groups/group-view.page';

/**
 * Groups · Create.
 *
 * ── The two traps being pinned here ─────────────────────────────────
 *
 * 1. `activationDate` is a **dynamic control**. It is added to the
 *    form group and rendered only while the `active` checkbox is
 *    ticked, and removed again when it is unticked. A test that fills
 *    it before ticking the box finds nothing; one that fills it and
 *    then unticks loses the value silently.
 *
 * 2. The client autocomplete is **office-scoped and orphans-only**. It
 *    reads `officeId` from the form as it stands at search time, so an
 *    office must be selected first, and `orphansOnly: true` hides any
 *    client that already belongs to a group.
 *
 * ── On teardown ─────────────────────────────────────────────────────
 *
 * Fineract only hard-deletes groups that are pending and memberless.
 * The first test here deliberately creates an *active* group *with* a
 * member, so its group deleter is expected to fail on teardown. That
 * is recorded by the `CleanupGuard` rather than thrown, and is the
 * price of covering the branch that actually breaks.
 */

/**
 * The E2E Fineract instance is seeded from the standard Fineract
 * migration set, which always creates `Head Office` as the first
 * office. The client factory defaults to that same office, so the
 * group and its candidate members share one.
 */
const SEEDED_HEAD_OFFICE = 'Head Office';

const SUBMITTED_ON_DATE = '01 January 2024';

/**
 * Must be on or after the submitted-on date — the activation input is
 * bound with `[min]="groupForm.value.submittedOnDate"`, so an earlier
 * date leaves the form invalid and Submit permanently disabled.
 */
const ACTIVATION_DATE = '02 January 2024';

test.describe('Groups · Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('creates an active group with a client member', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const groupName = generateE2EName('group');

    const createPage = new CreateGroupPage(page);
    await createPage.navigate();
    await createPage.waitForLoad();

    await createPage.fillName(groupName);
    // Office before client search — the search is scoped to whatever
    // office the form holds at the moment it fires.
    await createPage.selectOffice(SEEDED_HEAD_OFFICE);
    await createPage.fillSubmittedOnDate(SUBMITTED_ON_DATE);

    // Ticking `active` adds the `activationDate` control; `setActive`
    // waits for it to attach so the fill below cannot race the
    // `valueChanges` subscription.
    await createPage.setActive(true);
    await createPage.fillActivationDate(ACTIVATION_DATE);

    await createPage.addClientMember(client.displayName);

    const groupId = await createPage.submit();

    const viewPage = new GroupViewPage(page, groupId);
    await viewPage.waitForLoad();

    // Active groups no longer offer "Activate" in the actions menu.
    expect(await viewPage.isPending()).toBe(false);
    await expect(viewPage.memberRowByName(client.displayName)).toBeVisible({ timeout: 30000 });

    // The group deleter cannot succeed for an active group with a
    // member, so registering one would only add noise. Assert the
    // backend state instead.
    const group = await fineractApi.getGroup(groupId);
    expect(group.name).toBe(groupName);
    expect(group.status?.value).toBe('Active');

    const members = await fineractApi.getGroupClientMembers(groupId);
    expect(members.some((member) => member?.id === client.resourceId)).toBe(true);
  });

  test('adds and removes the activation date control with the active checkbox', async ({ page }) => {
    // ── This test pins a dynamic-control branch, not a happy path ──
    //
    // `CreateGroupComponent.buildDependencies()` calls
    // `addControl('activationDate')` / `removeControl(...)` from a
    // `valueChanges` subscription, and the template mirrors it with
    // `@if (groupForm.controls.active.value)`. Both directions matter:
    // a regression that leaves the control behind on untick would make
    // the form permanently invalid with no visible cause.
    const createPage = new CreateGroupPage(page);
    await createPage.navigate();
    await createPage.waitForLoad();

    // Absent, not hidden, before the box is ticked.
    await expect(createPage.activationDateInput).toHaveCount(0);

    await createPage.setActive(true);
    await expect(createPage.activationDateInput).toBeVisible();

    await createPage.setActive(false);
    await expect(createPage.activationDateInput).toHaveCount(0);
  });

  test('stages and unstages a client member before submitting', async ({ page, apiSetup, cleanupGuard }) => {
    // Members added on the create form are held in memory and only
    // flattened into the payload on submit — so removing one before
    // submit must leave no trace on the created group.
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const createPage = new CreateGroupPage(page);
    await createPage.navigate();
    await createPage.waitForLoad();

    await createPage.fillName(generateE2EName('group'));
    await createPage.selectOffice(SEEDED_HEAD_OFFICE);
    await createPage.fillSubmittedOnDate(SUBMITTED_ON_DATE);

    await createPage.addClientMember(client.displayName);
    await expect(createPage.stagedClientByName(client.displayName)).toBeVisible();

    await createPage.removeClientMember(client.displayName);
    await expect(createPage.selectedClientItems).toHaveCount(0);
  });
});
