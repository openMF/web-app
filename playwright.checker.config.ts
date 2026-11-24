/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4312';
export default defineConfig({
  testDir: './playwright/tests',
  testMatch: 'checker-inbox-workspace.spec.ts',
  timeout: 60000,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: './test-results/checker-inbox',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    storageState: { cookies: [], origins: [] },
    serviceWorkers: 'block',
    trace: 'retain-on-failure'
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start:local -- --host 127.0.0.1 --port 4312',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180000
      }
});
