/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { loggedSleep } from './sleep';

test.use({ storageState: { cookies: [], origins: [] } });

const REGISTRY = path.resolve(process.cwd(), 'playwright/sleeps.json');

function readRegistry(): unknown[] {
  if (!fs.existsSync(REGISTRY)) return [];
  const raw = fs.readFileSync(REGISTRY, 'utf-8').trim();
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

test.describe('loggedSleep()', () => {
  test('rejects empty / short reasons', async () => {
    await expect(loggedSleep(1, '')).rejects.toThrow(/meaningful reason/);
    await expect(loggedSleep(1, 'short')).rejects.toThrow(/meaningful reason/);
  });

  test('sleeps for at least the requested duration and records the entry', async () => {
    // Snapshot the env flag so we can restore it unconditionally at the end,
    // preventing any leakage into subsequent tests in the same worker.
    const originalFlag = process.env.PLAYWRIGHT_DISABLE_SLEEP_REGISTRY;
    try {
      // Use the disable flag for the actual sleep so we don't pollute the
      // committed registry, then flip it off to write one controlled entry.
      process.env.PLAYWRIGHT_DISABLE_SLEEP_REGISTRY = '1';
      const t0 = Date.now();
      await loggedSleep(60, 'unit test: verify duration is honored');
      const elapsed = Date.now() - t0;
      expect(elapsed).toBeGreaterThanOrEqual(50);

      // Now record exactly one entry, snapshot, and roll back.
      delete process.env.PLAYWRIGHT_DISABLE_SLEEP_REGISTRY;
      const before = readRegistry();
      try {
        await loggedSleep(5, 'unit test: registry write smoke check');
        const after = readRegistry();
        expect(after.length).toBe(before.length + 1);
        const last = after[after.length - 1] as { ms: number; reason: string };
        expect(last.ms).toBe(5);
        expect(last.reason).toMatch(/registry write smoke check/);
      } finally {
        // Roll back so the committed sleeps.json stays clean.
        fs.writeFileSync(REGISTRY, JSON.stringify(before, null, 2) + '\n', 'utf-8');
      }
    } finally {
      // Restore original env flag regardless of test outcome.
      if (originalFlag === undefined) {
        delete process.env.PLAYWRIGHT_DISABLE_SLEEP_REGISTRY;
      } else {
        process.env.PLAYWRIGHT_DISABLE_SLEEP_REGISTRY = originalFlag;
      }
    }
  });
});
