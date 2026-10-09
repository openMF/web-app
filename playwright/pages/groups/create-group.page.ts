/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { CREATE_GROUP_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { fillDateField, selectOption } from '../material-form-helpers';

/**
 * CreateGroupPage — Page Object for `/#/groups/create`.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CREATE_GROUP_SELECTORS`
 *   - routes:    `ROUTES.groupCreate`
 *
 * ── Not a stepper ───────────────────────────────────────────────────
 *
 * Unlike the create-client flow, this is a single flat form. There are
 * no steps to advance and no per-step validation gate — Submit is
 * simply `[disabled]="!groupForm.valid"`.
 *
 * ── `activationDate` only exists while `active` is checked ──────────
 *
 * `CreateGroupComponent.buildDependencies()` subscribes to the
 * `active` control and calls `addControl('activationDate', ...)` /
 * `removeControl('activationDate')`, while the template mirrors that
 * with `@if (groupForm.controls.active.value)`. The field is therefore
 * genuinely absent from the DOM until the box is ticked — not hidden.
 *
 * That is a real trap in both directions: fill it, then untick
 * `active`, and the value is discarded along with the control.
 * {@link setActive} waits for the field to attach so callers never
 * race the subscription.
 *
 * ── The client autocomplete needs an office first ───────────────────
 *
 * The search calls `getFilteredClients(..., orphansOnly: true,
 * displayName, officeId)` using the office **currently selected in the
 * form**, and only once at least 2 characters have been typed. Two
 * consequences worth stating plainly:
 *
 *  - Searching before picking an office queries with `officeId`
 *    undefined and returns the wrong candidate set.
 *  - `orphansOnly: true` means a client already attached to any group
 *    will never appear, however exactly its name is typed. A search
 *    that returns nothing is far more often this than a bad selector.
 *
 * ── Members are staged, not saved ───────────────────────────────────
 *
 * {@link addClientMember} only pushes onto an in-memory array. Nothing
 * reaches Fineract until {@link submit}, which flattens the staged
 * clients into `data.clientMembers`. This is the opposite of the
 * manage-members screen, where each add is an immediate POST.
 */
export class CreateGroupPage extends BasePage {
  readonly url = ROUTES.groupCreate;

  /**
   * @param page - The Playwright Page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** Group name input. */
  get nameInput(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.nameInput);
  }

  /** Office `mat-select`. */
  get officeDropdown(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.officeDropdown);
  }

  /** Staff `mat-select` — disabled when the office has no staff. */
  get staffDropdown(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.staffDropdown);
  }

  /** Submitted-on datepicker input. */
  get submittedOnDateInput(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.submittedOnDateInput);
  }

  /** The `active` checkbox. */
  get activeCheckbox(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.activeCheckbox);
  }

  /**
   * Activation-date input.
   *
   * Attached to the DOM only while `active` is checked — expect a zero
   * count, not a hidden element, when it is not.
   */
  get activationDateInput(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.activationDateInput);
  }

  /** External id input. */
  get externalIdInput(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.externalIdInput);
  }

  /** Client autocomplete search box. */
  get clientSearchInput(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.clientSearchInput);
  }

  /** Icon-only "add staged client" button. */
  get addClientButton(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.addClientButton);
  }

  /** Staged client member rows. */
  get selectedClientItems(): Locator {
    return this.page.locator(CREATE_GROUP_SELECTORS.selectedClientItem);
  }

  /** Submit button. */
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: CREATE_GROUP_SELECTORS.submitButton, exact: true });
  }

  /**
   * Locate a staged client row by its display name.
   *
   * @param displayName - Any substring of the client's display name.
   */
  stagedClientByName(displayName: string): Locator {
    return this.selectedClientItems.filter({ hasText: displayName }).first();
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the create-group form to be interactive. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(/\/groups\/create/);
    await this.waitForVisible(this.nameInput, 30000);
  }

  /**
   * Fill the group name.
   *
   * Fineract's UI validator is `pattern('(^[A-z]).*')`, so the name
   * must begin with a letter — a name starting with a digit leaves
   * Submit permanently disabled.
   *
   * @param name - Group name.
   */
  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /**
   * Pick the office.
   *
   * Must happen before any client search: the search is scoped to the
   * office currently held in the form.
   *
   * @param officeName - Visible office name.
   */
  async selectOffice(officeName: string): Promise<void> {
    await selectOption(this.page, this.officeDropdown, officeName);
  }

  /**
   * Set the submitted-on date.
   *
   * @param value - Date in the tenant's display format.
   */
  async fillSubmittedOnDate(value: string): Promise<void> {
    await fillDateField(this.submittedOnDateInput, value);
  }

  /**
   * Tick or untick the `active` checkbox and wait for the
   * `activationDate` control to attach or detach accordingly.
   *
   * The wait is the point of this method. `addControl` runs in a
   * `valueChanges` subscription, so the field appears a tick after the
   * click; filling it immediately races that subscription and fails
   * intermittently rather than consistently.
   *
   * @param active - Desired checkbox state.
   */
  async setActive(active: boolean): Promise<void> {
    const isChecked = (await this.activeCheckbox.getAttribute('class'))?.includes('mat-mdc-checkbox-checked') ?? false;
    if (isChecked !== active) {
      // Material renders the real control as a visually-hidden input
      // inside the `mat-checkbox` host, so click the host's label.
      await this.activeCheckbox.locator('label').click();
    }

    if (active) {
      await expect(this.activationDateInput).toBeVisible({ timeout: 15000 });
    } else {
      await expect(this.activationDateInput).toHaveCount(0, { timeout: 15000 });
    }
  }

  /**
   * Set the activation date.
   *
   * Call {@link setActive} with `true` first — the control does not
   * exist otherwise.
   *
   * @param value - Date in the tenant's display format.
   */
  async fillActivationDate(value: string): Promise<void> {
    await fillDateField(this.activationDateInput, value);
  }

  /**
   * Search for a client and stage it as a member.
   *
   * Requires an office to have been selected. The client must be
   * active and not already in a group, or `orphansOnly=true` filters
   * it out of the results.
   *
   * @param displayName - Client display name, or a prefix of it long
   *   enough to be unique. At least 2 characters are required before
   *   the search fires at all.
   */
  async addClientMember(displayName: string): Promise<void> {
    await this.clientSearchInput.fill(displayName);

    const option = this.page.getByRole('option', { name: displayName });
    await option.first().waitFor({ state: 'visible', timeout: 30000 });
    await option.first().click();

    // The add button lives in a block guarded by `@if (clientChoice.value)`,
    // so it only exists once an option has actually been chosen —
    // typing alone is not enough.
    await expect(this.addClientButton).toBeVisible({ timeout: 15000 });
    await this.addClientButton.click();
    await expect(this.stagedClientByName(displayName)).toBeVisible({ timeout: 15000 });
  }

  /**
   * Remove a staged client member.
   *
   * @param displayName - Substring identifying the staged client.
   */
  async removeClientMember(displayName: string): Promise<void> {
    const row = this.stagedClientByName(displayName);
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.locator(CREATE_GROUP_SELECTORS.removeClientButton).click();
    await expect(this.stagedClientByName(displayName)).toBeHidden({ timeout: 15000 });
  }

  /**
   * Submit the form and wait for the redirect to the new group's
   * General tab.
   *
   * The click alone only *starts* the POST; the component navigates in
   * the response handler. Waiting for the URL is what makes the group
   * id readable and stops callers racing Fineract.
   *
   * @returns The new group's id, parsed from the redirect URL.
   */
  async submit(): Promise<number> {
    await expect(this.submitButton).toBeEnabled({ timeout: 15000 });
    await this.submitButton.click();

    await this.page.waitForURL(/\/groups\/\d+\/general/, { timeout: 60000 });

    const match = /\/groups\/(\d+)\/general/.exec(this.page.url());
    if (!match) {
      throw new Error(`CreateGroupPage.submit: could not parse group id from URL ${this.page.url()}`);
    }
    return Number(match[1]);
  }
}
