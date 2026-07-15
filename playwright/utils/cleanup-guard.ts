/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Reverse-order, panic-safe teardown stack for Playwright E2E tests.
 *
 * Design goals (per GSoC 2026 proposal WA-2.10):
 *  - Resources created during a test (clients, groups, users, loans, …)
 *    MUST be torn down even if the test body throws halfway through.
 *    A per-test `afterEach` hook is too easy to forget; the `cleanupGuard`
 *    auto-fixture in `playwright/fixtures/test-fixtures.ts` calls
 *    {@link CleanupGuard.flush} unconditionally so opt-in is impossible.
 *  - Deleters MUST run in strict reverse-insertion order (LIFO). A test
 *    that creates a client and then a loan on that client cannot delete
 *    the client before the loan or Fineract rejects the cascade.
 *  - A single failing deleter MUST NOT abort the remaining deleters.
 *    The whole flush is wrapped in `Promise.allSettled` so a flaky
 *    teardown HTTP call cannot leak the siblings — and the structured
 *    {@link FlushSummary} surfaces every failure for triage.
 *  - flush() NEVER throws. Teardown noise must not mask the real test
 *    failure in the Playwright reporter. Callers that need to fail the
 *    test on cleanup errors can inspect the returned summary themselves.
 *
 * Scope note: this module ships only the generic LIFO stack. Domain
 * factories (`createTestClient`, `createTestGroup`, `createTestUser`)
 * land in the same PR and register their own deleters here.
 *
 * Portability note: this file imports nothing — not from
 * `@playwright/test`, not from Node built-ins. The React port
 * (`mifos-x-web-app-react`) can adopt it verbatim once its Playwright
 * suite grows beyond smoke tests.
 */

/**
 * A single registered teardown action. The function is invoked at most
 * once during {@link CleanupGuard.flush}; it must be idempotent in
 * spirit (CI may retry the whole test, re-creating the same resource
 * with a new id) but is never called twice for the same registration.
 */
export type CleanupDeleter = () => Promise<void>;

/** Result of a single deleter invocation. */
export interface FlushOutcome {
  /** Human-readable label supplied at register-time, for triage logs. */
  label: string;
  /**
   * Result of the underlying `Promise.allSettled`. `'fulfilled'` means
   * the deleter resolved (Fineract returned 2xx); `'rejected'` means
   * it threw or returned a non-2xx response.
   */
  status: 'fulfilled' | 'rejected';
  /** Populated only when `status === 'rejected'`. */
  reason?: unknown;
}

/**
 * Structured summary returned by {@link CleanupGuard.flush}. The
 * `ok`/`failed` counts plus the per-entry `outcomes` array give CI
 * logs and downstream tooling everything they need to decide whether
 * to escalate teardown failures without coupling the guard itself to
 * any reporting framework.
 */
export interface FlushSummary {
  /** Number of deleters that resolved successfully. */
  ok: number;
  /**
   * Failures only — `outcomes` carries the full ordered list. Kept
   * separately so callers can `if (summary.failed.length) ...` without
   * filtering the whole array.
   */
  failed: ReadonlyArray<{ label: string; reason: unknown }>;
  /** Per-deleter outcomes, in the order they were executed (LIFO). */
  outcomes: ReadonlyArray<FlushOutcome>;
}

/**
 * Error thrown by {@link CleanupGuard.register} when its input
 * contract is violated. Carries no extra fields — the message is the
 * contract, matching the style of `ApiSetupManagerError` in
 * `playwright/utils/api-setup-manager.ts`.
 */
export class CleanupGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CleanupGuardError';
  }
}

/**
 * LIFO stack of teardown actions with a single drain operation.
 *
 * Usage (factory functions in this PR look like this):
 *
 * ```ts
 * const client = await api.createClient(payload);
 * guard.register(`client:${client.resourceId}`, () => api.deleteClient(client.resourceId));
 * ```
 *
 * And in the auto fixture:
 *
 * ```ts
 * cleanupGuard: [async ({}, use) => {
 *   const guard = new CleanupGuard();
 *   await use(guard);
 *   await guard.flush();
 * }, { auto: true }]
 * ```
 */
