# Playwright E2E Testing

This folder holds the end to end tests for the Mifos® X Web App. The tests use [Playwright](https://playwright.dev/) and run against a real Apache Fineract® backend.

## Your first test run

If you are new to the project, this section takes you from a fresh clone to a finished test run. You only need to do the setup once.

### What you need

1. Node.js 20.19 or newer. CI uses Node.js 24, so that is the safest choice.
2. Docker with Compose v2, so that the `docker compose` command works.
3. On macOS, GNU `timeout`, which the Docker runner script needs. Install it with `brew install coreutils`.

### Set up once

```bash
npm ci
npx playwright install chromium
```

The first command installs the project dependencies. The second downloads the Chromium browser that the tests drive. On Linux you may also need some system libraries, and `npx playwright install --with-deps chromium` installs those for you.

### Check your setup without a backend

Some specs test the helpers in `playwright/utils`, `playwright/pages`, `playwright/fixtures` and part of `playwright/factories`. They need no browser, no web app and no Fineract, so they are the quickest way to confirm your setup works:

```bash
npx playwright test --project=unit
```

This takes about half a minute.

### Run the whole suite

```bash
npm run e2e:docker
```

This one command does everything for you:

1. Builds the web app image and starts PostgreSQL, Fineract and the web app from `docker-compose.e2e.yml`.
2. Waits until Fineract is healthy, its seed data is ready and the web app answers on `http://localhost:4200`.
3. Runs every Playwright project with a single worker.
4. Stops the stack and removes its volumes when the run ends, whether the tests passed or failed.

The first run is slow because Docker has to download the Fineract image and build the web app, and Fineract takes a couple of minutes to boot. Later runs are quicker.

At the end you see a summary line with the number of passed tests. A few tests are skipped on purpose. For example, the family member tests skip themselves when the tenant has no relationship or gender code values configured. Skipped tests are not failures.

### Run only part of the suite

You can pass any Playwright option after `--`:

```bash
npm run e2e:docker -- --grep "Create Client"
npm run e2e:docker -- playwright/tests/savings
npm run e2e:docker -- --headed
npm run e2e:docker -- --debug
```

In order, these run the tests whose title matches, run one folder, show the browser while the tests run, and open the Playwright inspector so you can step through a test.

### Look at the results

Every run writes an HTML report to `playwright-report/`. Open it with:

```bash
npx playwright show-report
```

For a failed test the report includes a trace, a screenshot and a video. They usually tell you much more than the terminal output does.

### What is different on your machine

When the `CI` environment variable is not set, which is the normal case locally:

1. Failed tests are not retried, so a flaky test fails straight away instead of passing on a second attempt.
2. The browser waits 500 ms between actions so that you can follow along. Set `E2E_SLOW_MO=0` to turn this off.
3. `playwright/global-setup.ts` does not run, so nothing checks that the backend is ready before the tests start. `npm run e2e:docker` does its own waiting, so this only matters when you start the stack yourself.

### Common problems on a first run

1. **`'timeout' command not found`**: install GNU coreutils as described above.
2. **Port 4200, 8443 or 5432 already in use**: stop whatever is using it, for example a local `ng serve`, another Fineract or a local PostgreSQL.
3. **Playwright says the browser executable does not exist**: run `npx playwright install chromium`.
4. **Tests fail at login or while creating data**: the stack was probably not fully up yet. `npm run e2e:docker` removes the containers when it finishes, so their logs are gone by the time you read the failure. To see what the containers are doing, run `npm run e2e:docker:logs` in a second terminal while the tests are still running, or start the stack with `npm run e2e:docker:up` as described in the next section and keep it running while you investigate.

## Controlling the stack yourself

While you are writing tests it is often easier to keep the stack running between runs:

```bash
npm run e2e:docker:up
npm run e2e:docker:logs
npm run playwright
npm run e2e:docker:down
```

The first command builds and starts PostgreSQL, Fineract and the web app. The second follows the container logs, so run it in another terminal. The third runs the tests against the running stack, and the last one stops everything and deletes the volumes.

`e2e:docker:up` returns once Fineract reports healthy and the web app container has started. Because the readiness check in `global-setup.ts` only runs in CI, open `http://localhost:4200` and make sure the login page loads before you run the tests.

A few other scripts are useful here. `npm run playwright:ui` opens Playwright's UI mode, while `npm run playwright:headed` and `npm run playwright:debug` run the tests with a visible browser or with the inspector.

## Running without Docker

Docker is the supported way to run the suite. If you want to use your own backend, the web app you open and the Fineract that the tests seed must be the same instance. The tests create their data through `E2E_FINERACT_URL`, but `npm run start` proxies `/fineract-provider` to `https://demo.mifos.community` by default (see `proxy.conf.js`). Starting a local Fineract on port 8443 and running `npm run start` is therefore not enough on its own.

These environment variables control where the tests point:

1. `E2E_BASE_URL` is the web app. The default is `http://localhost:4200`.
2. `E2E_FINERACT_URL` is the Fineract API used to create test data. The default is `https://localhost:8443`.
3. `E2E_USERNAME` and `E2E_PASSWORD` are the login used by the auth setup and the API client. The defaults are `mifos` and `password`.
4. `E2E_TENANT_ID` is the Fineract tenant. The default is `default`.
5. `E2E_SLOW_MO` is the delay between browser actions in local runs. The default is `500`.

## How the suite is organised

```text
playwright/
├── auth.setup.ts              logs in once and saves the session
├── auth.admin.setup.ts        the same for the admin role
├── auth.restricted.setup.ts   the same for the restricted role
├── auth-helpers.ts            login code shared by the setup files
├── global-setup.ts            readiness probe for Fineract and the web app, CI only
├── config/                    shared selectors, routes, roles and behaviour contracts
├── factories/                 create clients, groups, loans, savings, charges and users through the API
├── fixtures/                  the fineractApi and apiSetup test fixtures
├── pages/                     page objects, one per screen or dialog
├── types/                     shared test data types
├── utils/                     retry, readiness, naming, cleanup and sleep helpers
├── sleeps.json                record of every deliberate wait, written by loggedSleep
└── tests/                     the specs, grouped by area
```

The specs in `tests/` are grouped into `charges`, `clients`, `groups`, `kyc`, `loans` and `savings`, with a few general specs such as login at the top level.

## Playwright projects

`playwright.config.ts` splits the suite into projects:

1. `unit` runs the helper specs from `playwright/utils`, `playwright/pages`, `playwright/fixtures` and two factory specs. It needs no browser and no backend.
2. `integration` runs the `*.factory.spec.ts` files in `playwright/factories` against a real Fineract, without starting a browser.
3. `setup` runs `auth.setup.ts`, which logs in once and stores the session in `playwright/.auth/user.json`.
4. `chromium` runs every spec in `playwright/tests` except the ones under `playwright/tests/admin` and `playwright/tests/restricted`, which belong to the role projects described below. It depends on `setup`, so every spec starts already logged in as the default user.

The `setup-admin`, `chromium-admin`, `setup-restricted` and `chromium-restricted` projects only appear once specs exist under `playwright/tests/admin` or `playwright/tests/restricted`, or when you set `PLAYWRIGHT_ENABLE_ADMIN_PROJECTS=1` or `PLAYWRIGHT_ENABLE_RESTRICTED_PROJECTS=1`. Each of them logs in as its own role before running the specs in its folder.

## How CI runs the tests

`.github/workflows/playwright.yml` runs on every push and pull request to `dev` and `main`:

1. It installs the dependencies and Chromium, then starts the stack with `docker compose -f docker-compose.e2e.yml up -d --build`. That command waits for the compose healthchecks, so PostgreSQL and Fineract are healthy by the time it returns.
2. `npm run playwright:ci` runs the suite with a single worker. Because `CI` is set, failed tests are retried twice, and `global-setup.ts` first checks that Fineract answers with its seed data and that the web app responds.
3. A summary step writes the passed, failed, skipped and flaky counts to the job summary, and lists every test that only passed after a retry.
4. The `playwright-report` artifact is uploaded on every run and contains the HTML report and `results.json`. The `test-results` artifact, with traces, screenshots and videos, is uploaded only when the job fails. Both are kept for 7 days.
5. When the job fails the container logs are printed, and the stack is always torn down at the end.

The Fineract image is pinned to an exact digest in `docker-compose.e2e.yml`, so every run tests the same backend build. To try a different build locally, set `FINERACT_IMAGE`, for example `FINERACT_IMAGE=apache/fineract:latest npm run e2e:docker`.

## Writing new tests

A few rules keep the suite consistent, and ESLint enforces the first two:

1. Do not navigate to the login page from a spec. The `setup` project has already logged in, so start from the page you are testing. The `mifosx-playwright/no-direct-login-goto` rule catches this.
2. Do not call `waitForTimeout`. Wait for something on the page instead. If you really need a fixed delay, use `loggedSleep(ms, reason)` from `playwright/utils/sleep.ts`, which records the wait in `sleeps.json`. The `mifosx-playwright/no-bare-wait-for-timeout` rule catches this.
3. Import `test` and `expect` from `playwright/fixtures/test-fixtures.ts` so that you get the `fineractApi` and `apiSetup` fixtures.
4. Keep locators in page objects and assertions in specs. Page objects extend `BasePage` and are exported from `playwright/pages/index.ts`.
5. Create the data a test needs through the API, using the factories in `playwright/factories`, rather than clicking through the UI.
6. Every new file needs the MPL 2.0 license header. The commit hook checks for it.

### A page object

```typescript
// playwright/pages/dashboard.page.ts
import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly url = '/#/';

  get welcomeMessage(): Locator {
    return this.page.locator('.welcome-message');
  }
}
```

### A spec that uses it

```typescript
// playwright/tests/dashboard.spec.ts
import { test, expect } from '../fixtures/test-fixtures';
import { DashboardPage } from '../pages/dashboard.page';

test('shows the dashboard to a logged in user', async ({ page }) => {
  const dashboard = new DashboardPage(page);

  await dashboard.navigate();
  await expect(dashboard.welcomeMessage).toBeVisible();
});
```

### Creating test data

When Fineract boots it seeds the Head Office and the `default` tenant. Anything else a test needs, such as clients, loans or savings accounts, should be created through the API. The `fineractApi` fixture is created fresh for each test, so use it inside the test or in `beforeEach`:

```typescript
import { test } from '../fixtures/test-fixtures';

test('works with a new client', async ({ fineractApi }) => {
  const client = await fineractApi.createClient({
    officeId: 1,
    firstname: 'Test',
    lastname: 'Client'
    // plus the other fields Fineract requires
  });
});
```

See `playwright/fixtures/fineract-api.ts` for every available method, and `playwright/factories` for ready made builders.

## Test credentials

The seeded Fineract super user is `mifos` with the password `password`, on the `default` tenant.

## Troubleshooting

### SSL errors

The local Fineract uses a self signed certificate. Both `playwright.config.ts` and the API client in `playwright/fixtures/fineract-api.ts` set `ignoreHTTPSErrors: true`, so you should not see certificate errors. If you do, check that neither setting was changed.

### Timeouts

The config already allows 120 seconds per navigation, 30 seconds per action and 120 seconds per test locally, or 180 seconds in CI. When a test times out the cause is usually a backend that is not ready or a locator that never matches, so open the trace in the report before you raise any timeout.

### TypeScript clashes with Jest

The Playwright code has its own `tsconfig.playwright.json`, which only loads Node types and excludes `src`, so Jest types do not leak in. Keep Playwright code inside `playwright/`.
