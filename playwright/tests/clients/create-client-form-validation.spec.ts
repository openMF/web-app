/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { CreateClientPage } from '../../pages';
import { BEHAVIOR } from '../../config/behavior';

/**
 * Create-Client form-validation E2E spec (WEB-1029).
 *
 * Coverage:
 *   1. Required-field gate — each required General-step field, when
 *      left blank (or cleared after being touched), prevents the wizard
 *      from exposing the Preview step and surfaces a mat-error message.
 *
 *   2. Email format — an invalid email string triggers a format-level
 *      validator in addition to the required-field validator.
 *
 *   3. Legal-form toggle — switching between PERSON and ENTITY tears
 *      down the previous name-control subtree and builds the new one,
 *      and switching back fully restores the PERSON controls to a state
 *      where the form can become valid.
 *
 * No clients are created server-side by this spec; every test exits
 * before the stepper reaches the Preview-submit step, so no teardown
 * is necessary.
 */

/**
 * The Fineract default-tenant Liquibase seed always inserts
 * `Head Office` as the first office. We rely on that invariant to keep
 * this spec self-contained (no API call needed to look up the office
 * name before filling the form).
 */
const SEEDED_HEAD_OFFICE = 'Head Office';

/** Date string that satisfies the Angular `DD MMMM YYYY` format. */
const SUBMITTED_ON_DATE = '01 January 2024';

