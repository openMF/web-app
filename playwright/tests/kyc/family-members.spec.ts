/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../factories/client.factory';
import { FamilyMembersPage } from '../../pages/kyc/family-members.page';

/**
 * Client KYC · Family members.
 *
 * ── Why the dropdown values are discovered, not hard-coded ──────────
 *
 * Relationship, gender and profession are all code values, which are
 * tenant configuration rather than product constants. Hard-coding
 * "Spouse" or "Male" would make this suite pass on one seeded database
 * and fail on the next. Each test reads the available options first
 * and picks the first one, so the spec asserts the *flow* works rather
 * than that a particular tenant happens to be configured a certain way.
 *
 * Relationship and gender are `required`, so a tenant with neither
 * configured cannot submit this form at all. That is a data gap, not a
 * regression, and the tests skip with an explicit reason instead of
 * timing out on a permanently disabled Submit button.
 */
test.describe('Client KYC · Family members', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('adds a family member and lists it on the tab', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const familyPage = new FamilyMembersPage(page, client.resourceId);
    await familyPage.openAddForm();

    const relationships = await familyPage.getDropdownOptions(familyPage.relationshipDropdown);
    const genders = await familyPage.getDropdownOptions(familyPage.genderDropdown);
    test.skip(
      relationships.length === 0 || genders.length === 0,
      'Tenant has no relationship/gender code values configured; the form cannot be submitted.'
    );

    const firstName = `E2E${Date.now()}`;
    await familyPage.fillForm({
      firstName,
      lastName: 'Relative',
      relationship: relationships[0],
      gender: genders[0]
    });
    await familyPage.submitForm();

    await expect(familyPage.memberPanelByName(firstName)).toBeVisible({ timeout: 30000 });

    // Cleanup must run before the client deleter, and the guard flushes
    // last-in-first-out, so registering here is correct.
    const members = await fineractApi.getClientFamilyMembers(client.resourceId);
    const created = members.find((member) => member?.firstName === firstName);
    expect(created).toBeDefined();
    cleanupGuard.register(`familyMember:${created.id}`, async () => {
      await fineractApi.deleteClientFamilyMember(client.resourceId, created.id);
    });
  });

  test('edits an existing family member', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const familyPage = new FamilyMembersPage(page, client.resourceId);
    await familyPage.openAddForm();

    const relationships = await familyPage.getDropdownOptions(familyPage.relationshipDropdown);
    const genders = await familyPage.getDropdownOptions(familyPage.genderDropdown);
    test.skip(
      relationships.length === 0 || genders.length === 0,
      'Tenant has no relationship/gender code values configured; the form cannot be submitted.'
    );

    const firstName = `E2E${Date.now()}`;
    await familyPage.fillForm({
      firstName,
      lastName: 'Original',
      relationship: relationships[0],
      gender: genders[0]
    });
    await familyPage.submitForm();

    const members = await fineractApi.getClientFamilyMembers(client.resourceId);
    const created = members.find((member) => member?.firstName === firstName);
    cleanupGuard.register(`familyMember:${created.id}`, async () => {
      await fineractApi.deleteClientFamilyMember(client.resourceId, created.id);
    });

    // The Edit button only enters the DOM once the accordion panel is
    // expanded — `openEditForm` handles that, and this test is what
    // keeps that behaviour honest.
    await familyPage.openEditForm(firstName);
    await familyPage.lastNameInput.fill('Updated');
    await familyPage.submitForm();

    const updated = await fineractApi.getClientFamilyMembers(client.resourceId);
    expect(updated.find((member) => member?.id === created.id)?.lastName).toBe('Updated');
  });

  test('deletes a family member through the confirm dialog', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const familyPage = new FamilyMembersPage(page, client.resourceId);
    await familyPage.openAddForm();

    const relationships = await familyPage.getDropdownOptions(familyPage.relationshipDropdown);
    const genders = await familyPage.getDropdownOptions(familyPage.genderDropdown);
    test.skip(
      relationships.length === 0 || genders.length === 0,
      'Tenant has no relationship/gender code values configured; the form cannot be submitted.'
    );

    const firstName = `E2E${Date.now()}`;
    await familyPage.fillForm({
      firstName,
      lastName: 'Removable',
      relationship: relationships[0],
      gender: genders[0]
    });
    await familyPage.submitForm();

    await expect(familyPage.memberPanelByName(firstName)).toBeVisible({ timeout: 30000 });
    await familyPage.deleteMember(firstName);

    await expect
      .poll(
        async () => {
          const members = await fineractApi.getClientFamilyMembers(client.resourceId);
          return members.some((member) => member?.firstName === firstName);
        },
        { timeout: 30000 }
      )
      .toBe(false);
  });
});
