/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4308';

/** Synthetic read contracts: no authentication credentials or financial writes to a real backend. */
export default defineConfig({
  testDir: './playwright/tests',
  testMatch: [
    'savings-deposit-selection.spec.ts',
    'savings-deposit-details.spec.ts',
    'savings-deposit-confirmation.spec.ts'
  ],
  timeout: 60000,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    storageState: { cookies: [], origins: [] },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start:local -- --host 127.0.0.1 --port 4308',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180000
      }
});
