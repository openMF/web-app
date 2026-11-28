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
  testMatch: ['audit-details.spec.ts'],
  workers: 1,
  timeout: 45000,
  reporter: [['list']],
  outputDir: 'test-results/audit-details',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4323',
    storageState: { cookies: [], origins: [] },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run env && npx ng serve --host 127.0.0.1 --port 4323',
        url: 'http://127.0.0.1:4323',
        reuseExistingServer: !process.env.CI,
        timeout: 180000
      }
});
