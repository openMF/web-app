/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { defineConfig, devices } from '@playwright/test';
/** Deterministic UI tests use synthetic HTTP fixtures; the live spec opts into local Fineract. */
export default defineConfig({
  testDir: './playwright/tests',
  testMatch: /investment-products(?:\.live)?\.spec\.ts/,
  timeout: 60000,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    [
      'html',
      { outputFolder: 'playwright-report/investment', open: 'never' }
    ]
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4200',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    storageState: { cookies: [], origins: [] }
  },
  webServer: {
    command: 'npm run start:local',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 180000
  }
});
