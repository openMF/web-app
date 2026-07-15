/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import type { FineractApiClient } from '../fixtures/fineract-api';
import { ApiSetupManager, ApiSetupManagerError } from './api-setup-manager';

// Pure-logic specs — they run under the `unit` Playwright project
// (testMatch: /playwright\/utils\/.*\.spec\.ts/ in playwright.config.ts)
// with no browser, no app, no backend. The `FineractApiClient` is a
// stand-in: `ApiSetupManager` never calls any of its methods today,
// it only holds the reference for PR-3 factory wiring.
test.use({ storageState: { cookies: [], origins: [] } });

/**
 * Build a fresh manager with an isolated cache so each `test()` is
 * independent of every other (the production cache is module-level
 * and would leak state across cases).
 */
function freshManager(): ApiSetupManager {
  const stubClient = {} as unknown as FineractApiClient;
  return new ApiSetupManager(stubClient, { cache: new Map() });
}

/**
 * Deferred promise helper — lets a test control exactly when an
 * in-flight `dedupe()` call settles. Mirrors the
 * Promise-with-resolvers idiom without depending on the Node 22
 * built-in.
 */
function defer<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// ─────────────────────────────────────────────────────────────────────
// dedupe() — input validation
// ─────────────────────────────────────────────────────────────────────

test.describe('ApiSetupManager.dedupe() input contract', () => {
  test('throws ApiSetupManagerError on an empty key', () => {
    const manager = freshManager();
    expect(() => manager.dedupe('', async () => 1)).toThrow(ApiSetupManagerError);
    expect(() => manager.dedupe('', async () => 1)).toThrow(/non-empty/);
  });

  test('exposes the api client read-only for PR-3 closure access', () => {
    const stubClient = {} as unknown as FineractApiClient;
    const manager = new ApiSetupManager(stubClient, { cache: new Map() });
    expect(manager.api).toBe(stubClient);
  });
});

// ─────────────────────────────────────────────────────────────────────
// dedupe() — in-flight sharing + cache hit
// ─────────────────────────────────────────────────────────────────────

