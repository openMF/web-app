/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './playwright/tests',
  testMatch: 'client-approval-workspace.spec.ts',
  timeout: 45000,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: './test-results/client-approval',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4313',
    storageState: { cookies: [], origins: [] },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start:local -- --host 127.0.0.1 --port 4313',
        url: 'http://127.0.0.1:4313',
        reuseExistingServer: true,
        timeout: 180000
      }
});
