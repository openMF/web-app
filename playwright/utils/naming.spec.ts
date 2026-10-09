/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import {
  E2E_NAME_PATTERN,
  E2E_NAME_PREFIX,
  E2E_RANDOM_TOKEN_LENGTH,
  E2ENameGenerationError,
  generateE2EName
} from './naming';

// Pure-logic specs — they run under the `unit` Playwright project
// (testMatch: /playwright\/utils\/.*\.spec\.ts/ in playwright.config.ts)
// with no browser, no app, no backend. Every dynamic dependency
// (clock, RNG, shard) is injected so assertions are deterministic.
test.use({ storageState: { cookies: [], origins: [] } });

// ─────────────────────────────────────────────────────────────────────
// naming.ts — exported constants
// ─────────────────────────────────────────────────────────────────────

test.describe('naming constants', () => {
  test('exports the documented prefix and token length', () => {
    expect(E2E_NAME_PREFIX).toBe('E2E');
    expect(E2E_RANDOM_TOKEN_LENGTH).toBe(6);
  });

  test('E2E_NAME_PATTERN matches the documented format', () => {
    expect('E2E_S0_1750000000000_abc123').toMatch(E2E_NAME_PATTERN);
    expect('E2E_client_S3_1750000000000_zz9999').toMatch(E2E_NAME_PATTERN);
    // Non-matches: missing prefix, uppercase token, missing shard, …
    expect('S0_1750000000000_abc123').not.toMatch(E2E_NAME_PATTERN);
    expect('E2E_S0_1750000000000_ABCDEF').not.toMatch(E2E_NAME_PATTERN);
    expect('E2E_1750000000000_abc123').not.toMatch(E2E_NAME_PATTERN);
  });
});

// ─────────────────────────────────────────────────────────────────────
// generateE2EName() — format and injection contract
// ─────────────────────────────────────────────────────────────────────

