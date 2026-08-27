/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { CLIENT_NOTES_SELECTORS } from '../../config/selectors';
import { ROUTES } from '../../config/routes';
import { confirmDialog } from '../material-form-helpers';

/**
 * ClientNotesPage — Page Object for the client Notes tab
 * (`/#/clients/:id/notes`), rendered by the shared
 * `mifosx-entity-notes-tab`.
 *
 * Consumes Layer-2 contracts:
 *   - selectors: `CLIENT_NOTES_SELECTORS`
 *   - routes:    `ROUTES.clientNotes(id)`
 *
 * ── Known app defect: the list does not update in place ────────────
 *
 * `NotesTabComponent` mutates its notes array (`entityNotes.push(...)`,
 * `entityNotes[i].note = ...`, `splice(...)`) and passes that same
 * array as an `@Input` into `EntityNotesTabComponent`, which is
 * `ChangeDetectionStrategy.OnPush`. Mutating without changing the
 * reference means change detection never runs, so **an added, edited
 * or deleted note is not reflected until the tab is reloaded** — even
 * though the API call succeeded.
 *
 * Verified against a live backend: after adding a note the tab still
 * reads "No notes available", while `GET /clients/:id/notes` returns
 * the new note.
 *
 * Each mutating method here therefore reloads before asserting, and
 * the reload is deliberately *not* hidden — if the app is fixed to
 * update in place these methods still pass, and the day someone
 * removes the reload the failure will point straight back at this
 * docstring.
 *
 * ── Three different interaction models in one tab ───────────────────
 *
 * Add is an inline form; edit is a generic `FormDialogComponent`;
 * delete is the generic delete dialog. Both dialogs label their
 * affirmative button "Confirm", so the delete confirmation cannot be
 * found by looking for "Delete".
 *
 * ── The pristine trap on edit ───────────────────────────────────────
 *
 * The edit dialog's Confirm button is `[disabled]="!form.valid ||
 * form.pristine"`, and the component additionally discards the result
 * when the text is unchanged. A spec that "edits" a note to the same
 * value therefore hangs on a permanently disabled button and looks
 * like a broken selector. {@link editNote} always replaces the field
 * contents so the control genuinely becomes dirty.
 *
 * ── Ordering ────────────────────────────────────────────────────────
 *
 * Fineract returns notes newest-first, and the template renders them
 * in array order. Locating by text rather than index keeps specs
 * stable when a client accumulates more than one note.
 */
export class ClientNotesPage extends BasePage {
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
    this.url = ROUTES.clientNotes(clientId);
  }

  // ── Locators ───────────────────────────────────────────────────────

  /** The inline add-note textarea. */
  get noteInput(): Locator {
    return this.page.locator(CLIENT_NOTES_SELECTORS.noteInput);
  }

  /** Submit button of the inline add form. */
  get addButton(): Locator {
    return this.page.getByRole('button', { name: CLIENT_NOTES_SELECTORS.addButton, exact: true });
  }

  /** All rendered note cards. */
  get noteCards(): Locator {
    return this.page.locator(CLIENT_NOTES_SELECTORS.noteItem);
  }

  /**
   * The text input inside the edit dialog.
   *
   * Located by accessible name rather than form-control attribute —
   * the generic form dialog binds `[formControlName]` as a property,
   * so no matching attribute reaches the DOM.
   */
  get editDialogInput(): Locator {
    return this.page
      .locator('mat-dialog-container')
      .getByRole('textbox', { name: CLIENT_NOTES_SELECTORS.editDialogInput });
  }

  /**
   * Locate a note card by its body text.
   *
   * @param text - Any substring of the note content.
   */
  noteCardByText(text: string): Locator {
    return this.noteCards.filter({ hasText: text }).first();
  }

  // ── Actions ────────────────────────────────────────────────────────

  /** Waits for the notes tab to load. */
  async waitForLoad(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/clients/${this.clientId}/notes`));
    await this.waitForVisible(this.noteInput, 30000);
  }

  /**
   * Reload the tab so the notes list re-resolves from the server.
   *
   * Necessary because the component mutates its notes array in place —
   * see the class docstring. Kept public so a spec can state plainly
   * that it is asserting post-reload state.
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForLoad();
  }

  /**
   * Add a note through the inline form.
   *
   * Reloads before asserting, because the list does not update in
   * place.
   *
   * @param text - Note body.
   */
  async addNote(text: string): Promise<void> {
    await this.noteInput.fill(text);
    await expect(this.addButton).toBeEnabled({ timeout: 15000 });
    await this.addButton.click();

    // The form resets itself synchronously in `addNote()`, so an empty
    // textarea is not evidence the POST completed. Reloading and
    // finding the note is.
    await this.reload();
    await expect(this.noteCardByText(text)).toBeVisible({ timeout: 30000 });
  }

  /**
   * Edit an existing note.
   *
   * Clears before typing so the dialog's form becomes dirty — see the
   * class docstring for why an unchanged value silently no-ops.
   *
   * @param currentText - Substring identifying the note to edit.
   * @param newText - Replacement body; must differ from the current one.
   */
  async editNote(currentText: string, newText: string): Promise<void> {
    const card = this.noteCardByText(currentText);
    await expect(card).toBeVisible({ timeout: 30000 });
    await card.getByRole('button', { name: CLIENT_NOTES_SELECTORS.editButton }).click();

    await this.waitForVisible(this.editDialogInput, 15000);
    await this.editDialogInput.fill('');
    await this.editDialogInput.fill(newText);

    await confirmDialog(this.page, CLIENT_NOTES_SELECTORS.confirmButton);

    await this.reload();
    await expect(this.noteCardByText(newText)).toBeVisible({ timeout: 30000 });
  }

  /**
   * Delete a note and confirm.
   *
   * @param text - Substring identifying the note to remove.
   */
  async deleteNote(text: string): Promise<void> {
    const card = this.noteCardByText(text);
    await expect(card).toBeVisible({ timeout: 30000 });
    await card.getByRole('button', { name: CLIENT_NOTES_SELECTORS.deleteButton }).click();
    await confirmDialog(this.page, CLIENT_NOTES_SELECTORS.confirmButton);
    await this.reload();
  }

  /** Count the currently rendered note cards. */
  async getNoteCount(): Promise<number> {
    return this.noteCards.count();
  }
}