export class CleanupGuard {
  /**
   * LIFO storage. New registrations are `push`ed; {@link flush} drains
   * by repeated `pop` so the most-recently-created resource is deleted
   * first — the only ordering Fineract's FK constraints accept.
   */
  private readonly stack: Array<{ label: string; deleter: CleanupDeleter }> = [];

  /**
   * Guarded against re-entrant {@link register} calls while a flush is
   * in progress. Registering during teardown would silently leak the
   * deleter (the stack is already being drained), so we throw instead.
   */
  private flushing = false;

  /**
   * Push a new teardown action onto the stack. Callers should invoke
   * this immediately after a successful create-* call — never wrap
   * the create itself, so that a half-completed create does not leave
   * a stale id in the stack.
   *
   * @param label   Human-readable label used in {@link FlushSummary}.
   *                Convention: `'<entity>:<id>'`, e.g. `'client:42'`.
   * @param deleter Zero-argument async function that issues the
   *                delete. Should resolve on 2xx and reject otherwise.
   * @throws {@link CleanupGuardError} when `label` is empty, `deleter`
   *         is not a function, or registration is attempted during a
   *         flush.
   */
  register(label: string, deleter: CleanupDeleter): void {
    if (typeof label !== 'string' || label.length === 0) {
      throw new CleanupGuardError('register(label, deleter): label must be a non-empty string');
    }
    if (typeof deleter !== 'function') {
      throw new CleanupGuardError('register(label, deleter): deleter must be a function');
    }
    if (this.flushing) {
      throw new CleanupGuardError(`register(${label}): cannot register a new deleter while flush() is in progress`);
    }
    this.stack.push({ label, deleter });
  }

  /** Number of deleters currently queued. Mainly for tests. */
  size(): number {
    return this.stack.length;
  }

  /**
   * Drain the stack in strict LIFO order, running every deleter via
   * `Promise.allSettled` so a single failure cannot block siblings.
   *
   * Safe to call multiple times: subsequent calls after the stack is
   * drained resolve to an empty {@link FlushSummary} (`ok: 0`,
   * `failed: []`, `outcomes: []`) without invoking any deleters.
   *
   * Never throws — teardown noise must not mask the real test
   * failure. Callers that need to escalate on cleanup errors should
   * inspect `summary.failed` themselves.
   */
  async flush(): Promise<FlushSummary> {
    if (this.flushing) {
      // Concurrent flush() call — return an empty summary rather than
      // re-entering and double-running deleters. The first caller
      // owns the drain.
      return { ok: 0, failed: [], outcomes: [] };
    }
    this.flushing = true;
    try {
      // Snapshot the drain in LIFO order BEFORE running any deleter.
      // We do not pop incrementally inside the await loop because a
      // deleter could in principle queue more work; the contract is
      // that everything registered at flush-entry is drained, and
      // nothing else.
      const drained: Array<{ label: string; deleter: CleanupDeleter }> = [];
      while (this.stack.length > 0) {
        // Non-null assertion is safe — we just checked length.
        drained.push(this.stack.pop()!);
      }

      const settled = await Promise.allSettled(
        // Each deleter is wrapped in `Promise.resolve().then(...)` so
        // that a synchronously-thrown error becomes a rejected
        // promise. Without this wrapper a sync throw would propagate
        // out of the `.map()` callback BEFORE `Promise.allSettled`
        // could intercept it and the whole flush would reject — the
        // exact failure mode this design is meant to prevent.
        drained.map((entry) => Promise.resolve().then(() => entry.deleter()))
      );

      const outcomes: FlushOutcome[] = settled.map((result, index) => {
        const label = drained[index].label;
        return result.status === 'fulfilled'
          ? { label, status: 'fulfilled' }
          : { label, status: 'rejected', reason: result.reason };
      });

      const failed = outcomes
        .filter((o): o is FlushOutcome & { status: 'rejected' } => o.status === 'rejected')
        .map((o) => ({ label: o.label, reason: o.reason }));

      return {
        ok: outcomes.length - failed.length,
        failed,
        outcomes
      };
    } finally {
      this.flushing = false;
    }
  }
}