test.describe('generateE2EName() format', () => {
  test('produces a name that matches E2E_NAME_PATTERN with all defaults', () => {
    const name = generateE2EName();
    expect(name).toMatch(E2E_NAME_PATTERN);
    expect(name.startsWith(`${E2E_NAME_PREFIX}_S`)).toBe(true);
  });

  test('embeds the injected shard, timestamp, and random token verbatim', () => {
    const name = generateE2EName(undefined, {
      shard: 3,
      now: () => 1_750_000_000_000,
      random: () => 0.123456789
    });
    // (0.123456789).toString(36) === '0.4fzzzxjylrx' — first 6 chars after '0.'
    expect(name).toBe('E2E_S3_1750000000000_4fzzzx');
  });

  test('prepends the sanitised prefix between E2E_ and S{shard}', () => {
    const name = generateE2EName('client', {
      shard: 0,
      now: () => 1_750_000_000_000,
      random: () => 0.5
    });
    expect(name.startsWith('E2E_client_S0_1750000000000_')).toBe(true);
    expect(name).toMatch(E2E_NAME_PATTERN);
  });

  test('strips disallowed characters from the prefix', () => {
    const name = generateE2EName('loan-product!@#', {
      shard: 0,
      now: () => 1,
      random: () => 0.5
    });
    expect(name.startsWith('E2E_loanproduct_S0_1_')).toBe(true);
  });

  test('treats an all-symbol prefix the same as no prefix', () => {
    const name = generateE2EName('!@#$', {
      shard: 0,
      now: () => 1,
      random: () => 0.5
    });
    expect(name.startsWith('E2E_S0_1_')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// generateE2EName() — shard resolution
// ─────────────────────────────────────────────────────────────────────

test.describe('generateE2EName() shard resolution', () => {
  test('falls back to TEST_PARALLEL_INDEX when no shard option is passed', () => {
    const original = process.env.TEST_PARALLEL_INDEX;
    process.env.TEST_PARALLEL_INDEX = '7';
    try {
      const name = generateE2EName(undefined, {
        now: () => 1,
        random: () => 0.5
      });
      expect(name.startsWith('E2E_S7_1_')).toBe(true);
    } finally {
      if (original === undefined) {
        delete process.env.TEST_PARALLEL_INDEX;
      } else {
        process.env.TEST_PARALLEL_INDEX = original;
      }
    }
  });

  test('falls back to "0" when neither option nor env var is set', () => {
    const original = process.env.TEST_PARALLEL_INDEX;
    delete process.env.TEST_PARALLEL_INDEX;
    try {
      const name = generateE2EName(undefined, {
        now: () => 1,
        random: () => 0.5
      });
      expect(name.startsWith('E2E_S0_1_')).toBe(true);
    } finally {
      if (original !== undefined) {
        process.env.TEST_PARALLEL_INDEX = original;
      }
    }
  });

  test('sanitises a malformed env value to digits-only', () => {
    const original = process.env.TEST_PARALLEL_INDEX;
    process.env.TEST_PARALLEL_INDEX = 'w-12';
    try {
      const name = generateE2EName(undefined, {
        now: () => 1,
        random: () => 0.5
      });
      expect(name.startsWith('E2E_S12_1_')).toBe(true);
    } finally {
      if (original === undefined) {
        delete process.env.TEST_PARALLEL_INDEX;
      } else {
        process.env.TEST_PARALLEL_INDEX = original;
      }
    }
  });

  test('accepts a numeric shard option and truncates fractional values', () => {
    const name = generateE2EName(undefined, {
      shard: 2.9,
      now: () => 1,
      random: () => 0.5
    });
    expect(name.startsWith('E2E_S2_1_')).toBe(true);
  });

  test('floors a negative shard to 0 rather than embedding the minus sign', () => {
    const name = generateE2EName(undefined, {
      shard: -4,
      now: () => 1,
      random: () => 0.5
    });
    expect(name.startsWith('E2E_S0_1_')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// generateE2EName() — uniqueness + edge cases
// ─────────────────────────────────────────────────────────────────────

test.describe('generateE2EName() uniqueness', () => {
  test('produces 100 unique names with a fixed clock when RNG varies', () => {
    const fixedNow = (): number => 1_750_000_000_000;
    const seen = new Set<string>();
    let counter = 0;
    const rng = (): number => {
      counter++;
      return counter / 1000; // 0.001, 0.002, … 0.100 — all distinct
    };

    for (let i = 0; i < 100; i++) {
      seen.add(generateE2EName(undefined, { now: fixedNow, random: rng }));
    }

    expect(seen.size).toBe(100);
  });

  test('always emits a token of exactly E2E_RANDOM_TOKEN_LENGTH characters', () => {
    // Worst-case input: random() returns a value so small that
    // `.toString(36)` produces almost nothing — the sanitiser must
    // still pad to the configured length.
    const name = generateE2EName(undefined, {
      shard: 0,
      now: () => 1,
      random: () => 0
    });
    const token = name.split('_').slice(-1)[0];
    expect(token).toHaveLength(E2E_RANDOM_TOKEN_LENGTH);
  });

  test('honours a custom randomTokenLength', () => {
    const name = generateE2EName(undefined, {
      shard: 0,
      now: () => 1,
      random: () => 0.5,
      randomTokenLength: 3
    });
    const token = name.split('_').slice(-1)[0];
    expect(token).toHaveLength(3);
  });

  test('throws E2ENameGenerationError on an invalid randomTokenLength', () => {
    expect(() =>
      generateE2EName(undefined, {
        randomTokenLength: 0
      })
    ).toThrow(E2ENameGenerationError);
    expect(() =>
      generateE2EName(undefined, {
        randomTokenLength: 99
      })
    ).toThrow(/randomTokenLength/);
  });

  test('clamps a fractional timestamp to an integer ms', () => {
    const name = generateE2EName(undefined, {
      shard: 0,
      now: () => 1_750_000_000_000.9,
      random: () => 0.5
    });
    expect(name.startsWith('E2E_S0_1750000000000_')).toBe(true);
  });
});
