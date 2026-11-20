/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { defineConfig, devices } from '@playwright/test';

/** Mocked rendering and explicit opt-in, read-only live ISR verification are separate projects. */
export default defineConfig({
  testDir: './playwright/tests',
  timeout: 60000,
  retries: 0,
  workers: 1,
  outputDir: 'test-results/fe07',
  reporter: [
    ['list'],
    [
      'html',
      { outputFolder: 'playwright-report/fe07', open: 'never' }
    ],
    [
      'json',
      { outputFile: 'test-results/fe07-results.json' }
    ]
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4307',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    storageState: { cookies: [], origins: [] }
  },
  projects: [
    { name: 'isr-contract', testMatch: 'consolidated-isr.contract.spec.ts', use: { video: 'on' } },
    { name: 'account-regression', testMatch: 'account-management.contract.spec.ts' },
    { name: 'product-regression', testMatch: 'unified-savings-integration.contract.spec.ts' },
    { name: 'isr-live', testMatch: 'consolidated-isr.live.spec.ts', use: { trace: 'off', video: 'off' } }
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start:local -- --host 127.0.0.1 --port 4307',
        url: 'http://127.0.0.1:4307',
        timeout: 180000,
        reuseExistingServer: true
      }
});
