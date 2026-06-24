/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test as base } from '@playwright/test';

import { FineractApiClient } from './fineract-api';
import { ApiSetupManager } from '../utils/api-setup-manager';
import { CleanupGuard } from '../utils/cleanup-guard';

/**
 * Fixture surface available to every Playwright test in this suite.
 *
 *  - `fineractApi`   — Authenticated REST client, one per test.
 *  - `apiSetup`      — De-duplicating wrapper around `fineractApi` that
 *                      shares expensive setup calls (office lookup,
 *                      loan template, ...) across factory invocations
 *                      within the same test process.
 *  - `cleanupGuard`  — Reverse-order, panic-safe teardown stack. Wired
 *                      as an auto-fixture so its `flush()` runs in the
 *                      teardown phase even if a test never names it,
 *                      never opts in, or throws halfway through.
 *
 * Factories in `playwright/factories/*.ts` consume `apiSetup` and
 * `cleanupGuard` together — the factory registers its own deleter on
 * the guard immediately after a successful create-* call, and the
 * fixture's `afterEach`-equivalent calls `flush()` so cleanup runs
 * with zero opt-in from the test author.
 */
type E2EFixtures = {
  fineractApi: FineractApiClient;
  apiSetup: ApiSetupManager;
  cleanupGuard: CleanupGuard;
};

export const test = base.extend<E2EFixtures>({
  fineractApi: async ({}, use) => {
    const api = new FineractApiClient(
      process.env.E2E_FINERACT_URL || 'https://localhost:8443',
      process.env.E2E_TENANT_ID || 'default',
      process.env.E2E_USERNAME || 'mifos',
      process.env.E2E_PASSWORD || 'password'
    );
    await api.init();
    await use(api);
    await api.dispose();
  },

  apiSetup: async ({ fineractApi }, use) => {
    // The default constructor uses the module-level cache, so two
    // factories that ask for the same office lookup within the same
    // process share one `Promise`. Per-test isolation is provided by
    // the factory pattern itself — keys are scoped per-domain
    // (`office:first`, `loanTemplate:...`) and are safe to share.
    const setup = new ApiSetupManager(fineractApi);
    await use(setup);
  },

  cleanupGuard: [
    // Declare an explicit dependency on `apiSetup` (and through it
    // on `fineractApi`) so Playwright's fixture graph guarantees
    // this fixture's teardown runs BEFORE the API context is
    // disposed. Without that ordering, deleters queued by factories
    // would race the `fineractApi` teardown and reject with
    // "Target page, context or browser has been closed".
    async ({ apiSetup }, use) => {
      // `apiSetup` is referenced only to anchor the dependency
      // graph; the guard itself stays decoupled from the manager.
      void apiSetup;
      const guard = new CleanupGuard();
      await use(guard);
      // flush() never throws — teardown noise must not mask the real
      // test failure in the Playwright reporter. Failures are logged
      // for triage; tests that want to escalate on cleanup errors can
      // call `await guard.flush()` themselves and inspect the summary
      // before letting this auto-fixture run a (now no-op) second flush.
      const summary = await guard.flush();
      if (summary.failed.length > 0) {
        console.warn(
          `[cleanupGuard] ${summary.failed.length}/${summary.outcomes.length} deleter(s) failed:`,
          summary.failed.map((f) => ({ label: f.label, reason: String(f.reason) }))
        );
      }
    },
    { auto: true }
  ]
});

export { expect } from '@playwright/test';
