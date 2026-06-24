/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import { CleanupGuard, CleanupGuardError } from './cleanup-guard';

// Pure-logic specs — they run under the `unit` Playwright project
// (testMatch: /playwright\/utils\/.*\.spec\.ts/ in playwright.config.ts)
// with no browser, no app, no backend.
test.use({ storageState: { cookies: [], origins: [] } });

// ─────────────────────────────────────────────────────────────────────
// register() — input contract
// ─────────────────────────────────────────────────────────────────────

test.describe('CleanupGuard.register() input contract', () => {
  test('throws CleanupGuardError on an empty label', () => {
    const guard = new CleanupGuard();
    expect(() => guard.register('', async () => undefined)).toThrow(CleanupGuardError);
    expect(() => guard.register('', async () => undefined)).toThrow(/non-empty/);
  });

  test('throws CleanupGuardError when deleter is not a function', () => {
    const guard = new CleanupGuard();
    expect(() => guard.register('x', undefined as unknown as () => Promise<void>)).toThrow(CleanupGuardError);
  });

  test('size() reflects pushed registrations', () => {
    const guard = new CleanupGuard();
    expect(guard.size()).toBe(0);
    guard.register('a', async () => undefined);
    guard.register('b', async () => undefined);
    expect(guard.size()).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────
// flush() — LIFO ordering
// ─────────────────────────────────────────────────────────────────────

test.describe('CleanupGuard.flush() ordering', () => {
  test('runs deleters in strict reverse-insertion order', async () => {
    const guard = new CleanupGuard();
    const fired: string[] = [];

    guard.register('first', async () => {
      fired.push('first');
    });
    guard.register('second', async () => {
      fired.push('second');
    });
    guard.register('third', async () => {
      fired.push('third');
    });

    const summary = await guard.flush();
    expect(fired).toEqual([
      'third',
      'second',
      'first'
    ]);
    expect(summary.outcomes.map((o) => o.label)).toEqual([
      'third',
      'second',
      'first'
    ]);
    expect(summary.ok).toBe(3);
    expect(summary.failed).toEqual([]);
  });

  test('drains the stack to zero after a flush', async () => {
    const guard = new CleanupGuard();
    guard.register('a', async () => undefined);
    guard.register('b', async () => undefined);
    expect(guard.size()).toBe(2);
    await guard.flush();
    expect(guard.size()).toBe(0);
  });

  test('a second flush after drain is a no-op summary', async () => {
    const guard = new CleanupGuard();
    let calls = 0;
    guard.register('a', async () => {
      calls++;
    });
    const first = await guard.flush();
    const second = await guard.flush();
    expect(calls).toBe(1);
    expect(first.ok).toBe(1);
    expect(second).toEqual({ ok: 0, failed: [], outcomes: [] });
  });
});

// ─────────────────────────────────────────────────────────────────────
// flush() — Promise.allSettled isolation
// ─────────────────────────────────────────────────────────────────────

test.describe('CleanupGuard.flush() failure isolation', () => {
  test('a single failing deleter does not block its siblings', async () => {
    const guard = new CleanupGuard();
    const fired: string[] = [];

    guard.register('bottom', async () => {
      fired.push('bottom');
    });
    guard.register('middle', async () => {
      fired.push('middle');
      throw new Error('boom');
    });
    guard.register('top', async () => {
      fired.push('top');
    });

    const summary = await guard.flush();
    // All three deleters ran despite the middle one throwing.
    expect(fired).toEqual([
      'top',
      'middle',
      'bottom'
    ]);
    expect(summary.ok).toBe(2);
    expect(summary.failed).toHaveLength(1);
    expect(summary.failed[0].label).toBe('middle');
    expect((summary.failed[0].reason as Error).message).toBe('boom');
  });

  test('flush() never throws even when every deleter rejects', async () => {
    const guard = new CleanupGuard();
    guard.register('a', async () => {
      throw new Error('a-fail');
    });
    guard.register('b', async () => {
      throw new Error('b-fail');
    });

    const summary = await guard.flush();
    expect(summary.ok).toBe(0);
    expect(summary.failed.map((f) => f.label)).toEqual([
      'b',
      'a'
    ]);
  });

  test('synchronous throws inside a deleter are captured as rejections', async () => {
    const guard = new CleanupGuard();
    guard.register('sync', (): Promise<void> => {
      throw new Error('sync boom');
    });
    const summary = await guard.flush();
    expect(summary.failed).toHaveLength(1);
    expect((summary.failed[0].reason as Error).message).toBe('sync boom');
  });
});

// ─────────────────────────────────────────────────────────────────────
// flush() — re-entrancy guard
// ─────────────────────────────────────────────────────────────────────

test.describe('CleanupGuard re-entrancy guard', () => {
  test('register() during a flush is rejected', async () => {
    const guard = new CleanupGuard();
    let caught: unknown;
    guard.register('outer', async () => {
      try {
        guard.register('inner', async () => undefined);
      } catch (err) {
        caught = err;
      }
    });

    const summary = await guard.flush();
    expect(caught).toBeInstanceOf(CleanupGuardError);
    expect((caught as Error).message).toMatch(/flush\(\) is in progress/);
    // outer still ran successfully — register failure inside the
    // deleter was caught locally, not by the guard itself.
    expect(summary.ok).toBe(1);
  });

  test('concurrent flush() calls drain exactly once', async () => {
    const guard = new CleanupGuard();
    let calls = 0;
    // Deleter resolves on a microtask boundary so the two flush()
    // calls in the Promise.all overlap in flight.
    guard.register('once', async () => {
      calls++;
      await Promise.resolve();
    });

    const [
      a,
      b
    ] = await Promise.all([
      guard.flush(),
      guard.flush()
    ]);

    expect(calls).toBe(1);
    // Exactly one of the two flushes ran the deleter; the other got
    // the concurrent-call empty summary. We do not pin which is which
    // because microtask scheduling is implementation-defined.
    const totals = [
      a.outcomes.length,
      b.outcomes.length
    ].sort();
    expect(totals).toEqual([
      0,
      1
    ]);
  });
});
