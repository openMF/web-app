/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import {
  classifyError,
  DEFAULT_FIBONACCI_DELAYS_MS,
  retry,
  RetryableResultError,
  type RetryAttemptInfo
} from './retry';

// These tests do not exercise the browser — they validate pure logic.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('retry() utility', () => {
  test('returns immediately on first success', async () => {
    let calls = 0;
    const result = await retry(async () => {
      calls++;
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(calls).toBe(1);
  });

  test('uses Fibonacci delay schedule by default', () => {
    expect(DEFAULT_FIBONACCI_DELAYS_MS).toEqual([
      1000,
      2000,
      3000,
      5000,
      8000
    ]);
  });

  test('retries transient failures and eventually succeeds', async () => {
    let calls = 0;
    const sleeps: number[] = [];
    const result = await retry(
      async () => {
        calls++;
        if (calls < 3) {
          const err = new Error('flake') as Error & { status: number };
          err.status = 503;
          throw err;
        }
        return 'recovered';
      },
      {
        jitter: false,
        sleep: async (ms) => {
          sleeps.push(ms);
        }
      }
    );
    expect(result).toBe('recovered');
    expect(calls).toBe(3);
    expect(sleeps).toEqual([
      1000,
      2000
    ]);
  });

  test('aborts immediately on permanent error', async () => {
    let calls = 0;
    const onRetry = (_info: RetryAttemptInfo) => {
      throw new Error('onRetry should not fire for permanent errors');
    };
    const permanent = new Error('bad creds') as Error & { status: number };
    permanent.status = 401;
    await expect(
      retry(
        async () => {
          calls++;
          throw permanent;
        },
        {
          jitter: false,
          sleep: async () => undefined,
          onRetry
        }
      )
    ).rejects.toBe(permanent);
    expect(calls).toBe(1);
  });

  test('throws last error after exhausting attempts', async () => {
    let calls = 0;
    await expect(
      retry(
        async () => {
          calls++;
          const err = new Error('still 502') as Error & { status: number };
          err.status = 502;
          throw err;
        },
        {
          delaysMs: [
            10,
            20
          ],
          jitter: false,
          sleep: async () => undefined
        }
      )
    ).rejects.toThrow('still 502');
    expect(calls).toBe(3); // 1 initial + 2 retries
  });

  test('retryOnResult treats a returned value as transient failure', async () => {
    let calls = 0;
    await expect(
      retry(
        async () => {
          calls++;
          return { status: 503 };
        },
        {
          delaysMs: [5],
          jitter: false,
          sleep: async () => undefined,
          retryOnResult: (r) => r.status >= 500
        }
      )
    ).rejects.toBeInstanceOf(RetryableResultError);
    expect(calls).toBe(2);
  });

  test('onRetry is invoked with diagnostic info', async () => {
    const events: RetryAttemptInfo[] = [];
    await retry(
      async () => {
        if (events.length < 1) {
          const err = new Error('blip') as Error & { code: string };
          err.code = 'ECONNRESET';
          throw err;
        }
        return 'done';
      },
      {
        label: 'login-api',
        delaysMs: [7],
        jitter: false,
        sleep: async () => undefined,
        onRetry: (info) => events.push(info)
      }
    );
    expect(events).toHaveLength(1);
    expect(events[0].label).toBe('login-api');
    expect(events[0].attempt).toBe(1);
    expect(events[0].delayMs).toBe(7);
    expect(events[0].classification).toBe('transient');
  });
});

test.describe('classifyError()', () => {
  test('5xx → transient', () => {
    expect(classifyError({ status: 500 })).toBe('transient');
    expect(classifyError({ status: 503 })).toBe('transient');
    expect(classifyError({ response: { status: 504 } })).toBe('transient');
  });

  test('4xx → permanent (except 408/425/429)', () => {
    expect(classifyError({ status: 400 })).toBe('permanent');
    expect(classifyError({ status: 401 })).toBe('permanent');
    expect(classifyError({ status: 422 })).toBe('permanent');
    expect(classifyError({ status: 408 })).toBe('transient');
    expect(classifyError({ status: 425 })).toBe('transient');
    expect(classifyError({ status: 429 })).toBe('transient');
  });

  test('network error codes → transient', () => {
    expect(classifyError({ code: 'ECONNRESET' })).toBe('transient');
    expect(classifyError({ code: 'ETIMEDOUT' })).toBe('transient');
    expect(classifyError({ code: 'ECONNREFUSED' })).toBe('transient');
  });

  test('Playwright TimeoutError → transient', () => {
    expect(classifyError({ name: 'TimeoutError', message: 'x' })).toBe('transient');
  });
});
