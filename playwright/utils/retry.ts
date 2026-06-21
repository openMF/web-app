/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Generalized retry utility with Fibonacci backoff and error classification.
 *
 * Design goals (per GSoC 2026 proposal WA-2.1):
 *  - Wait longer between attempts as transient failures persist
 *    (Fibonacci grows slower than 2^n exponential — friendlier to
 *    flaky CI shared with other jobs).
 *  - Never retry permanent failures (4xx auth/validation), which
 *    would just multiply the wall-clock cost of a real bug.
 *  - Be transparent: every retry decision is reported via `onRetry`
 *    so flake patterns are visible in CI logs / reports.
 *
 * This module has zero Playwright imports so it can be unit-tested
 * with Jest and reused from setup scripts, fixtures, and pages.
 */

/** Default Fibonacci-spaced delays in milliseconds: 1s, 2s, 3s, 5s, 8s. */
export const DEFAULT_FIBONACCI_DELAYS_MS: readonly number[] = [
  1000,
  2000,
  3000,
  5000,
  8000
];

/**
 * Error classification.
 *
 * `transient`  - safe to retry (network blip, 5xx, timeout)
 * `permanent`  - retrying will not help (4xx, validation, programmer error)
 */
export type ErrorClass = 'transient' | 'permanent';

export interface RetryOptions<T> {
  /** Override the default Fibonacci delay schedule. */
  delaysMs?: readonly number[];
  /**
   * Maximum number of attempts. Defaults to `delaysMs.length + 1`
   * (i.e. one initial try plus one retry per delay slot).
   */
  maxAttempts?: number;
  /**
   * Classify a thrown error. Defaults to {@link classifyError}.
   * Returning `'permanent'` aborts retries immediately.
   */
  classify?: (error: unknown) => ErrorClass;
  /**
   * Add ±10% random jitter to each delay so concurrent workers do
   * not all wake up on the same tick. Defaults to `true`.
   */
  jitter?: boolean;
  /**
   * Called before each sleep with diagnostic info. Use for logging.
   */
  onRetry?: (info: RetryAttemptInfo) => void;
  /**
   * Human-readable label included in `onRetry` payloads — helps
   * disambiguate concurrent retries in CI logs.
   */
  label?: string;
  /**
   * Injectable sleep for tests. Defaults to `setTimeout`-based sleep.
   */
  sleep?: (ms: number) => Promise<void>;
  /**
   * Injectable RNG for tests (returns a value in [0, 1)).
   * Defaults to `Math.random`.
   */
  random?: () => number;
  /**
   * Predicate to skip retry result wrapping. If provided and returns
   * `true` for a successful result, the result is treated as a
   * transient failure (e.g. HTTP 503 returned without throwing).
   */
  retryOnResult?: (result: T) => boolean;
}

export interface RetryAttemptInfo {
  label?: string;
  attempt: number; // 1-based attempt that just failed
  delayMs: number; // sleep about to happen
  error: unknown; // the error (or result, if retryOnResult fired)
  classification: ErrorClass;
}

/**
 * Default error classifier.
 *
 * Inspects common shapes:
 *  - HTTP-like errors with `.status` / `.statusCode` / `.response.status`
 *  - Node network error codes (`ECONNRESET`, `ETIMEDOUT`, ...)
 *  - Playwright `TimeoutError`
 *
 * Anything else is treated as transient by default. Callers wanting
 * stricter behavior can pass their own `classify`.
 */
export function classifyError(error: unknown): ErrorClass {
  if (error === null || error === undefined) {
    return 'transient';
  }

  const err = error as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
    code?: string;
    name?: string;
    message?: string;
  };

  const status: number | undefined = err.status ?? err.statusCode ?? err.response?.status;

  if (typeof status === 'number') {
    if (status >= 500 && status <= 599) return 'transient';
    if (status === 408 || status === 425 || status === 429) return 'transient';
    if (status >= 400 && status < 500) return 'permanent';
  }

  const code = err.code;
  if (
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNREFUSED' ||
    code === 'EAI_AGAIN' ||
    code === 'EPIPE' ||
    code === 'ENOTFOUND'
  ) {
    return 'transient';
  }

  if (err.name === 'TimeoutError') return 'transient';

  return 'transient';
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Retry `fn` according to the configured schedule.
 *
 * Throws the last error if all attempts are exhausted, or immediately
 * if the classifier returns `'permanent'`.
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions<T> = {}): Promise<T> {
  const delays = options.delaysMs ?? DEFAULT_FIBONACCI_DELAYS_MS;
  const maxAttempts = options.maxAttempts ?? delays.length + 1;

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error(`retry: maxAttempts must be a positive integer, got ${maxAttempts}`);
  }
  if (delays.length === 0 && maxAttempts > 1) {
    throw new Error(
      'retry: delaysMs must not be empty when maxAttempts > 1 — ' +
        'there are no delay values available for the retry sleeps.'
    );
  }

  const classify = options.classify ?? classifyError;
  const useJitter = options.jitter ?? true;
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (options.retryOnResult && options.retryOnResult(result)) {
        lastError = new RetryableResultError(result);
      } else {
        return result;
      }
    } catch (error) {
      lastError = error;
      const classification = classify(error);
      if (classification === 'permanent') {
        throw error;
      }
    }

    if (attempt === maxAttempts) break;

    const baseDelay = delays[Math.min(attempt - 1, delays.length - 1)];
    const delayMs = useJitter ? applyJitter(baseDelay, random) : baseDelay;

    options.onRetry?.({
      label: options.label,
      attempt,
      delayMs,
      error: lastError,
      classification: 'transient'
    });

    await sleep(delayMs);
  }

  throw lastError;
}

/**
 * Wrapper error used when `retryOnResult` fires — preserves the
 * offending value for diagnostics.
 */
export class RetryableResultError extends Error {
  readonly result: unknown;
  constructor(result: unknown) {
    super('retryOnResult predicate matched');
    this.name = 'RetryableResultError';
    this.result = result;
  }
}

/** Apply ±10% jitter, clamped to >= 0. */
function applyJitter(baseMs: number, random: () => number): number {
  const jitterRange = baseMs * 0.1;
  const offset = (random() * 2 - 1) * jitterRange;
  return Math.max(0, Math.round(baseMs + offset));
}
