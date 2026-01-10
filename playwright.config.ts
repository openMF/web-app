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
      { outputFolder: 'playwright-report', open: 'never' }],
    ['list']
  ],

  // Global test settings
  use: {
    // Base URL for the Angular app
    baseURL: 'http://localhost:4200',

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

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Launch options for handling SSL in headed mode
        launchOptions: {
          args: ['--ignore-certificate-errors']
        }
      }
    }
  ],

  // Web server configuration
  // In CI: builds production bundle (without base-href), then serves it with http-server
  // Locally: reuses existing ng serve if running
  webServer: {
    command: process.env.CI
      ? 'npm run build && npx http-server ./dist/web-app/browser -p 4200 --silent'
      : 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    // Add retry logic for server startup
    ...(process.env.CI && {
      stdout: 'pipe',
      stderr: 'pipe'
    })
  }
});