test.describe('ApiSetupManager.dedupe() in-flight sharing', () => {
  test('two concurrent callers receive the same Promise instance', async () => {
    const manager = freshManager();
    let calls = 0;
    const fn = async (): Promise<number> => {
      calls++;
      // Stay pending — we are asserting reference equality, not value.
      return new Promise<number>(() => {});
    };
    const p1 = manager.dedupe('k', fn);
    const p2 = manager.dedupe('k', fn);
    // Reference equality — the second caller attaches to the first
    // caller's in-flight promise rather than creating a new one.
    expect(p2).toBe(p1);
    // Drain microtasks so the `Promise.resolve().then(fn)` chain
    // inside `dedupe` actually invokes `fn` — only then can we
    // assert the call count.
    await Promise.resolve();
    expect(calls).toBe(1);
  });

  test('the work function runs exactly once across concurrent and serial callers', async () => {
    const manager = freshManager();
    let calls = 0;
    const fn = async (): Promise<string> => {
      calls++;
      return 'value';
    };

    const [
      a,
      b
    ] = await Promise.all([
      manager.dedupe('k', fn),
      manager.dedupe('k', fn)
    ]);
    const c = await manager.dedupe('k', fn);

    expect(a).toBe('value');
    expect(b).toBe('value');
    expect(c).toBe('value');
    expect(calls).toBe(1);
  });

  test('different keys each fire their own work function', async () => {
    const manager = freshManager();
    const calls: string[] = [];
    const make = (id: string) => async (): Promise<string> => {
      calls.push(id);
      return id;
    };

    const [
      a,
      b
    ] = await Promise.all([
      manager.dedupe('alpha', make('alpha')),
      manager.dedupe('beta', make('beta'))
    ]);
    expect(a).toBe('alpha');
    expect(b).toBe('beta');
    expect(calls.sort()).toEqual([
      'alpha',
      'beta'
    ]);
  });

  test('serial callers after resolution receive the cached value without rerunning fn', async () => {
    const manager = freshManager();
    let calls = 0;
    const fn = async (): Promise<number> => {
      calls++;
      return 42;
    };

    expect(await manager.dedupe('k', fn)).toBe(42);
    expect(await manager.dedupe('k', fn)).toBe(42);
    expect(await manager.dedupe('k', fn)).toBe(42);
    expect(calls).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// dedupe() — reject eviction (default) + retainErrors opt-in
// ─────────────────────────────────────────────────────────────────────

test.describe('ApiSetupManager.dedupe() reject handling', () => {
  test('evicts a rejected promise so the next caller fires fresh fn()', async () => {
    const manager = freshManager();
    let calls = 0;
    const flakyThenStable = async (): Promise<string> => {
      calls++;
      if (calls === 1) throw new Error('transient blip');
      return 'recovered';
    };

    await expect(manager.dedupe('k', flakyThenStable)).rejects.toThrow(/transient blip/);
    // Second call must execute a fresh attempt because the cache
    // entry for the rejected promise was evicted.
    expect(await manager.dedupe('k', flakyThenStable)).toBe('recovered');
    expect(calls).toBe(2);
  });

  test('concurrent callers all observe the same rejection from a single fn() invocation', async () => {
    const manager = freshManager();
    let calls = 0;
    const failing = async (): Promise<number> => {
      calls++;
      throw new Error('boom');
    };

    const results = await Promise.allSettled([
      manager.dedupe('k', failing),
      manager.dedupe('k', failing),
      manager.dedupe('k', failing)
    ]);

    expect(calls).toBe(1);
    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(results.every((r) => r.status === 'rejected' && /boom/.test((r.reason as Error).message))).toBe(true);
  });

  test('retainErrors: true pins the rejection so subsequent callers fast-fail', async () => {
    const manager = freshManager();
    let calls = 0;
    const failing = async (): Promise<number> => {
      calls++;
      throw new Error('permanent: template 999 not found');
    };

    await expect(manager.dedupe('k', failing, { retainErrors: true })).rejects.toThrow(/template 999/);
    await expect(manager.dedupe('k', failing, { retainErrors: true })).rejects.toThrow(/template 999/);
    expect(calls).toBe(1);
  });

  test('does not overwrite a later successful retry that filled the same key', async () => {
    // Regression guard for the eviction race: the catch handler on
    // a rejected promise must only evict if the slot still holds
    // *that* promise — a successful retry filling the slot first
    // must survive.
    const manager = freshManager();
    const failing = defer<number>();
    const succeeding = defer<number>();

    const callsLog: string[] = [];
    const p1 = manager.dedupe('k', () => {
      callsLog.push('first');
      return failing.promise;
    });

    // Reject the first promise; its `.catch` handler will run
    // microtask-asynchronously and try to evict.
    failing.reject(new Error('first-failed'));
    await p1.catch((): void => undefined);

    // Now a retry fills the slot. If the eviction logic were
    // unguarded, this entry would be nuked by the lingering
    // `.catch` of the *first* call — assert the opposite.
    const p2 = manager.dedupe('k', () => {
      callsLog.push('second');
      return succeeding.promise;
    });
    succeeding.resolve(7);
    expect(await p2).toBe(7);

    // Third call should hit the cache — no third fn invocation.
    expect(
      await manager.dedupe('k', () => {
        callsLog.push('third');
        return Promise.resolve(99);
      })
    ).toBe(7);

    expect(callsLog).toEqual([
      'first',
      'second'
    ]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// dedupe() — error-shape handling
// ─────────────────────────────────────────────────────────────────────

test.describe('ApiSetupManager.dedupe() fn error shapes', () => {
  test('converts a synchronously-thrown fn into a rejected promise', async () => {
    const manager = freshManager();
    const fn = (): Promise<number> => {
      throw new Error('sync boom');
    };

    await expect(manager.dedupe('k', fn)).rejects.toThrow(/sync boom/);
    // And eviction still works for sync throws.
    let secondCalls = 0;
    const fn2 = async (): Promise<number> => {
      secondCalls++;
      return 1;
    };
    expect(await manager.dedupe('k', fn2)).toBe(1);
    expect(secondCalls).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// clearCache() — escape hatch
// ─────────────────────────────────────────────────────────────────────

test.describe('ApiSetupManager.clearCache()', () => {
  test('forces the next caller to fire a fresh fn() invocation', async () => {
    const manager = freshManager();
    let calls = 0;
    const fn = async (): Promise<number> => {
      calls++;
      return calls;
    };

    expect(await manager.dedupe('k', fn)).toBe(1);
    expect(await manager.dedupe('k', fn)).toBe(1); // cache hit
    manager.clearCache();
    expect(await manager.dedupe('k', fn)).toBe(2); // fresh invocation
    expect(calls).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Cache-key convention example — sorted URLSearchParams stability
// ─────────────────────────────────────────────────────────────────────

test.describe('Cache-key convention (sorted URLSearchParams)', () => {
  test('callers using sorted URLSearchParams hit the same cache entry regardless of insert order', async () => {
    // This test does NOT call into FineractApiClient — it asserts the
    // recommended keying convention from the api-setup-manager.ts
    // docstring: callers that serialise their params via sorted
    // `URLSearchParams.toString()` produce identical keys even if
    // they appended the params in different orders.
    const manager = freshManager();
    let calls = 0;
    const fn = async (): Promise<string> => {
      calls++;
      return 'template';
    };

    const buildKey = (entries: ReadonlyArray<[
          string,
          string
        ]>): string => {
      const params = new URLSearchParams();
      for (const [
        k,
        v
      ] of entries) {
        params.set(k, v);
      }
      params.sort();
      return `loanTemplate:${params.toString()}`;
    };

    const key1 = buildKey([
      [
        'clientId',
        '1'
      ],
      [
        'productId',
        '2'
      ],
      [
        'activeOnly',
        'true'
      ]
    ]);
    const key2 = buildKey([
      [
        'activeOnly',
        'true'
      ],
      [
        'productId',
        '2'
      ],
      [
        'clientId',
        '1'
      ]
    ]);
    expect(key1).toBe(key2);

    const [
      a,
      b
    ] = await Promise.all([
      manager.dedupe(key1, fn),
      manager.dedupe(key2, fn)
    ]);
    expect(a).toBe('template');
    expect(b).toBe('template');
    expect(calls).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// getClientTemplate — domain wrapper
// ─────────────────────────────────────────────────────────────────────

function managerWithClientTemplateStub(returns: any = { offices: [] }) {
  let calls = 0;
  const stub = {
    getClientTemplate: async (_officeId?: number) => {
      calls += 1;
      return returns;
    }
  } as unknown as FineractApiClient;
  const manager = new ApiSetupManager(stub, { cache: new Map() });
  return { manager, getCalls: () => calls };
}

test.describe('getClientTemplate domain wrapper', () => {
  test('single fetch — concurrent callers share one HTTP call', async () => {
    const { manager, getCalls } = managerWithClientTemplateStub();
    const [
      a,
      b,
      c
    ] = await Promise.all([
      manager.getClientTemplate(),
      manager.getClientTemplate(),
      manager.getClientTemplate()
    ]);
    expect(getCalls()).toBe(1);
    expect(a).toEqual({ offices: [] });
    expect(b).toBe(a);
    expect(c).toBe(a);
  });

  test('cached — serial calls do not re-fetch', async () => {
    const { manager, getCalls } = managerWithClientTemplateStub();
    await manager.getClientTemplate();
    await manager.getClientTemplate();
    await manager.getClientTemplate();
    expect(getCalls()).toBe(1);
  });

  test('distinct keys — different officeId values are cached separately', async () => {
    let calls = 0;
    const stub = {
      getClientTemplate: async (id?: number) => {
        calls += 1;
        return { officeId: id };
      }
    } as unknown as FineractApiClient;
    const manager = new ApiSetupManager(stub, { cache: new Map() });
    const a = await manager.getClientTemplate(1);
    const b = await manager.getClientTemplate(2);
    const c = await manager.getClientTemplate(1); // cache hit for officeId=1
    expect(calls).toBe(2); // officeId=1 once, officeId=2 once
    expect(a).toBe(c); // same reference from cache
    expect(b).not.toBe(a);
  });

  test('sentinel isolation — no-officeId key does not collide with officeId=0', async () => {
    const results: number[] = [];
    let calls = 0;
    const stub = {
      getClientTemplate: async (id?: number) => {
        calls += 1;
        results.push(id as number);
        return { id };
      }
    } as unknown as FineractApiClient;
    const manager = new ApiSetupManager(stub, { cache: new Map() });
    const noId = await manager.getClientTemplate();
    const zeroId = await manager.getClientTemplate(0);
    expect(calls).toBe(2);
    expect(noId).toEqual({ id: undefined });
    expect(zeroId).toEqual({ id: 0 });
    expect(results).toEqual([
      undefined,
      0
    ]);
  });

  test('reject eviction — failed fetch is not cached', async () => {
    let calls = 0;
    const stub = {
      getClientTemplate: async () => {
        calls += 1;
        if (calls === 1) throw new Error('network error');
        return { offices: ['recovered'] };
      }
    } as unknown as FineractApiClient;
    const manager = new ApiSetupManager(stub, { cache: new Map() });
    await expect(manager.getClientTemplate()).rejects.toThrow('network error');
    const result = await manager.getClientTemplate();
    expect(calls).toBe(2);
    expect(result).toEqual({ offices: ['recovered'] });
  });
});
