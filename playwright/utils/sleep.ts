/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import fs from 'fs';
import path from 'path';

/**
 * `loggedSleep` — the only sanctioned way to introduce a hard-coded
 * delay inside the Playwright suite.
 *
 * Per GSoC 2026 proposal WA-2.4: bare `page.waitForTimeout(...)` is
 * banned by ESLint (`no-bare-wait-for-timeout`). When a delay is
 * genuinely unavoidable (e.g. waiting for a debounce that has no DOM
 * observable signal), callers MUST go through this helper so that:
 *
 *   1. Every sleep carries a reason string explaining WHY it exists.
 *   2. Every sleep is appended to `playwright/sleeps.json` so the team
 *      can audit and progressively eliminate them.
 *
 * The registry is intentionally a flat JSON array, easy to grep and
 * diff in code review.
 */
export interface LoggedSleepEntry {
  ms: number;
  reason: string;
  callerFile?: string;
  callerLine?: number;
  recordedAt: string; // ISO timestamp
}

const REGISTRY_PATH = path.resolve(process.cwd(), 'playwright/sleeps.json');

export async function loggedSleep(ms: number, reason: string): Promise<void> {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new Error(
      `loggedSleep: ms must be a non-negative finite number, got ${ms}. ` +
        'Passing NaN, Infinity, or a negative value silently coerces to 0 in setTimeout.'
    );
  }
  if (!reason || reason.trim().length < 10) {
    throw new Error(
      `loggedSleep(${ms}ms) requires a meaningful reason (>= 10 chars). ` +
        'Bare timeouts are banned — explain why a wait is unavoidable.'
    );
  }

  const caller = resolveCaller();
  recordSleep({
    ms,
    reason: reason.trim(),
    callerFile: caller?.file,
    callerLine: caller?.line,
    recordedAt: new Date().toISOString()
  });

  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * NOTE — sequential write design:
 * This uses a read-modify-write cycle without a cross-process lock.
 * Concurrent Playwright workers could overwrite each other's entries.
 * This is acceptable because:
 *   1. `playwright.config.ts` sets `workers: 1` in CI, so writes are
 *      sequential there (the only environment where the audit record matters).
 *   2. The registry is advisory/audit-only; a rare lost entry during
 *      local parallel dev is not test-critical.
 * Adding a cross-process file lock would require a new dependency
 * (e.g. `proper-lockfile`) disproportionate for a debug registry.
 */
function recordSleep(entry: LoggedSleepEntry): void {
  if (process.env.PLAYWRIGHT_DISABLE_SLEEP_REGISTRY === '1') return;
  try {
    let existing: LoggedSleepEntry[] = [];
    if (fs.existsSync(REGISTRY_PATH)) {
      const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8').trim();
      if (raw.length > 0) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existing = parsed as LoggedSleepEntry[];
        }
      }
    }
    existing.push(entry);
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
  } catch (err) {
    // Logging the sleep must never break the test run.
    console.warn('[loggedSleep] could not update sleeps.json:', err);
  }
}

function resolveCaller(): { file: string; line: number } | undefined {
  const stack = new Error().stack;
  if (!stack) return undefined;
  const lines = stack.split('\n');
  // Skip frames inside this file.
  for (const line of lines) {
    if (line.includes('sleep.ts') || line.includes('resolveCaller')) continue;
    const match = line.match(/\(?([^():\s]+\.(?:ts|js)):(\d+):(\d+)\)?$/);
    if (match) {
      return { file: match[1], line: Number(match[2]) };
    }
  }
  return undefined;
}
