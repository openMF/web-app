/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test as base } from '@playwright/test';
import { BEHAVIOR } from '../config/behavior';

/**
 * Restores the logged-in session in every browser context a test uses.
 *
 * Playwright's `storageState` persists cookies and localStorage only.
 * When the app keeps its credentials in sessionStorage
 * (`BEHAVIOR.authStorage === 'session'`, the Angular case), the auth
 * setup mirrors them into localStorage, and this fixture copies them
 * back into sessionStorage before any app script runs on each page
 * load. When the app keeps them in localStorage (the React case),
 * `storageState` already restores them and the fixture adds nothing.
 *
 * It overrides the built-in `context` fixture instead of adding an auto
 * fixture, so it only runs for tests that open a page. Specs that never
 * touch the browser, such as the `integration` factory specs that import
 * `test` from `test-fixtures.ts`, still start no browser.
 *
 * Specs that need no API fixtures can import `test` from here directly;
 * everything else imports it from `test-fixtures.ts`, which builds on
 * this one.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    if (BEHAVIOR.authStorage === 'session') {
      await context.addInitScript((storageKey) => {
        const credentials = localStorage.getItem(storageKey);
        if (credentials) {
          sessionStorage.setItem(storageKey, credentials);
        }
      }, BEHAVIOR.authStorageKey);
    }
    await use(context);
  }
});

export { expect } from '@playwright/test';
