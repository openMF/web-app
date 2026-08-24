/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { CLIENT_IDENTIFIERS_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { selectOption, confirmDialog } from '../material-form-helpers';

/**
 * ClientIdentifiersPage — Page Object for the client Identifiers tab
 * (`/#/clients/:id/identities`).
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CLIENT_IDENTIFIERS_SELECTORS`
 *   - routes:    `ROUTES.clientIdentities(id)`
 *
 * ── The add dialog is shared with Documents ─────────────────────────
 *
 * Both tabs open `UploadDocumentDialogComponent`; a `documentIdentifier`
 * flag switches four identifier-only controls into the same form. One
 * consequence leaks through: `fileName` is marked `required` on the
 * shared form even in identifier mode, where the component only
 * uploads anything if `response.file` is set.
 *
 * So {@link addIdentifier} always fills a file name and never attaches
 * a file. Omitting it leaves Submit permanently disabled, which
 * presents as a mysterious timeout on a button that looks fine.
 *
 * ── Delete confirmation ─────────────────────────────────────────────
 *
 * Goes through the generic delete dialog, whose affirmative button is
 * labelled "Confirm" rather than "Delete".
 */
export class ClientIdentifiersPage extends BasePage {
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
    this.url = ROUTES.clientIdentities(clientId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  get addButton(): Locator {
    return this.page.getByRole('button', { name: CLIENT_IDENTIFIERS_SELECTORS.addButton, exact: true });
  }

  /** Rows of the identifiers table. */
  get identifierRows(): Locator {
    return this.page.locator(CLIENT_IDENTIFIERS_SELECTORS.row);
  }

  /** The open add-identifier dialog. */
  get dialog(): Locator {
    return this.page.locator('mat-dialog-container');
  }

  get documentTypeDropdown(): Locator {
    return this.dialog.locator(CLIENT_IDENTIFIERS_SELECTORS.documentTypeDropdown);
  }

  get statusDropdown(): Locator {
    return this.dialog.locator(CLIENT_IDENTIFIERS_SELECTORS.statusDropdown);
  }

  get documentKeyInput(): Locator {
    return this.dialog.locator(CLIENT_IDENTIFIERS_SELECTORS.documentKeyInput);
  }

  get descriptionInput(): Locator {
    return this.dialog.locator(CLIENT_IDENTIFIERS_SELECTORS.descriptionInput);
  }

  get fileNameInput(): Locator {
    return this.dialog.locator(CLIENT_IDENTIFIERS_SELECTORS.fileNameInput);
  }

  /**
   * Locate an identifier row by its document key.
   *
   * @param documentKey - The unique key entered when adding.
   */
  identifierRowByKey(documentKey: string): Locator {
    return this.identifierRows.filter({ hasText: documentKey }).first();
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the identifiers tab to load. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/identities`));
    await this.waitForVisible(this.addButton, 30000);
  }

  /** Open the add-identifier dialog. */
  async openAddDialog(): Promise<void> {
    await this.addButton.click();
    await this.waitForVisible(this.dialog, 15000);
    await this.waitForVisible(this.documentKeyInput, 15000);
  }

  /**
   * Add an identifier through the dialog.
   *
   * @param data.documentKey - The identifier value; also how specs
   *   locate the resulting row.
   * @param data.documentType - Option label. Defaults to the first
   *   available type, since allowed types are tenant configuration.
   * @param data.status - "Active" or "Inactive".
   * @param data.description - Optional free text.
   */
  async addIdentifier(data: {
    documentKey: string;
    documentType?: string;
    status?: string;
    description?: string;
  }): Promise<void> {
    await this.openAddDialog();

    if (data.documentType) {
      await selectOption(this.page, this.documentTypeDropdown, data.documentType);
    } else {
      await this.documentTypeDropdown.click();
      await this.page.getByRole('option').first().click();
    }

    await selectOption(this.page, this.statusDropdown, data.status ?? 'Active');
    await this.documentKeyInput.fill(data.documentKey);

    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }

    // Required by the shared form even though no file is attached.
    await this.fileNameInput.fill(data.documentKey);

    const submit = this.dialog.getByRole('button', { name: CLIENT_IDENTIFIERS_SELECTORS.dialogSubmitButton });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await submit.click();
    await expect(this.dialog).toBeHidden({ timeout: 15000 });
  }

  /**
   * Delete an identifier row and confirm.
   *
   * @param documentKey - The identifier value to remove.
   */
  async deleteIdentifier(documentKey: string): Promise<void> {
    const row = this.identifierRowByKey(documentKey);
    await expect(row).toBeVisible({ timeout: 30000 });
    await row.locator(CLIENT_IDENTIFIERS_SELECTORS.deleteRowButton).first().click();
    await confirmDialog(this.page, CLIENT_IDENTIFIERS_SELECTORS.confirmDeleteButton);
  }
}
