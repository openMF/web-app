/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import {
  ClientsListPage,
  CreateClientPage,
  ClientViewPage,
  type GeneralStepData,
  type FamilyMemberData
} from '../../pages';
import { createTestClient } from '../../factories';
import { BEHAVIOR } from '../../config/behavior';

/**
 * Create-Client CRUD spec (PR-2 / WA-3.2 part 1).
 *
 * Coverage:
 *   1. Happy path — drives the mat-stepper end-to-end (list → CTA →
 *      general step → preview → submit), asserts the browser lands on
 *      `/#/clients/:id/general`, and asserts the Fineract API echoes the
 *      same `displayName` / `officeId` we typed into the form. This
 *      single test exercises every PR-1 page object surface
 *      (`ClientsListPage`, `CreateClientPage`, `ClientViewPage`).
 *
 *   2. Negative path — uses the {@link createTestClient} payload factory
 *      to build a baseline that is one required field short, then
 *      asserts the wizard refuses to expose the Preview step until the
 *      missing field is supplied. The factory is intentionally scoped
 *      to this case so the happy path stays explicit about every value
 *      it ships to the form and to the API echo assertion.
 *
 * Cleanup contract:
 *   Every client id created by either path (UI or factory-driven API)
 *   is pushed onto `createdClientIds` and torn down in
 *   {@link test.afterEach} via {@link FineractApiClient.deleteClient}.
 *   The teardown is best-effort: failures are logged but never
 *   re-thrown so they cannot mask the assertion that drove the test.
 *   Pending clients delete cleanly; if a future test activates the
 *   client, extend the guard to close-then-delete.
 */

const SUBMITTED_ON_DATE = '01 January 2024';
const PENDING_STATUS_VALUE = 'Pending';

