/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { CREATE_CLIENT_SELECTORS } from '../config/selectors';
import { ROUTES } from '../config/routes';

/**
 * Logical legal-form labels accepted by `fillGeneralStep`.
 *
 * Maps 1:1 to `LegalFormId` in the app domain (PERSON=1, ENTITY=2)
 * so React's create-client wizard can reuse the same vocabulary.
 */
export type LegalForm = 'PERSON' | 'ENTITY';

/**
 * Data accepted by `CreateClientPage.fillGeneralStep`.
 *
 * Only `office` and `legalForm` are required by the form. Name fields
 * become required dynamically based on the chosen legal form
 * (firstname/lastname for PERSON, fullname for ENTITY) — the helper
 * enforces that at runtime.
 */
export interface GeneralStepData {
  office: string;
  legalForm: LegalForm;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  fullname?: string;
  externalId?: string;
  mobileNo?: string;
  email?: string;
  /**
   * Date of birth / incorporation date, formatted per the Angular
   * `BEHAVIOR.dateFormat` ("DD MMMM YYYY", e.g. "01 January 2000").
   */
  dateOfBirth?: string;
  clientType?: string;
  clientClassification?: string;
  /**
   * Submitted-on date — defaults to today's business date in the
   * Angular form; override only when the spec needs a specific value.
   */
  submittedOnDate?: string;
  /**
   * When true, ticks the "Active" checkbox and fills `activationDate`.
   * `activationDate` is required when `active === true`.
   */
  active?: boolean;
  activationDate?: string;
}

/**
 * Data accepted by `CreateClientPage.fillFamilyStep` (one entry per
 * family member dialog invocation).
 */
export interface FamilyMemberData {
  firstName: string;
  middleName?: string;
  lastName: string;
  relationship: string;
  gender: string;
  /** Date of birth in the same locale-formatted string as the form. */
  dateOfBirth?: string;
}

/**
 * Data accepted by `CreateClientPage.fillAddressStep`.
 *
 * Address fields are dynamic per-tenant (driven by
 * `clientAddressFieldConfig`) — the helper only fills fields supplied
 * in the data object and skips any whose locator is not visible.
 */
export interface AddressData {
  addressType?: string;
  street?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

/**
 * CreateClientPage - Page Object for the Mifos X create-client flow.
 *
 * Wraps the vertical `<mat-stepper>` declared in
 * `create-client.component.html` (general → family → address →
 * datatables → preview) so specs can drive the wizard without knowing
 * Angular Material's directive surface.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CREATE_CLIENT_SELECTORS` (stepper, fields, dialogs)
 *   - routes:    `ROUTES.clientCreate` and `ROUTES.clientView(id)`
 *
 * Cross-framework portability notes:
 *   - The four entry-point helpers (`fillGeneralStep`,
 *     `fillFamilyStep`, `fillAddressStep`, `previewAndSubmit`) form
 *     the contract React's wizard PO must honour.
 *   - Step navigation is exposed both via accessible name
 *     (`goToStep`) and via the Next/Previous buttons so React's
 *     wizard (which may use a different control surface) can reuse
 *     either path.
 *   - The mat-select / mat-dialog helpers are intentionally private —
 *     React's shadcn equivalents can replace the implementation
 *     without breaking the public API.
 */
export class CreateClientPage extends BasePage {
  /**
   * The URL path for the create-client page, sourced from the
   * Layer-2 route registry.
   */
  readonly url = ROUTES.clientCreate;

  /**
   * Creates a new CreateClientPage instance.
   * @param page - The Playwright Page instance
   */
  constructor(page: Page) {
    super(page);
  }

  // ── Stepper shell ──────────────────────────────────────────────────

  /**
   * Returns the root `<mat-stepper>` container.
   */
  get stepperRoot(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.stepperRoot);
  }

  /**
   * Returns the step header that matches the given accessible label
   * (e.g. "General", "Family Members", "Address", "Preview").
   *
   * The non-linear mat-stepper renders step headers with `role="tab"`,
   * which mirrors the React shadcn tablist contract.
   * @param label - The visible step label to target
   */
  stepHeader(label: string): Locator {
    return this.page.getByRole(CREATE_CLIENT_SELECTORS.stepHeaderRole, { name: label });
  }

  /**
   * Returns the "Next" button for the currently active step.
   */
  get nextButton(): Locator {
    return this.page
      .locator(CREATE_CLIENT_SELECTORS.nextButton)
      .or(this.page.getByRole('button', { name: 'Next' }))
      .first();
  }

