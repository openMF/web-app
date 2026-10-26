/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { dumpDockerLogs } from './utils/docker-logs';
import { pollFineract, pollWebApp } from './utils/readiness';
import type { RetryAttemptInfo } from './utils/retry';

/**
 * Playwright global setup — wired in CI only via
 * `playwright.config.ts → globalSetup`.
 *
 * This file is a thin orchestrator. The pollable logic and the diagnostic
 * dumper live in
 * `playwright/utils/{readiness,docker-logs}.ts` so they can be
 * unit-tested without a real backend (see `readiness.spec.ts`) and
 * later lifted into the React port verbatim.
 *
 * Behaviour:
 *  1. If `FINERACT_SKIP_READINESS=1` is set, the entire function
 *     short-circuits with a warning. Useful when iterating against a
 *     manually-started backend where the developer accepts the risk.
 *  2. Otherwise, `pollFineract()` and `pollWebApp()` run in parallel
 *     via `Promise.all` with a 5s polling interval and a ~90s wall-
 *     clock ceiling each. Fineract readiness is a *functional* probe
 *     (health 200 AND `GET /api/v1/offices` returns ≥1 office) — a
 *     200 from `/actuator/health` alone is not enough.
 *  3. On the first rejection we dump the last 200 lines of the
 *     Fineract container log via `docker compose logs` and rethrow
 *     with an actionable message. Failures to dump logs (no `docker`
 *     binary, daemon down, …) degrade silently to a one-line warning
 *     so the original readiness error is what surfaces.
 *
 * The orphan probe left running after a fast-fail is harmless in
 * practice: the global setup throws, Playwright exits, and Node tears
 * the request context down with the process.
 */

const DEFAULT_FINERACT_URL = 'https://localhost:8443';
const DEFAULT_WEB_APP_URL = 'http://localhost:4200';
const DEFAULT_COMPOSE_FILE = 'docker-compose.e2e.yml';
const DEFAULT_FINERACT_SERVICE = 'fineract';

async function globalSetup(): Promise<void> {
  if (process.env.FINERACT_SKIP_READINESS === '1') {
    console.warn(
      '[global-setup] FINERACT_SKIP_READINESS=1 — readiness probes skipped. ' +
        'Assuming Fineract + web-app are already up.'
    );
    return;
  }

  const fineractUrl = process.env.E2E_FINERACT_URL || DEFAULT_FINERACT_URL;
  const webAppUrl = process.env.E2E_BASE_URL || DEFAULT_WEB_APP_URL;
  const composeFile = process.env.E2E_COMPOSE_FILE || DEFAULT_COMPOSE_FILE;
  const fineractService = process.env.E2E_FINERACT_SERVICE || DEFAULT_FINERACT_SERVICE;

  console.log(
    `[global-setup] readiness probe — Fineract=${fineractUrl} web-app=${webAppUrl} ` +
      '(5s interval, ~90s ceiling, fast-fail)'
  );

  const logRetry =
    (label: string) =>
    (info: RetryAttemptInfo): void => {
      console.log(
        `[global-setup] ${label} attempt ${info.attempt} failed (${describe(info.error)}) — ` +
          `retrying in ${info.delayMs}ms`
      );
    };

  try {
    await Promise.all([
      pollFineract({
        url: fineractUrl,
        onRetry: logRetry('fineract')
      }),
      pollWebApp({
        url: webAppUrl,
        onRetry: logRetry('web-app')
      })
    ]);
    console.log('✅ [global-setup] Fineract + web-app are functionally ready.');
  } catch (error) {
    console.error(`\n[global-setup] readiness probe gave up: ${describe(error)}`);
    await dumpDockerLogs({
      composeFile,
      service: fineractService
    });
    throw new Error(
      'FATAL: E2E infrastructure not ready after ~90s.\n' +
        `  Fineract: ${fineractUrl}\n` +
        `  Web-app:  ${webAppUrl}\n` +
        `  Cause:    ${describe(error)}\n` +
        '\n' +
        'Next steps:\n' +
        `  - Bring the stack up:  docker compose -f ${composeFile} up -d --build\n` +
        `  - Tail full logs:      docker compose -f ${composeFile} logs -f ${fineractService}\n` +
        '  - Bypass (debug only): FINERACT_SKIP_READINESS=1 npx playwright test'
    );
  }
}

/** Compact, human-friendly stringification for unknown error shapes. */
function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error) ?? String(error);
  } catch {
    return String(error);
  }
}

export default globalSetup;