test.describe('Create Client — CRUD', () => {
  /**
   * Per-test scratchpad of client ids that require teardown.
   * Reset in {@link test.beforeEach} so a failure in one test never
   * leaks ids into the next.
   */
  const createdClientIds: number[] = [];

  test.beforeEach(async ({ page }) => {
    createdClientIds.length = 0;

    // Playwright `storageState` only restores localStorage / cookies.
    // The Angular app reads its session token from sessionStorage, so
    // copy it across on every page load (matches `auth.setup.ts` and
    // the close-client spec).
    await page.addInitScript((storageKey) => {
      const creds = localStorage.getItem(storageKey);
      if (creds) {
        sessionStorage.setItem(storageKey, creds);
      }
    }, BEHAVIOR.authStorageKey);
  });

  test.afterEach(async ({ fineractApi }) => {
    // Cleanup-guard: drain ids even if some deletions fail.
    // Best-effort by design — we log and continue so teardown noise
    // cannot mask the real assertion failure that drove the test.
    for (const clientId of createdClientIds) {
      try {
        // Fineract blocks deletion of clients that still have family
        // member records (FK constraint → 403).  Purge them first.
        const members = await fineractApi.getClientFamilyMembers(clientId);
        for (const m of members) {
          await fineractApi.deleteClientFamilyMember(clientId, m.id);
        }
        await fineractApi.deleteClient(clientId);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[create-client.spec cleanup] failed to delete client ${clientId}: ${message}`);
      }
    }
    createdClientIds.length = 0;
  });

  test('creates a client via the mat-stepper UI and the API echoes the same displayName + officeId', async ({
    page,
    fineractApi
  }) => {
    // Resolve the seeded office through the same API the form will hit
    // so the echo assertion compares against a value we *know* exists
    // server-side rather than a string baked into the spec.
    const officeId = await fineractApi.getFirstOfficeId();
    const offices = await fineractApi.getOffices();
    const office = offices.find((candidate) => candidate.id === officeId);

    if (!office?.name) {
      throw new Error(
        `[create-client.spec] expected office id ${officeId} to expose a name; got ${JSON.stringify(office)}`
      );
    }

    const uniqueSuffix = Date.now();
    const formData: GeneralStepData = {
      office: office.name,
      legalForm: 'PERSON',
      firstname: `UiCreate${uniqueSuffix}`,
      lastname: 'Client',
      submittedOnDate: SUBMITTED_ON_DATE
      // active intentionally omitted → client lands in `Pending` state
      // so the cleanup-guard can hard-delete it without first closing.
    };

    const clientsListPage = new ClientsListPage(page);
    const createClientPage = new CreateClientPage(page);

    // Seed Fineract code values used by the Family Members dialog BEFORE
    // navigating to the form.  The Angular create-client component fetches
    // the client template (including relationship + gender lists) once on
    // load; values seeded after that fetch is complete won't appear in the
    // dropdowns without a full reload.
    const [
      relationshipValue,
      genderValue
    ] = await Promise.all([
      fineractApi.ensureCodeValue('RELATIONSHIP', 'Spouse'),
      fineractApi.ensureCodeValue('Gender', 'Male')
    ]);
    const familyMember: FamilyMemberData = {
      firstName: 'Jane',
      lastName: 'Doe',
      relationship: relationshipValue.name,
      gender: genderValue.name
    };

    // 1. Drive the clients list → Create-Client CTA so the CTA wiring
    //    in `ClientsListPage` is exercised by at least one spec.
    await clientsListPage.navigate();
    await clientsListPage.waitForLoad();
    await clientsListPage.clickCreateClient();

    // 2. Fill the General step and advance through the wizard.
    await createClientPage.waitForLoad();
    await createClientPage.fillGeneralStep(formData);

    // 2a. Family Members step — always present in the wizard; optional
    //     but exercised here to drive the complete stepper flow.
    if ((await createClientPage.stepHeader('Family Members').count()) > 0) {
      await createClientPage.goToStep('Family Members');
      await createClientPage.fillFamilyStep([familyMember]);
    }

    // 2b. Some tenants enable the Address step via the
    //     `Enable-Address` global config; when present, it gates the
    //     Preview step until at least one address row exists. Probe
    //     for the step header rather than reading the config so the
    //     spec stays self-contained.
    const addressStepCount = await createClientPage.stepHeader('Address').count();
    if (addressStepCount > 0) {
      await createClientPage.goToStep('Address');
      await createClientPage.fillAddressStep([
        {
          street: '1 Test Street',
          addressLine1: '1 Test Street',
          city: 'Test City',
          postalCode: '00001'
        }
      ]);
    }

    // 3. Land on the freshly created client's general view.
    const clientId = await createClientPage.previewAndSubmit();
    createdClientIds.push(clientId);

    const clientViewPage = new ClientViewPage(page, clientId);
    await clientViewPage.waitForLoad();
    await expect(page).toHaveURL(new RegExp(`/clients/${clientId}/general$`));

    // 4. API echo — assert the server stored exactly what the form sent.
    const apiClient = await fineractApi.getClient(clientId);
    const expectedDisplayName = `${formData.firstname} ${formData.lastname}`;
    expect(apiClient.displayName).toBe(expectedDisplayName);
    expect(apiClient.officeId).toBe(officeId);
    expect(apiClient.officeName).toBe(office.name);
    expect(apiClient.status?.value).toBe(PENDING_STATUS_VALUE);

    // 4a. Family member echo — assert the server persisted the one
    //     family member we added through the wizard UI.
    const savedMembers = await fineractApi.getClientFamilyMembers(clientId);
    expect(savedMembers).toHaveLength(1);
    expect(savedMembers[0].firstName).toBe(familyMember.firstName);
    expect(savedMembers[0].lastName).toBe(familyMember.lastName);
  });

  test('blocks the Preview step until every required general-step field is filled', async ({ page, fineractApi }) => {
    // Deterministic baseline payload from the factory, mutated so
    // `lastname` is empty — the PERSON-form validator marks lastname
    // as required and the create wizard hides the Preview step until
    // every required field is valid (see `areFormvalids()`).
    const officeId = await fineractApi.getFirstOfficeId();
    const offices = await fineractApi.getOffices();
    const officeName = offices.find((candidate) => candidate.id === officeId)?.name;

    if (!officeName) {
      throw new Error(
        `[create-client.spec] expected office id ${officeId} to expose a name; got ${JSON.stringify(offices)}`
      );
    }

    const invalidPayload = createTestClient({
      office: officeName,
      lastname: ''
    });

    const createClientPage = new CreateClientPage(page);
    await createClientPage.navigate();
    await createClientPage.waitForLoad();

    // Fill every required general-step field *except* the one we set
    // to empty in the factory override. We can't call
    // `fillGeneralStep(invalidPayload)` directly — the page-object
    // helper guards against empty `lastname` so callers fail fast in
    // spec authoring; the negative path is precisely the case where
    // we deliberately bypass that guard to inspect form behaviour.
    await createClientPage.officeDropdown.click();
    await page.getByRole('option', { name: invalidPayload.office, exact: false }).first().click();

    await createClientPage.legalFormDropdown.click();
    await page.getByRole('option', { name: 'Person', exact: false }).first().click();

    await createClientPage.firstnameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await createClientPage.firstnameInput.fill(invalidPayload.firstname);

    // Touch + blur lastname so the `required` validator fires and
    // mat-error renders, without ever supplying a value.
    await createClientPage.lastnameInput.click();
    await createClientPage.lastnameInput.blur();

    await createClientPage.submittedOnDateInput.fill(SUBMITTED_ON_DATE);
    await createClientPage.submittedOnDateInput.blur();

    // The Preview step is `@if (areFormvalids())` in the template, so
    // an invalid form means the header is never appended to the DOM.
    await expect(createClientPage.stepHeader('Preview')).toHaveCount(0);
    await expect(createClientPage.previewSubmitButton).toHaveCount(0);

    // The lastname mat-error message is the user-visible signal that
    // the form is invalid; assert it surfaces so a future template
    // change that silently drops the validator is caught here.
    await expect(createClientPage.validationErrors.first()).toBeVisible();

    // Recovery: filling the field should re-expose the Preview step.
    // This proves the negative-state was truly driven by the empty
    // required field and not by an unrelated form issue.
    await createClientPage.lastnameInput.fill('Client');
    await createClientPage.lastnameInput.blur();
    await expect(createClientPage.stepHeader('Preview')).toHaveCount(1);
  });
});
