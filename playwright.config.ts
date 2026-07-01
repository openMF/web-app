/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ROLES } from './playwright/config/roles';

/**
 * Returns true when `dir` (or any subdir, recursively) contains at
 * least one `.spec.ts` file. Used to keep the multi-role auth
 * projects truly zero-cost: until somebody actually adds a spec
 * under `playwright/tests/admin/**` or `playwright/tests/restricted/**`,
 * the corresponding `setup-<role>` and `chromium-<role>` projects are
 * not registered, so CI doesn't waste time logging in users nobody
 * is testing yet.
 */
function hasSpecFiles(dir: string): boolean {
  if (!fs.existsSync(dir)) return false;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && hasSpecFiles(full)) return true;
    if (entry.isFile() && /\.spec\.ts$/.test(entry.name)) return true;
  }
  return false;
}

const ADMIN_DIR = path.resolve(__dirname, 'playwright/tests/admin');
const RESTRICTED_DIR = path.resolve(__dirname, 'playwright/tests/restricted');

const includeAdminProjects = hasSpecFiles(ADMIN_DIR) || process.env.PLAYWRIGHT_ENABLE_ADMIN_PROJECTS === '1';
const includeRestrictedProjects =
  hasSpecFiles(RESTRICTED_DIR) || process.env.PLAYWRIGHT_ENABLE_RESTRICTED_PROJECTS === '1';

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

  // Configure projects for authentication setup and browser testing.
  //
  // `unit` exists for pure-logic utility specs under
  // `playwright/utils/*.spec.ts` so retry/sleep infrastructure can be
  // validated without a browser, app server, or backend.
  //
  // Multi-role storageState scaffold (proposal WA-2.2):
  //   setup              → playwright/.auth/user.json        (default role, always on)
  //   setup-admin        → playwright/.auth/admin.json       (auto-mounted)
  //   setup-restricted   → playwright/.auth/restricted.json  (auto-mounted)
  //
  // The default `chromium` project depends only on `setup`, so the
  // existing CI footprint is unchanged. The admin / restricted
  // projects mount automatically the moment a spec lands under
  // `playwright/tests/admin/**` or `playwright/tests/restricted/**`,
  // and can also be force-enabled via PLAYWRIGHT_ENABLE_ADMIN_PROJECTS=1
  // or PLAYWRIGHT_ENABLE_RESTRICTED_PROJECTS=1 for CI matrices.
  projects: [
    {
      // Pure-logic unit tests for shared utilities (retry, sleep, ...).
      // No browser, no auth setup, no app dependency.
      name: 'unit',
      testMatch: /playwright\/utils\/.*\.spec\.ts/,
      testDir: '.',
      use: { storageState: { cookies: [], origins: [] } }
    },
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: './playwright',
      retries: process.env.CI ? 2 : 0
    },
    ...(includeAdminProjects
      ? [
          {
            name: 'setup-admin',
            testMatch: /auth\.admin\.setup\.ts/,
            testDir: './playwright',
            retries: process.env.CI ? 2 : 0
          }
        ]
      : []),
    ...(includeRestrictedProjects
      ? [
          {
            name: 'setup-restricted',
            testMatch: /auth\.restricted\.setup\.ts/,
            testDir: './playwright',
            retries: process.env.CI ? 2 : 0
          }
        ]
      : []),
    {
      name: 'chromium',
      // Exclude role-specific test folders so they only run under the
      // project that carries the correct storageState for that role.
      testIgnore: /tests\/(admin|restricted)\//,
      use: {
        ...devices['Desktop Chrome'],
        storageState: ROLES.default.storageStateFile,
        // Launch options for handling SSL in headed mode.
        // slowMo adds a delay (ms) between every action so the UI is
        // visible when running with --ui or --headed locally.
        // Override via:  E2E_SLOW_MO=2000 npx playwright test --ui ...
        // Set to 0 in CI automatically.
        launchOptions: {
          args: ['--ignore-certificate-errors'],
          slowMo: process.env.CI ? 0 : Number(process.env.E2E_SLOW_MO ?? 500)
        }
      },
      dependencies: ['setup']
    },
    ...(includeAdminProjects
      ? [
          {
            name: 'chromium-admin',
            testMatch: /tests\/admin\/.*\.spec\.ts/,
            use: {
              ...devices['Desktop Chrome'],
              storageState: ROLES.admin.storageStateFile,
              launchOptions: { args: ['--ignore-certificate-errors'] }
            },
            dependencies: ['setup-admin']
          }
        ]
      : []),
    ...(includeRestrictedProjects
      ? [
          {
            name: 'chromium-restricted',
            testMatch: /tests\/restricted\/.*\.spec\.ts/,
            use: {
              ...devices['Desktop Chrome'],
              storageState: ROLES.restricted.storageStateFile,
              launchOptions: { args: ['--ignore-certificate-errors'] }
            },
            dependencies: ['setup-restricted']
          }
        ]
      : [])
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
