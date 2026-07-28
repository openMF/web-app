/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Shard-aware unique-name generator for Playwright E2E test data.
 *
 * Design goals (per GSoC 2026 proposal WA-2.8):
 *  - Every entity a test creates in Fineract (client, group, user,
 *    loan, …) must carry a name that is unique across a single CI
 *    run AND visibly recognisable as test data, so a stuck cleanup
 *    job never confuses production data with leftover E2E records.
 *  - Encode the worker/shard index in the name itself so logs from
 *    a flaky parallel run can be traced back to a specific worker
 *    without cross-referencing a separate report.
 *  - Be deterministic-under-injection. Every dynamic input — the
 *    clock, the RNG, the shard — is overridable via options so the
 *    unit specs can assert the exact output string without relying
 *    on `Date.now()` advancing or `Math.random()` cooperating.
 *
 * Output format: `E2E_S{shard}_{ts}_{rand}` where
 *   - `E2E_`  is a fixed prefix used by cleanup grep patterns.
 *   - `S{shard}` is the Playwright worker index (or override).
 *   - `{ts}` is `Date.now()` (ms since epoch) for monotonicity.
 *   - `{rand}` is a 6-char base36 token from `Math.random()`,
 *      enough to defeat collisions within the same millisecond
 *      for the realistic worker counts Playwright supports.
 *
 * The optional `prefix` argument is sanitised and prepended *after*
 * the `E2E_` marker so factory callers can pass a domain hint
 * (`'client'`, `'group'`) without losing the cleanup grep anchor.
 *
 * Portability note: this module imports nothing. The React port can
 * adopt it verbatim — `process.env.TEST_PARALLEL_INDEX` is set by
 * the `@playwright/test` runtime regardless of host framework.
 */

/** Fixed prefix used by cleanup tooling to identify E2E-owned data. */
export const E2E_NAME_PREFIX = 'E2E';

/** Length of the random base36 token appended to each name. */
export const E2E_RANDOM_TOKEN_LENGTH = 6;

/**
 * Regex describing the exact shape `generateE2EName` emits. Exported
 * for the unit specs and for any future cleanup script that needs to
 * match the full name surface — keep this in sync with the format
 * documented at the top of the file.
 */
export const E2E_NAME_PATTERN = /^E2E(?:_[A-Za-z0-9]+)?_S\d+_\d+_[a-z0-9]+$/;

/** Tuning knobs for {@link generateE2EName}. All fields optional. */
export interface GenerateE2ENameOptions {
  /**
   * Override the shard / worker slot. Defaults to
   * `process.env.TEST_PARALLEL_INDEX ?? '0'`. Non-numeric values are
   * sanitised to digits-only so a malformed env var cannot produce a
   * name that fails {@link E2E_NAME_PATTERN}.
   */
  shard?: string | number;
  /**
   * Injectable wall-clock for tests. Defaults to `Date.now`. The
   * returned value is rounded down to an integer ms so the formatted
   * name is always digits-only.
   */
  now?: () => number;
  /**
   * Injectable RNG returning a value in `[0, 1)`. Defaults to
   * `Math.random`. The returned value is folded into a base36 token
   * of {@link E2E_RANDOM_TOKEN_LENGTH} characters.
   */
  random?: () => number;
  /**
   * Override the random-token length (max 11 — the practical ceiling
   * of `Math.random().toString(36).slice(2)`). Mainly for tests.
   */
  randomTokenLength?: number;
}

/**
 * Error thrown when {@link generateE2EName} cannot produce a valid
 * name from its inputs (e.g. a negative `randomTokenLength`). Carries
 * no extra fields — the message is the contract.
 */
export class E2ENameGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'E2ENameGenerationError';
  }
}

/**
 * Build a unique, shard-tagged test-data name of the form
 * `E2E_S{shard}_{ts}_{rand}` (or `E2E_{prefix}_S{shard}_{ts}_{rand}`
 * when `prefix` is supplied).
 *
 * The function performs no I/O and never throws for the default
 * argument shape. It throws {@link E2ENameGenerationError} only when
 * the caller passes an invalid override (e.g. negative length).
 *
 * @param prefix Optional alphanumeric domain hint, e.g. `'client'`.
 *               Stripped to `[A-Za-z0-9]+`; an empty result is
 *               treated the same as omitting the prefix entirely.
 * @param options Injectable inputs — see {@link GenerateE2ENameOptions}.
 */
export function generateE2EName(prefix?: string, options: GenerateE2ENameOptions = {}): string {
  const randomTokenLength = options.randomTokenLength ?? E2E_RANDOM_TOKEN_LENGTH;
  if (!Number.isInteger(randomTokenLength) || randomTokenLength < 1 || randomTokenLength > 11) {
    throw new E2ENameGenerationError(`randomTokenLength must be an integer in [1, 11], got ${randomTokenLength}`);
  }

  const now = options.now ?? Date.now;
  const random = options.random ?? Math.random;
  const ts = Math.max(0, Math.trunc(now()));
  const shard = sanitiseShard(options.shard);
  const rand = sanitiseRandomToken(random(), randomTokenLength);
  const cleanedPrefix = sanitisePrefix(prefix);

  const segments: string[] = cleanedPrefix.length > 0 ? [
          E2E_NAME_PREFIX,
          cleanedPrefix,
          `S${shard}`,
          String(ts),
          rand
        ] : [
          E2E_NAME_PREFIX,
          `S${shard}`,
          String(ts),
          rand
        ];

  return segments.join('_');
}

/**
 * Resolve the shard / worker slot. Precedence:
 *   1. Explicit option (numbers stringified, strings digit-filtered).
 *   2. `process.env.TEST_PARALLEL_INDEX` (set by Playwright runtime).
 *   3. `'0'` as a safe fallback for unit specs and ad-hoc invocation.
 */
function sanitiseShard(input: GenerateE2ENameOptions['shard']): string {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return String(Math.max(0, Math.trunc(input)));
  }
  const raw = typeof input === 'string' ? input : (process.env.TEST_PARALLEL_INDEX ?? '0');
  const digits = raw.replace(/[^0-9]/g, '');
  return digits.length > 0 ? digits : '0';
}

/**
 * Fold a `[0, 1)` RNG draw into a fixed-length lower-case base36 token.
 * `Math.random().toString(36).slice(2)` can occasionally yield a token
 * shorter than expected (when the value is very small), so this helper
 * zero-pads the result to the requested `length` rather than emitting a
 * name shorter than the pattern documents.
 */
function sanitiseRandomToken(value: number, length: number): string {
  const normalised = Number.isFinite(value) && value >= 0 && value < 1 ? value : 0;
  let token = normalised.toString(36).replace('0.', '');
  while (token.length < length) {
    token += '0';
  }
  return token.slice(0, length);
}

/** Strip a caller-supplied prefix to safe `[A-Za-z0-9]` characters. */
function sanitisePrefix(prefix: string | undefined): string {
  if (!prefix) return '';
  return prefix.replace(/[^A-Za-z0-9]/g, '');
}
