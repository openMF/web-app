/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { request } from '@playwright/test';
import { retry, type RetryAttemptInfo } from './retry';

/**
 * Functional readiness probes for the Playwright global setup.
 *
 * Design goals:
 *  - Replace the one-shot 15s health check with a deadline-bounded
 *    polling loop that survives slow Docker boots without hiding real
 *    outages.
 *  - Treat Fineract as "ready" only when it both reports healthy AND
 *    has been seeded with at least one office — a functional probe,
 *    not just a liveness check. Empty seed data is the documented
 *    source of flaky logins in CI and a 200 from `/actuator/health`
 *    is not enough to rule it out.
 *  - Reuse the WEB-975 `retry()` primitive instead of growing a
 *    second backoff implementation. The schedule is encoded as a
 *    fixed 5s cadence (no jitter, no Fibonacci growth) so the
 *    wall-clock ceiling is exactly predictable.
 *
 * Every I/O dependency is injectable so the unit tests in
 * `readiness.spec.ts` can run offline without a real Fineract,
 * a real web-app, or a real network stack.
 *
 * Portability note (mifos-x-web-app-react): this module imports only
 * from `@playwright/test` and from the local `./retry` utility. It
 * carries no Angular- or React-specific assumptions and can be copied
 * verbatim into the React port the moment that workspace grows a
 * `global-setup.ts` of its own.
 */

/** Fixed 5s polling interval — see module docstring for rationale. */
export const POLL_INTERVAL_MS = 5000;

/**
 * Maximum attempts for the retry schedule. The hard wall-clock ceiling
 * is enforced separately via {@link READINESS_CEILING_MS} and a
 * `Promise.race` so that per-attempt I/O time does not push the total
 * wait far beyond what the error message promises.
 */
export const MAX_READINESS_ATTEMPTS = 19;

/**
 * Hard wall-clock ceiling for each readiness poll in milliseconds.
 *
 * The retry loop is raced against this absolute deadline so that
 * per-attempt HTTP I/O (up to {@link POLL_INTERVAL_MS} × 2 for the
 * Fineract health + offices checks) cannot make the actual wait reach
 * ~280s while the error message claims ~90s.
 */
export const READINESS_CEILING_MS = 90_000;

/**
 * Default delay schedule: 18 fixed 5s sleeps between retry attempts.
 *
 * This governs the retry cadence only. The actual wall-clock ceiling
 * is {@link READINESS_CEILING_MS}, enforced via `raceDeadline`.
 *
 * Built with `Array.from` (not a literal) so the
 * `prettier-plugin-multiline-arrays` rule does not force 18 lines of
 * `5000,` into the source.
 */
export const DEFAULT_READINESS_DELAYS_MS: readonly number[] = Object.freeze(
  Array.from({ length: MAX_READINESS_ATTEMPTS - 1 }, () => POLL_INTERVAL_MS)
);

/** Inputs handed to a {@link FineractProbe}. */
export interface FineractProbeInput {
  url: string;
  tenantId: string;
  username: string;
  password: string;
}

/** Inputs handed to a {@link WebAppProbe}. */
export interface WebAppProbeInput {
  url: string;
}

/**
 * One Fineract readiness attempt. Resolves on success, rejects on any
 * not-ready condition (health non-2xx, offices non-2xx, offices empty,
 * network error). Implementations should NOT retry internally — the
 * outer `retry()` owns the schedule.
 */
export type FineractProbe = (input: FineractProbeInput) => Promise<void>;

/** One web-app readiness attempt. Same contract as {@link FineractProbe}. */
export type WebAppProbe = (input: WebAppProbeInput) => Promise<void>;

export interface PollFineractOptions {
  /** Defaults to `process.env.E2E_FINERACT_URL ?? 'https://localhost:8443'`. */
  url?: string;
  /** Defaults to `process.env.E2E_TENANT_ID ?? 'default'`. */
  tenantId?: string;
  /** Defaults to `process.env.E2E_USERNAME ?? 'mifos'`. */
  username?: string;
  /** Defaults to `process.env.E2E_PASSWORD ?? 'password'`. */
  password?: string;
  /** Single-attempt probe. Defaults to the real HTTP probe. */
  probe?: FineractProbe;
  /** Override the 5s × 18 schedule (mainly for unit tests). */
  delaysMs?: readonly number[];
  /** Override the 19-attempt ceiling (mainly for unit tests). */
  maxAttempts?: number;
  /** Injectable sleep — forwarded to `retry()` for deterministic tests. */
  sleep?: (ms: number) => Promise<void>;
  /** Per-attempt diagnostic hook — forwarded to `retry()`. */
  onRetry?: (info: RetryAttemptInfo) => void;
  /**
   * Hard wall-clock ceiling in ms. Defaults to {@link READINESS_CEILING_MS}.
   * Override in tests to verify ceiling behaviour without real timers.
   */
  ceilingMs?: number;
}

export interface PollWebAppOptions {
  /** Defaults to `process.env.E2E_BASE_URL ?? 'http://localhost:4200'`. */
  url?: string;
  /** Single-attempt probe. Defaults to the real HTTP probe. */
  probe?: WebAppProbe;
  /** Override the 5s × 18 schedule (mainly for unit tests). */
  delaysMs?: readonly number[];
  /** Override the 19-attempt ceiling (mainly for unit tests). */
  maxAttempts?: number;
  /** Injectable sleep — forwarded to `retry()` for deterministic tests. */
  sleep?: (ms: number) => Promise<void>;
  /** Per-attempt diagnostic hook — forwarded to `retry()`. */
  onRetry?: (info: RetryAttemptInfo) => void;
  /**
   * Hard wall-clock ceiling in ms. Defaults to {@link READINESS_CEILING_MS}.
   * Override in tests to verify ceiling behaviour without real timers.
   */
  ceilingMs?: number;
}

