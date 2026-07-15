/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { FineractApiClient } from '../fixtures/fineract-api';

/**
 * In-flight de-duplication + process-lifetime cache for shared
 * Fineract setup calls (loan-product templates, code-value lookups,
 * office lists, …).
 *
 * Design goals (per GSoC 2026 proposal WA-2.7):
 *  - When two parallel tests both call `getOrLoadLoanTemplate(1)`
 *    within the same process, the second caller MUST attach to the
 *    in-flight `Promise` from the first caller instead of firing a
 *    duplicate HTTP request. Once that promise resolves, every
 *    subsequent caller for the same key gets the cached value
 *    synchronously for the lifetime of the process.
 *  - The cache is keyed by an opaque string so callers pick the
 *    granularity (e.g. `loanTemplate:clientId=1&productId=2`). The
 *    convention is to use a stable serialisation — sorted
 *    `URLSearchParams.toString()` is recommended for endpoints that
 *    already build one — so parameter-order changes do not produce
 *    cache misses.
 *  - Rejected promises are evicted from the cache by default. A
 *    transient CI failure (network blip, half-open TCP) must not
 *    poison the whole suite by pinning a rejection on the key.
 *    Strict callers can opt out via `{ retainErrors: true }` when the
 *    failure is genuinely permanent (e.g. requested template id
 *    does not exist).
 *
 * Scope note: this PR ships only the generic `dedupe<T>` primitive.
 * Domain-specific wrappers (`getLoanTemplate`, `getClientTemplate`,
 * `getCodeValues`, …) land in PR-3 alongside the factory functions
 * that call them. The `FineractApiClient` reference is held now so
 * those PR-3 wrappers can be added without touching the constructor
 * signature or the fixture wiring.
 *
 * Portability note: the module imports nothing from `@playwright/test`
 * and the cache is a plain `Map`. The React port can adopt this file
 * verbatim once it has its own `FineractApiClient` (or a structural
 * equivalent — `FineractApiClient` is only referenced as a type here).
 */

/**
 * Module-level cache. Lives for the lifetime of the Node process so
 * it outlives every per-test `FineractApiClient` instance created by
 * `playwright/fixtures/test-fixtures.ts`. Exported only via the
 * {@link clearApiSetupCache} helper — direct access from outside the
 * module is intentionally not supported.
 */
const TEMPLATE_CACHE: Map<string, Promise<unknown>> = new Map();

/** Options passed to {@link ApiSetupManager.dedupe}. */
export interface DedupeOptions {
  /**
   * When `true`, a rejected `fn()` promise is left in the cache so
   * subsequent callers fast-fail with the same error. Defaults to
   * `false` — the standard CI-friendly behaviour, matching the
   * retry mindset of `playwright/utils/retry.ts`.
   */
  retainErrors?: boolean;
}

/** Constructor options for {@link ApiSetupManager}. */
export interface ApiSetupManagerOptions {
  /**
   * Override the module-level cache. Mainly used by the unit specs
   * to keep per-test state isolated; production callers should never
   * pass this and instead rely on the singleton.
   */
  cache?: Map<string, Promise<unknown>>;
}

/**
 * Error thrown when {@link ApiSetupManager.dedupe} is called with an
 * input that cannot be honoured (e.g. empty cache key). Carries no
 * extra fields — the message is the contract, mirroring the style of
 * `ReadinessProbeFailure` in `playwright/utils/readiness.ts`.
 */
export class ApiSetupManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiSetupManagerError';
  }
}

/**
 * Wraps a per-test `FineractApiClient` with a shared cache so
 * concurrent tests requesting the same template share one in-flight
 * HTTP call. See module docstring for the design rationale.
 *
 * Usage (factory functions in PR-3 will look like this):
 *
 * ```ts
 * const setup = new ApiSetupManager(fineractApi);
 * const template = await setup.dedupe(
 *   `loanTemplate:${sortedParams}`,
 *   () => setup.api.getLoanTemplate(clientId, productId)
 * );
 * ```
 */
export class ApiSetupManager {
  /**
   * Public so PR-3 factory functions can call any
   * `FineractApiClient` method inside their `dedupe(...)` closure
   * without re-plumbing the client through every helper.
   */
  public readonly api: FineractApiClient;

  private readonly cache: Map<string, Promise<unknown>>;

  constructor(api: FineractApiClient, options: ApiSetupManagerOptions = {}) {
    this.api = api;
    this.cache = options.cache ?? TEMPLATE_CACHE;
  }

  /**
   * Run `fn()` at most once per `key` for the lifetime of the cache.
   *
   * Concurrent callers with the same key share the in-flight
   * promise. Once that promise settles successfully, every later
   * caller receives the same resolved value synchronously.
   *
   * Rejected promises are evicted by default — the next caller will
   * fire a fresh `fn()`. Pass `{ retainErrors: true }` to keep the
   * rejection cached and let subsequent callers fast-fail.
   *
   * @param key   Opaque cache key. Choose a stable serialisation
   *              (e.g. sorted `URLSearchParams.toString()`) so
   *              callers with equivalent parameters hit the cache.
   * @param fn    Zero-argument factory that performs the work. Only
   *              invoked when there is no entry under `key`.
   * @param opts  See {@link DedupeOptions}.
   * @throws {@link ApiSetupManagerError} when `key` is empty.
   */
  dedupe<T>(key: string, fn: () => Promise<T>, opts: DedupeOptions = {}): Promise<T> {
    if (typeof key !== 'string' || key.length === 0) {
      throw new ApiSetupManagerError('dedupe(key, fn): key must be a non-empty string');
    }

    const existing = this.cache.get(key);
    if (existing !== undefined) {
      return existing as Promise<T>;
    }

    const retainErrors = opts.retainErrors === true;
    // Wrap `fn()` in a synchronous Promise constructor so a `fn` that
    // throws synchronously is still converted into a rejected promise
    // — same observable behaviour as if it had returned `Promise.reject`.
    const pending = Promise.resolve().then(fn);

    if (!retainErrors) {
      // Eviction must use the captured `pending` reference, not a
      // fresh `this.cache.get(key)` lookup — a later caller could
      // have replaced the entry with a successful retry, and we
      // must not nuke that.
      pending.catch(() => {
        if (this.cache.get(key) === pending) {
          this.cache.delete(key);
        }
      });
    }

    this.cache.set(key, pending);
    return pending;
  }

  /**
   * Test-only escape hatch. Clears the cache backing this instance —
   * useful for unit specs that want a clean slate per `test()`
   * without recreating the manager. Production code should never
   * need to call this.
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Reset the module-level cache. Intended for the unit specs in
 * `api-setup-manager.spec.ts` and for any future helper that needs
 * to nuke shared state between test files. Production callers should
 * use `ApiSetupManager#clearCache` on an instance that owns its own
 * injected cache instead.
 */
export function clearApiSetupCache(): void {
  TEMPLATE_CACHE.clear();
}
