/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { FAMILY_MEMBERS_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { selectOption, fillDateField, fillIfVisible, confirmDialog } from '../material-form-helpers';
import { loggedSleep } from '../../utils/sleep';

/** Form payload accepted by the add/edit family member forms. */
export interface FamilyMemberFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  qualification?: string;
  age?: string;
  /** Option label, not id — the dropdown is template-driven. */
  relationship?: string;
  gender?: string;
  profession?: string;
  maritalStatus?: string;
  dateOfBirth?: string;
}

/**
 * FamilyMembersPage — Page Object for the client Family Members tab
 * and its add/edit forms.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `FAMILY_MEMBERS_SELECTORS`
 *   - routes:    `ROUTES.clientFamilyMembers(...)` and friends
 *
 * ── Route-driven, unlike the other KYC tabs ─────────────────────────
 *
 * Identifiers, documents and notes all edit through dialogs. Family
 * members instead navigate to `/family-members/add` and
 * `/family-members/:id/edit`, so this page object drives URL changes
 * rather than overlay state — worth knowing before reaching for
 * `confirmDialog` here. Delete *is* a dialog, and its affirmative
 * button reads "Confirm".
 *
 * ── The accordion hides the row actions ─────────────────────────────
 *
 * Each member is a `mat-expansion-panel` whose Edit and Delete buttons
 * live in the panel body. Material does not render collapsed panel
 * content, so those buttons are absent from the DOM — not merely
 * hidden — until the panel is expanded. {@link expandMember} exists so
 * callers cannot skip that step and misread the resulting "no such
 * element" as a bad selector.
 *
 * ── Template-driven dropdowns ───────────────────────────────────────
 *
 * Relationship, gender, profession and marital status come from the
 * family-member template endpoint. Relationship and gender are
 * `required`, so on a tenant with no configured code values the form
 * can never be submitted. Specs assert on that explicitly rather than
 * timing out on a permanently disabled Submit.
 */
export class FamilyMembersPage extends BasePage {
  readonly url: string;

  /**
   * @param page - The Playwright Page instance.
   * @param clientId - Owning client id.
   */
  constructor(
    page: Page,
    private readonly clientId: number
  ) {
    super(page);
    this.url = ROUTES.clientFamilyMembers(clientId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  get addButton(): Locator {
    return this.page.getByRole('button', { name: FAMILY_MEMBERS_SELECTORS.addButton, exact: true });
  }

  /** All family member accordion panels. */
  get memberPanels(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.panel);
  }

  get firstNameInput(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.firstNameInput);
  }