/**
 * Error thrown by the default probes when Fineract / the web-app
 * answer the network but are not yet functionally ready. Carries no
 * `status`/`code` so the default `classifyError` in `retry()` treats
 * it as transient — but `pollFineract` / `pollWebApp` pin
 * `classify: () => 'transient'` regardless so that even a 4xx during
 * boot (e.g. tenant DB still migrating) is retried instead of
 * fast-failing the whole suite.
 */
export class ReadinessProbeFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReadinessProbeFailure';
  }
}

/**
 * Default Fineract probe: one health check + one offices check using
 * a fresh Playwright `APIRequestContext`. The context is created and
 * disposed per attempt so a half-open TCP connection from a previous
 * timeout cannot poison subsequent attempts.
 */
const defaultFineractProbe: FineractProbe = async ({ url, tenantId, username, password }) => {
  const ctx = await request.newContext({
    baseURL: url,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'Fineract-Platform-TenantId': tenantId,
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      Accept: 'application/json'
    }
  });
  try {
    const health = await ctx.get('/fineract-provider/actuator/health', { timeout: POLL_INTERVAL_MS });
    if (!health.ok()) {
      throw new ReadinessProbeFailure(`Fineract /actuator/health returned ${health.status()} at ${url}`);
    }
    const officesRes = await ctx.get('/fineract-provider/api/v1/offices', {
      timeout: POLL_INTERVAL_MS
    });
    if (!officesRes.ok()) {
      throw new ReadinessProbeFailure(`Fineract /api/v1/offices returned ${officesRes.status()} at ${url}`);
    }
    const offices: unknown = await officesRes.json();
    if (!Array.isArray(offices) || offices.length < 1) {
      throw new ReadinessProbeFailure(
        `Fineract /api/v1/offices returned ${
          Array.isArray(offices) ? '0 offices' : 'a non-array body'
        } — seed data is missing.`
      );
    }
  } finally {
    await ctx.dispose();
  }
};

/**
 * Default web-app probe: GET the root URL and require a 2xx. The
 * web-app's only realistic failure modes here are 502/Nginx-down /
 * connection-refused, all of which are caught by an alive-check; no
 * functional content assertion is added because the SPA shell is
 * empty until JS boots.
 */
const defaultWebAppProbe: WebAppProbe = async ({ url }) => {
  const ctx = await request.newContext({ ignoreHTTPSErrors: true });
  try {
    const res = await ctx.get(url, { timeout: POLL_INTERVAL_MS });
    if (!res.ok()) {
      throw new ReadinessProbeFailure(`Web-app at ${url} returned ${res.status()}`);
    }
  } finally {
    await ctx.dispose();
  }
};

/**
 * Race `work` against a hard wall-clock deadline of `ms` milliseconds.
 * Rejects with a {@link ReadinessProbeFailure} if the deadline fires first.
 * Clears the timer on either outcome so the process/test can exit cleanly.
 */
async function raceDeadline<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  let id: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    id = setTimeout(() => reject(new ReadinessProbeFailure(`${label} hard ceiling of ${ms}ms reached`)), ms);
  });
  try {
    return await Promise.race([
      work,
      deadline
    ]);
  } finally {
    clearTimeout(id);
  }
}

/**
 * Poll Fineract until it is functionally ready (health 200 AND ≥1
 * office) or the hard 90s ceiling is reached. Throws the last probe
 * error or a ceiling error on timeout.
 */
export async function pollFineract(options: PollFineractOptions = {}): Promise<void> {
  const url = options.url ?? process.env.E2E_FINERACT_URL ?? 'https://localhost:8443';
  const tenantId = options.tenantId ?? process.env.E2E_TENANT_ID ?? 'default';
  const username = options.username ?? process.env.E2E_USERNAME ?? 'mifos';
  const password = options.password ?? process.env.E2E_PASSWORD ?? 'password';
  const probe = options.probe ?? defaultFineractProbe;

  await raceDeadline(
    retry(() => probe({ url, tenantId, username, password }), {
      delaysMs: options.delaysMs ?? DEFAULT_READINESS_DELAYS_MS,
      maxAttempts: options.maxAttempts ?? MAX_READINESS_ATTEMPTS,
      jitter: false,
      classify: () => 'transient',
      label: 'fineract-readiness',
      sleep: options.sleep,
      onRetry: options.onRetry
    }),
    options.ceilingMs ?? READINESS_CEILING_MS,
    'fineract-readiness'
  );
}

/**
 * Poll the Angular web-app until it serves a 2xx at its root URL or
 * the hard 90s ceiling is reached. Throws the last probe error or a
 * ceiling error on timeout.
 */
export async function pollWebApp(options: PollWebAppOptions = {}): Promise<void> {
  const url = options.url ?? process.env.E2E_BASE_URL ?? 'http://localhost:4200';
  const probe = options.probe ?? defaultWebAppProbe;

  await raceDeadline(
    retry(() => probe({ url }), {
      delaysMs: options.delaysMs ?? DEFAULT_READINESS_DELAYS_MS,
      maxAttempts: options.maxAttempts ?? MAX_READINESS_ATTEMPTS,
      jitter: false,
      classify: () => 'transient',
      label: 'web-app-readiness',
      sleep: options.sleep,
      onRetry: options.onRetry
    }),
    options.ceilingMs ?? READINESS_CEILING_MS,
    'web-app-readiness'
  );
}