  /**
   * Returns the "Previous" button for the currently active step.
   */
  get previousButton(): Locator {
    return this.page
      .locator(CREATE_CLIENT_SELECTORS.previousButton)
      .or(this.page.getByRole('button', { name: 'Previous' }))
      .first();
  }

  /**
   * Returns the final Preview-step "Submit" button.
   */
  get previewSubmitButton(): Locator {
    return this.page.getByRole('button', { name: CREATE_CLIENT_SELECTORS.previewSubmitButton });
  }

  /**
   * Returns all validation error messages currently rendered.
   */
  get validationErrors(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.validationError);
  }

  // ── General step locators ─────────────────────────────────────────

  get officeDropdown(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.officeDropdown);
  }

  get legalFormDropdown(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.legalFormDropdown);
  }

  get firstnameInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.firstnameInput);
  }

  get middlenameInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.middlenameInput);
  }

  get lastnameInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.lastnameInput);
  }

  get fullnameInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.fullnameInput);
  }

  get externalIdInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.externalIdInput);
  }

  get mobileInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.mobileInput);
  }

  get emailInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.emailInput);
  }

  get dateOfBirthInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.dateOfBirthInput);
  }

  get clientTypeDropdown(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.clientTypeDropdown);
  }

  get clientClassificationDropdown(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.clientClassificationDropdown);
  }

  get submittedOnDateInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.submittedOnDateInput);
  }

  get activeCheckbox(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.activeCheckbox);
  }

  get activationDateInput(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.activationDateInput);
  }

  // ── Family / Address dialog locators ──────────────────────────────

  /**
   * Returns the "Add" button that opens the family-member dialog
   * (scoped to the Family Members step panel).
   */
  get addFamilyMemberButton(): Locator {
    return this.page
      .locator('mifosx-client-family-members-step')
      .getByRole('button', { name: CREATE_CLIENT_SELECTORS.addFamilyMemberButton });
  }

  /**
   * Returns the open family-member dialog container.
   */
  get familyMemberDialog(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.familyMemberDialog);
  }

  /**
   * Returns the "Add" button that opens the address dialog
   * (scoped to the Address step panel).
   */
  get addAddressButton(): Locator {
    return this.page
      .locator('mifosx-client-address-step')
      .getByRole('button', { name: CREATE_CLIENT_SELECTORS.addAddressButton });
  }

  /**
   * Returns the open address dialog container.
   */
  get addressDialog(): Locator {
    return this.page.locator(CREATE_CLIENT_SELECTORS.addressDialog);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────

  /**
   * Waits until the create-client wizard is loaded and the stepper is
   * interactive.
   */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(/\/clients\/create(?:[/?#]|$)/);
    await this.waitForVisible(this.stepperRoot, 30000);
    await this.waitForVisible(this.officeDropdown, 30000);
  }

  // ── Step navigation ────────────────────────────────────────────────

  /**
   * Navigates to a named step by clicking its header. Safe to use
   * because the stepper is non-linear in the Angular implementation.
   * @param label - The visible step label to activate
   */
  async goToStep(label: string): Promise<void> {
    const header = this.stepHeader(label);
    await this.waitForVisible(header, 10000);
    await header.click();
  }

  /**
   * Clicks the active step's "Next" button.
   */
  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  /**
   * Clicks the active step's "Previous" button.
   */
  async clickPrevious(): Promise<void> {
    await this.previousButton.click();
  }

  // ── General step ──────────────────────────────────────────────────

  /**
   * Fills the General step of the create-client wizard.
   *
   * The Angular form rebuilds its name controls in response to the
   * `legalFormId` value (PERSON ⇢ first/middle/last, ENTITY ⇢
   * fullname), so the helper selects the legal form first, awaits the
   * dependent controls, and then fills the rest.
   *
   * Required fields (`office`, `legalForm`) throw if missing. Name
   * fields are validated against the chosen legal form to surface
   * spec bugs early instead of producing opaque form-validation
   * failures.
   *
   * @param data - The general-step data to fill
   */
  async fillGeneralStep(data: GeneralStepData): Promise<void> {
    if (!data.office) {
      throw new Error('CreateClientPage.fillGeneralStep: `office` is required.');
    }
    if (!data.legalForm) {
      throw new Error('CreateClientPage.fillGeneralStep: `legalForm` is required.');
    }

    // 1. Office dropdown
    await this.selectMatOption(this.officeDropdown, data.office);

    // 2. Legal form dropdown — drives which name controls are rendered.
    await this.selectMatOption(this.legalFormDropdown, this.legalFormLabel(data.legalForm));

    if (data.legalForm === 'PERSON') {
      if (!data.firstname || !data.lastname) {
        throw new Error(
          'CreateClientPage.fillGeneralStep: `firstname` and `lastname` are required for PERSON legal form.'
        );
      }
      await this.waitForVisible(this.firstnameInput, 10000);
      await this.firstnameInput.fill(data.firstname);
      if (data.middlename) {
        await this.middlenameInput.fill(data.middlename);
      }
      await this.lastnameInput.fill(data.lastname);
    } else {
      if (!data.fullname) {
        throw new Error('CreateClientPage.fillGeneralStep: `fullname` is required for ENTITY legal form.');
      }
      await this.waitForVisible(this.fullnameInput, 10000);
      await this.fullnameInput.fill(data.fullname);
    }

    // 3. Optional fields
    if (data.externalId !== undefined) {
      await this.externalIdInput.fill(data.externalId);
    }
    if (data.mobileNo !== undefined) {
      await this.mobileInput.fill(data.mobileNo);
    }
    if (data.email !== undefined) {
      await this.emailInput.fill(data.email);
    }
    if (data.dateOfBirth !== undefined) {
      await this.dateOfBirthInput.fill(data.dateOfBirth);
      await this.dateOfBirthInput.blur();
    }
    if (data.clientType !== undefined) {
      await this.selectMatOption(this.clientTypeDropdown, data.clientType);
    }
    if (data.clientClassification !== undefined) {
      await this.selectMatOption(this.clientClassificationDropdown, data.clientClassification);
    }
    if (data.submittedOnDate !== undefined) {
      await this.submittedOnDateInput.fill(data.submittedOnDate);
      await this.submittedOnDateInput.blur();
    }
    if (data.active) {
      if (!data.activationDate) {
        throw new Error('CreateClientPage.fillGeneralStep: `activationDate` is required when `active` is true.');
      }
      await this.activeCheckbox.click();
      await this.waitForVisible(this.activationDateInput, 10000);
      await this.activationDateInput.fill(data.activationDate);
      await this.activationDateInput.blur();
    }
  }

  // ── Family step ───────────────────────────────────────────────────

  /**
   * Adds the supplied family members one at a time by opening the
   * `ClientFamilyMemberDialogComponent` dialog and confirming each
   * entry.
   *
   * Pass an empty array (or omit the call) to skip the family step.
   * @param members - The family members to add
   */
  async fillFamilyStep(members: FamilyMemberData[] = []): Promise<void> {
    for (const member of members) {
      await this.addFamilyMember(member);
    }
  }

  /**
   * Opens the family-member dialog, fills the required fields and
   * clicks "Confirm".
   * @param member - The family member to add
   */
  async addFamilyMember(member: FamilyMemberData): Promise<void> {
    await this.waitForVisible(this.addFamilyMemberButton, 10000);
    await this.addFamilyMemberButton.click();
    await this.waitForVisible(this.familyMemberDialog, 10000);

    const dialog = this.familyMemberDialog;
    await dialog.locator(CREATE_CLIENT_SELECTORS.familyMemberFirstnameInput).fill(member.firstName);
    if (member.middleName) {
      await dialog.locator(CREATE_CLIENT_SELECTORS.familyMemberMiddlenameInput).fill(member.middleName);
    }
    await dialog.locator(CREATE_CLIENT_SELECTORS.familyMemberLastnameInput).fill(member.lastName);

    await this.selectMatOption(
      dialog.locator(CREATE_CLIENT_SELECTORS.familyMemberRelationshipDropdown),
      member.relationship
    );
    await this.selectMatOption(dialog.locator(CREATE_CLIENT_SELECTORS.familyMemberGenderDropdown), member.gender);

    if (member.dateOfBirth) {
      const dobInput = dialog.locator(CREATE_CLIENT_SELECTORS.familyMemberDobInput);
      await dobInput.fill(member.dateOfBirth);
      await dobInput.blur();
    }

    await dialog.getByRole('button', { name: CREATE_CLIENT_SELECTORS.familyMemberConfirmButton }).click();
    await this.waitForHidden(dialog, 10000);
  }

  // ── Address step ──────────────────────────────────────────────────

  /**
   * Adds the supplied addresses one at a time by opening the
   * `FormDialogComponent` (driven by `clientAddressFieldConfig`) and
   * submitting each entry.
   *
   * Skips the call entirely when `clientTemplate.isAddressEnabled` is
   * false in the tenant — callers should guard with a behavior flag
   * or template inspection if the address step is conditionally
   * rendered.
   *
   * @param addresses - The address rows to add
   */
  async fillAddressStep(addresses: AddressData[] = []): Promise<void> {
    for (const address of addresses) {
      await this.addAddress(address);
    }
  }

  /**
   * Opens the address dialog, fills any fields supplied in `address`
   * (skipping the ones whose locator is not currently rendered, since
   * the dialog is field-config driven) and submits.
   * @param address - The address row to add
   */
  async addAddress(address: AddressData): Promise<void> {
    await this.waitForVisible(this.addAddressButton, 10000);
    await this.addAddressButton.click();
    await this.waitForVisible(this.addressDialog, 10000);

    const dialog = this.addressDialog;

    if (address.addressType) {
      const typeDropdown = dialog.locator(CREATE_CLIENT_SELECTORS.addressTypeDropdown);
      if (await typeDropdown.isVisible()) {
        await this.selectMatOption(typeDropdown, address.addressType);
      }
    }
    await this.fillIfVisible(dialog.locator(CREATE_CLIENT_SELECTORS.addressStreetInput), address.street);
    await this.fillIfVisible(dialog.locator(CREATE_CLIENT_SELECTORS.addressLine1Input), address.addressLine1);
    await this.fillIfVisible(dialog.locator(CREATE_CLIENT_SELECTORS.addressCityInput), address.city);
    await this.fillIfVisible(dialog.locator(CREATE_CLIENT_SELECTORS.addressPostalCodeInput), address.postalCode);

    if (address.country) {
      const countryDropdown = dialog.locator(CREATE_CLIENT_SELECTORS.addressCountryDropdown);
      if (await countryDropdown.isVisible()) {
        await this.selectMatOption(countryDropdown, address.country);
      }
    }

    await dialog.getByRole('button', { name: CREATE_CLIENT_SELECTORS.addressSubmitButton }).click();
    await this.waitForHidden(dialog, 10000);
  }

  // ── Preview & submit ──────────────────────────────────────────────

  /**
   * Activates the Preview step and clicks "Submit".
   *
   * Waits for navigation to the freshly created client's general view
   * (`/clients/:id/general`) and resolves to the parsed numeric id so
   * specs can chain into `ClientViewPage` without re-querying the URL.
   *
   * @returns The newly created client's id, parsed from the URL.
   */
  async previewAndSubmit(): Promise<number> {
    await this.goToStep(CREATE_CLIENT_SELECTORS.stepLabelPreview);
    await this.waitForVisible(this.previewSubmitButton, 10000);
    await expect(this.previewSubmitButton).toBeEnabled();

    await Promise.all([
      this.page.waitForURL(/\/clients\/\d+(?:\/general)?$/, {
        waitUntil: 'networkidle',
        timeout: 30000
      }),
      this.previewSubmitButton.click()
    ]);

    const match = this.page.url().match(/\/clients\/(\d+)(?:\/general)?(?:[/?#]|$)/);
    if (!match) {
      throw new Error(`CreateClientPage.previewAndSubmit: unable to parse client id from URL ${this.page.url()}`);
    }
    return Number(match[1]);
  }

  // ── Helpers (private) ─────────────────────────────────────────────

  /**
   * Maps the cross-framework `LegalForm` enum to the visible label
   * rendered by the Angular mat-select.
   *
   * The label text comes from `legalFormOptions` in the tenant's
   * client template and is translated via the `translateKey: 'inputs'`
   * pipe (see `client-general-step.component.html`).
   */
  private legalFormLabel(form: LegalForm): string {
    return form === 'PERSON' ? 'Person' : 'Entity';
  }

  /**
   * Opens a `<mat-select>` and picks the option whose visible text
   * matches `optionLabel`. Wraps the click sequence required by
   * Angular Material (open trigger → overlay option) so callers don't
   * have to repeat it for every dropdown.
   */
  private async selectMatOption(trigger: Locator, optionLabel: string): Promise<void> {
    await trigger.click();
    const option = this.page.getByRole('option', { name: optionLabel, exact: false });
    await this.waitForVisible(option.first(), 10000);
    await option.first().click();
  }

  /**
   * Fills an input only if it is currently visible. Used for the
   * dynamic address dialog, where fields are conditionally rendered
   * based on tenant configuration.
   */
  private async fillIfVisible(locator: Locator, value: string | undefined): Promise<void> {
    if (value === undefined) {
      return;
    }
    if (await locator.isVisible()) {
      await locator.fill(value);
    }
  }
}