  get middleNameInput(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.middleNameInput);
  }

  get lastNameInput(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.lastNameInput);
  }

  get qualificationInput(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.qualificationInput);
  }

  get ageInput(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.ageInput);
  }

  get relationshipDropdown(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.relationshipDropdown);
  }

  get genderDropdown(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.genderDropdown);
  }

  get professionDropdown(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.professionDropdown);
  }

  get maritalStatusDropdown(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.maritalStatusDropdown);
  }

  get dateOfBirthInput(): Locator {
    return this.page.locator(FAMILY_MEMBERS_SELECTORS.dateOfBirthInput);
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: FAMILY_MEMBERS_SELECTORS.submitButton });
  }

  /**
   * Locate a member's panel by the name shown in its header.
   *
   * @param name - Any substring of the rendered display name.
   */
  memberPanelByName(name: string): Locator {
    return this.memberPanels.filter({ hasText: name }).first();
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the family members tab to load. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/family-members`));
  }

  /** Navigate to the add-family-member form. */
  async openAddForm(): Promise<void> {
    await this.page.goto(ROUTES.clientFamilyMemberAdd(this.clientId));
    await this.waitForVisible(this.firstNameInput, 30000);
  }

  /**
   * Read the option labels offered by a template-driven dropdown.
   *
   * Used to pick a valid value without hard-coding tenant-specific
   * code values, and to let a spec state plainly that the dropdown is
   * empty rather than fail on a disabled Submit.
   *
   * @param dropdown - The `mat-select` to inspect.
   * @returns The visible option labels, in render order.
   */
  async getDropdownOptions(dropdown: Locator): Promise<string[]> {
    await dropdown.click();
    const options = this.page.getByRole('option');
    await loggedSleep(250, 'mat-select overlay: let template-driven options render before counting');
    const count = await options.count();
    const labels: string[] = [];
    for (let index = 0; index < count; index += 1) {
      labels.push((await options.nth(index).innerText()).trim());
    }
    // Close the overlay so the next interaction is not intercepted —
    // the same class of failure the datepicker helper guards against.
    await this.page.keyboard.press('Escape');
    await options
      .first()
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => undefined);
    return labels;
  }

  /**
   * Fill the add/edit form. Every field except the names is optional,
   * and an omitted dropdown is simply left untouched.
   *
   * @param data - See {@link FamilyMemberFormData}.
   */
  async fillForm(data: FamilyMemberFormData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await fillIfVisible(this.middleNameInput, data.middleName);
    await fillIfVisible(this.qualificationInput, data.qualification);
    await fillIfVisible(this.ageInput, data.age);

    if (data.relationship) {
      await selectOption(this.page, this.relationshipDropdown, data.relationship);
    }
    if (data.gender) {
      await selectOption(this.page, this.genderDropdown, data.gender);
    }
    if (data.profession) {
      await selectOption(this.page, this.professionDropdown, data.profession);
    }
    if (data.maritalStatus) {
      await selectOption(this.page, this.maritalStatusDropdown, data.maritalStatus);
    }
    if (data.dateOfBirth) {
      await fillDateField(this.dateOfBirthInput, data.dateOfBirth);
    }
  }

  /**
   * Submit the add/edit form and wait for the return to the list.
   *
   * Waits for the family-members list route itself, not merely for
   * `/add` or `/edit` to disappear: a negative predicate also accepts
   * an unexpected destination, so a failed resolver that bounces the
   * app to `#/` would satisfy it and every later assertion would then
   * run against the wrong page.
   */
  async submitForm(): Promise<void> {
    await expect(this.submitButton).toBeEnabled({ timeout: 15000 });
    await this.submitButton.click();
    await this.page.waitForURL((url) => url.hash === `#/clients/${this.clientId}/family-members`, { timeout: 30000 });
  }

  /**
   * Expand a member's panel so its Edit/Delete buttons enter the DOM.
   *
   * @param name - Any substring of the member's display name.
   */
  async expandMember(name: string): Promise<void> {
    const panel = this.memberPanelByName(name);
    await expect(panel).toBeVisible({ timeout: 30000 });
    await panel.locator(FAMILY_MEMBERS_SELECTORS.panelHeader).click();
    await expect(panel.getByRole('button', { name: FAMILY_MEMBERS_SELECTORS.deleteButton })).toBeVisible({
      timeout: 15000
    });
  }

  /**
   * Expand a member and open its edit form.
   *
   * @param name - Any substring of the member's display name.
   */
  async openEditForm(name: string): Promise<void> {
    await this.expandMember(name);
    await this.memberPanelByName(name).getByRole('button', { name: FAMILY_MEMBERS_SELECTORS.editButton }).click();
    await this.page.waitForURL(/\/edit$/, { timeout: 30000 });
    await this.waitForVisible(this.firstNameInput, 30000);
  }

  /**
   * Expand a member, delete it, and confirm the dialog.
   *
   * @param name - Any substring of the member's display name.
   */
  async deleteMember(name: string): Promise<void> {
    await this.expandMember(name);
    await this.memberPanelByName(name).getByRole('button', { name: FAMILY_MEMBERS_SELECTORS.deleteButton }).click();
    await confirmDialog(this.page, 'Confirm');
  }
}
