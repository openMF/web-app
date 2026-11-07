/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { defineConfig } from '@playwright/test';

/** Explicit opt-in: writes fixtures only to the operator's disposable BE-02 tenant. */
export default defineConfig({
  testDir: './playwright/tests/savings',
  testMatch: 'savings-product-editor.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 120000,
  reporter: [
    ['list'],
    [
      'html',
      { outputFolder: 'artifacts/WEB-1350-FE02/playwright-report', open: 'never' }
    ]
  ],
  outputDir: 'artifacts/WEB-1350-FE02/browser-results',
  use: {
    actionTimeout: 15000,
    navigationTimeout: 45000,
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4202',
    ignoreHTTPSErrors: true,
    viewport: { width: 1366, height: 768 },
    video: 'on',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
});
