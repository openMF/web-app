/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../factories/client.factory';
import { ClientIdentifiersPage } from '../../pages/kyc/client-identifiers.page';
import { ClientNotesPage } from '../../pages/kyc/client-notes.page';

/**
 * Client KYC · Identifiers and Notes.
 *
 * These two tabs share a file because they share a shape: both are
 * small CRUD surfaces layered over dialogs, and both are quick enough
 * that splitting them would cost more in duplicated client setup than
 * it buys in isolation.
 *
 * ── The two traps being pinned here ─────────────────────────────────
 *
 * 1. The add-identifier dialog is the *shared* upload dialog, and its
 *    `fileName` control is `required` even in identifier mode where no
 *    file is ever sent. Skip it and Submit never enables.
 *
 * 2. The edit-note dialog disables Confirm while the form is
 *    `pristine`, and the component discards an unchanged value. An
 *    "edit" that writes the same text is silently a no-op.
 */
test.describe('Client KYC · Identifiers', () => {
  // The Add Client Identifier dialog renders document type, status,
  // document key, description, issuance date, expiry date and a file
  // upload — taller than the 720px default viewport, which pushes
  // `mat-dialog-actions` below the fold. The dialog itself does not
  // scroll, so Submit never becomes clickable and the failure reads as
  // an unexplained click timeout. Give these tests the height the form
  // actually needs rather than forcing the click.
  test.use({ viewport: { width: 1280, height: 1080 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('adds an identifier and lists it in the table', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const documentKey = `E2E-ID-${Date.now()}`;

    const identifiersPage = new ClientIdentifiersPage(page, client.resourceId);
    await identifiersPage.navigate();
    await identifiersPage.waitForLoad();
    await identifiersPage.addIdentifier({ documentKey, description: 'Added by E2E suite' });

    await expect(identifiersPage.identifierRowByKey(documentKey)).toBeVisible({ timeout: 30000 });

    const identifiers = await fineractApi.getClientIdentifiers(client.resourceId);
    const created = identifiers.find((entry) => entry?.documentKey === documentKey);
    expect(created).toBeDefined();

    cleanupGuard.register(`identifier:${created.id}`, async () => {
      await fineractApi.deleteClientIdentifier(client.resourceId, created.id);
    });
  });

  test('deletes an identifier through the confirm dialog', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const documentKey = `E2E-ID-${Date.now()}`;

    const identifiersPage = new ClientIdentifiersPage(page, client.resourceId);
    await identifiersPage.navigate();
    await identifiersPage.waitForLoad();
    await identifiersPage.addIdentifier({ documentKey });
    await expect(identifiersPage.identifierRowByKey(documentKey)).toBeVisible({ timeout: 30000 });

    await identifiersPage.deleteIdentifier(documentKey);

    await expect
      .poll(
        async () => {
          const identifiers = await fineractApi.getClientIdentifiers(client.resourceId);
          return identifiers.some((entry) => entry?.documentKey === documentKey);
        },
        { timeout: 30000 }
      )
      .toBe(false);
  });
});

test.describe('Client KYC · Notes', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('adds a note through the inline form', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const noteText = `E2E note ${Date.now()}`;

    const notesPage = new ClientNotesPage(page, client.resourceId);
    await notesPage.navigate();
    await notesPage.waitForLoad();
    await notesPage.addNote(noteText);

    const notes = await fineractApi.getClientNotes(client.resourceId);
    expect(notes.some((note) => note?.note === noteText)).toBe(true);
  });

  test('renders a new note in place without a reload', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    // ── This test guards a fixed defect ───────────────────────────
    //
    // `NotesTabComponent` used to mutate the array it passes as an
    // `@Input` to the OnPush notes list. Mutating without changing the
    // reference meant change detection never ran, so a note was saved
    // but stayed invisible until the tab was reloaded.
    //
    // The component now replaces the array and calls `markForCheck()`,
    // so the new note must appear in place. Asserting that here means
    // a regression to the old mutate-in-place pattern fails with
    // "expected visible" rather than silently reintroducing a stale UI.
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const noteText = `E2E inplace ${Date.now()}`;

    const notesPage = new ClientNotesPage(page, client.resourceId);
    await notesPage.navigate();
    await notesPage.waitForLoad();

    await notesPage.noteInput.fill(noteText);
    await expect(notesPage.addButton).toBeEnabled({ timeout: 15000 });
    await notesPage.addButton.click();

    // The write reached Fineract...
    await expect
      .poll(
        async () => {
          const notes = await fineractApi.getClientNotes(client.resourceId);
          return notes.some((note) => note?.note === noteText);
        },
        { timeout: 30000 }
      )
      .toBe(true);

    // ...and the list reflects it without any reload.
    await expect(notesPage.noteCardByText(noteText)).toBeVisible({ timeout: 30000 });
  });

  test('edits a note through the dialog', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const original = `E2E original ${Date.now()}`;
    const updated = `E2E updated ${Date.now()}`;

    const notesPage = new ClientNotesPage(page, client.resourceId);
    await notesPage.navigate();
    await notesPage.waitForLoad();
    await notesPage.addNote(original);
    await notesPage.editNote(original, updated);

    const notes = await fineractApi.getClientNotes(client.resourceId);
    expect(notes.some((note) => note?.note === updated)).toBe(true);
    expect(notes.some((note) => note?.note === original)).toBe(false);
  });

  test('deletes a note through the confirm dialog', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const noteText = `E2E removable ${Date.now()}`;

    const notesPage = new ClientNotesPage(page, client.resourceId);
    await notesPage.navigate();
    await notesPage.waitForLoad();
    await notesPage.addNote(noteText);
    await notesPage.deleteNote(noteText);

    await expect
      .poll(
        async () => {
          const notes = await fineractApi.getClientNotes(client.resourceId);
          return notes.some((note) => note?.note === noteText);
        },
        { timeout: 30000 }
      )
      .toBe(false);
  });
});
