/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { defineConfig, devices } from '@playwright/test';
import { ROLES } from './playwright/config/roles';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4305';

/** Read-contract browser tests. Fixtures never claim successful financial backend integration. */
export default defineConfig({
  testDir: './playwright/tests/clients',
  timeout: 60000,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    [
      'html',
      { outputFolder: 'playwright-report/account-management', open: 'never' }
    ]
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'account-contract',
      testMatch: 'account-management.contract.spec.ts',
      use: { storageState: { cookies: [], origins: [] } }
    },
    ...(process.env.E2E_ACCOUNT_MANAGEMENT_CLIENT_ID
      ? [
          {
            name: 'account-setup',
            testDir: './playwright',
            testMatch: 'auth.setup.ts'
          },
          {
            name: 'account-live',
            testMatch: 'account-management.live.spec.ts',
            use: { storageState: ROLES.default.storageStateFile },
            dependencies: ['account-setup']
          }
        ]
      : [])
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start:local -- --host 127.0.0.1 --port 4305',
        url: 'http://127.0.0.1:4305',
        timeout: 180000,
        reuseExistingServer: true
      }
});