test.describe('Create Client — form validation', () => {
  test.beforeEach(async ({ page }) => {
    // Copy localStorage credentials into sessionStorage so the Angular
    // app can read its auth token after each page load (mirrors the
    // pattern used in create-client.spec.ts and close-client.spec.ts).
    await page.addInitScript((storageKey) => {
      const creds = localStorage.getItem(storageKey);
      if (creds) {
        sessionStorage.setItem(storageKey, creds);
      }
    }, BEHAVIOR.authStorageKey);
  });

  // ── Required-field gate ──────────────────────────────────────────────

  test('hides the Preview step when the office field is left empty', async ({ page }) => {
    const createClientPage = new CreateClientPage(page);

    await createClientPage.navigate();
    await createClientPage.waitForLoad();

    // Fill every required field except office so only that omission
    // keeps the form invalid.
    await createClientPage.legalFormDropdown.click();
    await page.getByRole('option', { name: 'Person', exact: false }).first().click();

    await createClientPage.firstnameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await createClientPage.firstnameInput.fill('ValidFirst');
    await createClientPage.lastnameInput.fill('ValidLast');
    await createClientPage.submittedOnDateInput.fill(SUBMITTED_ON_DATE);
    await createClientPage.submittedOnDateInput.blur();

    // Touch the office dropdown without selecting a value so the
    // `required` validator marks the control as dirty + invalid.
    await createClientPage.officeDropdown.click();
    await page.keyboard.press('Escape');

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(0);
    await expect(createClientPage.previewSubmitButton).toHaveCount(0);

    // Recovery: selecting an office re-exposes the Preview step.
    await createClientPage.officeDropdown.click();
    await page.getByRole('option', { name: SEEDED_HEAD_OFFICE, exact: false }).first().click();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(1);
  });

  test('hides the Preview step when firstname is blank (PERSON legal form)', async ({ page }) => {
    const createClientPage = new CreateClientPage(page);

    await createClientPage.navigate();
    await createClientPage.waitForLoad();

    await createClientPage.officeDropdown.click();
    await page.getByRole('option', { name: SEEDED_HEAD_OFFICE, exact: false }).first().click();

    await createClientPage.legalFormDropdown.click();
    await page.getByRole('option', { name: 'Person', exact: false }).first().click();

    await createClientPage.firstnameInput.waitFor({ state: 'visible', timeout: 10_000 });

    // Touch + blur without filling — fires the required validator.
    await createClientPage.firstnameInput.click();
    await createClientPage.firstnameInput.blur();

    await createClientPage.lastnameInput.fill('ValidLast');
    await createClientPage.submittedOnDateInput.fill(SUBMITTED_ON_DATE);
    await createClientPage.submittedOnDateInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(0);
    await expect(createClientPage.validationErrors.first()).toBeVisible();

    // Recovery: filling firstname re-exposes the Preview step.
    await createClientPage.firstnameInput.fill('ValidFirst');
    await createClientPage.firstnameInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(1);
  });

  test('hides the Preview step when lastname is blank (PERSON legal form)', async ({ page }) => {
    const createClientPage = new CreateClientPage(page);

    await createClientPage.navigate();
    await createClientPage.waitForLoad();

    await createClientPage.officeDropdown.click();
    await page.getByRole('option', { name: SEEDED_HEAD_OFFICE, exact: false }).first().click();

    await createClientPage.legalFormDropdown.click();
    await page.getByRole('option', { name: 'Person', exact: false }).first().click();

    await createClientPage.firstnameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await createClientPage.firstnameInput.fill('ValidFirst');

    // Touch + blur lastname without filling — fires the required validator.
    await createClientPage.lastnameInput.click();
    await createClientPage.lastnameInput.blur();

    await createClientPage.submittedOnDateInput.fill(SUBMITTED_ON_DATE);
    await createClientPage.submittedOnDateInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(0);
    await expect(createClientPage.validationErrors.first()).toBeVisible();

    // Recovery: filling lastname re-exposes the Preview step.
    await createClientPage.lastnameInput.fill('ValidLast');
    await createClientPage.lastnameInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(1);
  });

  test('hides the Preview step when fullname is blank (ENTITY legal form)', async ({ page }) => {
    const createClientPage = new CreateClientPage(page);

    await createClientPage.navigate();
    await createClientPage.waitForLoad();

    await createClientPage.officeDropdown.click();
    await page.getByRole('option', { name: SEEDED_HEAD_OFFICE, exact: false }).first().click();

    await createClientPage.legalFormDropdown.click();
    await page.getByRole('option', { name: 'Entity', exact: false }).first().click();

    await createClientPage.fullnameInput.waitFor({ state: 'visible', timeout: 10_000 });

    // Touch + blur fullname without filling — fires the required validator.
    await createClientPage.fullnameInput.click();
    await createClientPage.fullnameInput.blur();

    await createClientPage.submittedOnDateInput.fill(SUBMITTED_ON_DATE);
    await createClientPage.submittedOnDateInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(0);
    await expect(createClientPage.validationErrors.first()).toBeVisible();

    // Verify that just filling fullname alone still keeps Preview hidden
    // when constitutionId is also required (ENTITY form has multiple
    // required fields). This asserts the form truly validates fullname.
    await createClientPage.fullnameInput.fill('Valid Entity Name');
    await createClientPage.fullnameInput.blur();

    // The ENTITY form also requires constitutionId. If the dropdown has
    // seeded options we select one; otherwise just assert that the form
    // correctly blocks Preview when only fullname is filled (constitutionId
    // still empty).
    const constitutionDropdown = page.locator('mat-select[formcontrolname="constitutionId"]');
    if (await constitutionDropdown.isVisible()) {
      await constitutionDropdown.click();
      const hasOptions = await page
        .locator('mat-option')
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      if (hasOptions) {
        await page.locator('mat-option').first().click();
        await expect(createClientPage.stepHeader('Preview')).toHaveCount(1, { timeout: 10_000 });
      } else {
        // No constitution options seeded — press Escape and verify Preview
        // is still blocked (constitutionId is required but has no values).
        await page.keyboard.press('Escape');
        await expect(createClientPage.stepHeader('Preview')).toHaveCount(0);
      }
    } else {
      // No constitutionId field — fullname alone should suffice.
      await expect(createClientPage.stepHeader('Preview')).toHaveCount(1, { timeout: 10_000 });
    }
  });

  test('hides the Preview step when the submitted-on date is absent', async ({ page }) => {
    const createClientPage = new CreateClientPage(page);

    await createClientPage.navigate();
    await createClientPage.waitForLoad();

    await createClientPage.officeDropdown.click();
    await page.getByRole('option', { name: SEEDED_HEAD_OFFICE, exact: false }).first().click();

    await createClientPage.legalFormDropdown.click();
    await page.getByRole('option', { name: 'Person', exact: false }).first().click();

    await createClientPage.firstnameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await createClientPage.firstnameInput.fill('ValidFirst');
    await createClientPage.lastnameInput.fill('ValidLast');

    // Clear the submitted-on date (the form pre-fills today's date).
    await createClientPage.submittedOnDateInput.fill('');
    await createClientPage.submittedOnDateInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(0);

    // Recovery: filling a valid date re-exposes the Preview step.
    await createClientPage.submittedOnDateInput.fill(SUBMITTED_ON_DATE);
    await createClientPage.submittedOnDateInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(1);
  });

  // ── Email format ─────────────────────────────────────────────────────

  test('surfaces a validation error when the email field contains a malformed address', async ({ page }) => {
    const createClientPage = new CreateClientPage(page);

    await createClientPage.navigate();
    await createClientPage.waitForLoad();

    await createClientPage.officeDropdown.click();
    await page.getByRole('option', { name: SEEDED_HEAD_OFFICE, exact: false }).first().click();

    await createClientPage.legalFormDropdown.click();
    await page.getByRole('option', { name: 'Person', exact: false }).first().click();

    await createClientPage.firstnameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await createClientPage.firstnameInput.fill('ValidFirst');
    await createClientPage.lastnameInput.fill('ValidLast');
    await createClientPage.submittedOnDateInput.fill(SUBMITTED_ON_DATE);
    await createClientPage.submittedOnDateInput.blur();

    // Type a syntactically invalid email and blur to trigger the validator.
    await createClientPage.emailInput.fill('not-an-email');
    await createClientPage.emailInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(0);
    await expect(createClientPage.validationErrors.first()).toBeVisible();

    // Recovery: a well-formed email address clears the error.
    await createClientPage.emailInput.fill('valid@example.com');
    await createClientPage.emailInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(1);
  });

  // ── Legal-form toggle ────────────────────────────────────────────────

  test('switches the name-control subtree when the legal form toggles between Person and Entity', async ({ page }) => {
    // The legalForm switch is a pure client-side re-render. The office
    // is filled with the seeded default so the form reaches a valid
    // baseline for the final round-trip assertion.
    const officeName = SEEDED_HEAD_OFFICE;
    const createClientPage = new CreateClientPage(page);

    await createClientPage.navigate();
    await createClientPage.waitForLoad();

    await createClientPage.officeDropdown.click();
    await page.getByRole('option', { name: officeName, exact: false }).first().click();

    // Default legal form is PERSON (`setClientForm()` patches
    // `LegalFormId.PERSON` on init). PERSON should show first/last
    // name controls; ENTITY-only controls must be absent.
    await expect(createClientPage.firstnameInput).toBeVisible();
    await expect(createClientPage.lastnameInput).toBeVisible();
    await expect(createClientPage.fullnameInput).toHaveCount(0);

    // Switch to ENTITY. `buildDependencies()` removes firstname /
    // middlename / lastname and adds fullname + a
    // `clientNonPersonDetails` FormGroup containing a required
    // `constitutionId`.
    await createClientPage.legalFormDropdown.click();
    await page.getByRole('option', { name: 'Entity', exact: false }).first().click();

    await createClientPage.fullnameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await expect(createClientPage.fullnameInput).toBeVisible();
    await expect(createClientPage.firstnameInput).toHaveCount(0);
    await expect(createClientPage.lastnameInput).toHaveCount(0);
    await expect(createClientPage.middlenameInput).toHaveCount(0);

    // The clientNonPersonDetails subtree contains a `constitutionId`
    // mat-select that only exists in ENTITY mode. Assert it renders
    // so a regression that stops swapping the subtree is caught here.
    const constitutionDropdown = page.locator('mat-select[formcontrolname="constitutionId"]');
    await expect(constitutionDropdown).toBeVisible();

    // Switch back to PERSON — the name-control subtree must return
    // and the ENTITY-only controls must be torn down.
    await createClientPage.legalFormDropdown.click();
    await page.getByRole('option', { name: 'Person', exact: false }).first().click();

    await createClientPage.firstnameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await expect(createClientPage.firstnameInput).toBeVisible();
    await expect(createClientPage.lastnameInput).toBeVisible();
    await expect(createClientPage.fullnameInput).toHaveCount(0);
    await expect(constitutionDropdown).toHaveCount(0);

    // Round-trip assertion: fill the restored PERSON name controls and
    // a submitted-on date so the form reaches a genuinely valid state.
    // This verifies that switching back to PERSON not only renders the
    // correct DOM subtree but also fully re-wires the reactive form
    // (validators active, form-valid flag flipped) — a regression where
    // the subtree renders but the FormGroup stays INVALID would be
    // caught here by the absence of the Preview step header.
    await createClientPage.firstnameInput.fill('RoundTrip');
    await createClientPage.lastnameInput.fill('Client');
    await createClientPage.submittedOnDateInput.fill(SUBMITTED_ON_DATE);
    await createClientPage.submittedOnDateInput.blur();

    await expect(createClientPage.stepHeader('Preview')).toHaveCount(1);
  });
});
