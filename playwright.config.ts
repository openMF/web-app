/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Mifos X Web App E2E tests.
 *
 * Optimized for:
 * - Self-signed SSL certificate handling (local Fineract backend)
 * - CI/CD efficiency (artifacts only on failure)
 * - Debugging support (traces, videos, screenshots)
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  globalSetup: process.env.CI ? './playwright/global-setup.ts' : undefined,
  // Test directory
  testDir: './playwright/tests',

  // Exclude Angular component tests
  testIgnore: 'src/**',

  // Fail the build if test.only is left in source (CI safety)
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers in CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    [
      'html',
      { outputFolder: 'playwright-report', open: 'never' }
    ],
    ['list']
  ],

  // Global test settings
  use: {
    // Base URL for the Angular app (aligned with global-setup.ts and configurable via env for CI)
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200',

    // Handle self-signed certificates from Fineract backend
    ignoreHTTPSErrors: true,

    // Collect trace on failure for debugging
    trace: 'retain-on-failure',

    // Record video on failure only (storage efficient)
    video: 'retain-on-failure',

    // Screenshot on failure only
    screenshot: 'only-on-failure',

    // Default navigation timeout (increased for CI and financial app)
    navigationTimeout: 120000,

    // Default action timeout
    actionTimeout: 30000,

    // Configure backend URL for tests
    extraHTTPHeaders: {
      Accept: 'application/json'
    }
  },

  // Global test timeout (per test)
  timeout: process.env.CI ? 180000 : 120000,

  // Configure projects for authentication setup and browser testing
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      testDir: './playwright',
      retries: process.env.CI ? 2 : 0
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
        // Launch options for handling SSL in headed mode
        launchOptions: {
          args: ['--ignore-certificate-errors']
        }
      },
      dependencies: ['setup']
    }
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        timeout: 180000
      }
});
