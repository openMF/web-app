/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Unit coverage for the pure helpers in `_shared.ts`.
 *
 * `resolveDefaultOfficeId` needs an `ApiSetupManager` and is exercised
 * by the integration specs; `resolveProductId` is pure, so it is
 * pinned here where it costs nothing to run.
 */

import { test, expect } from '@playwright/test';
import { resolveProductId } from './_shared';

test.describe('resolveProductId', () => {
  test('reads the `id` spelling returned by ensure*Product', () => {
    expect(resolveProductId({ id: 42, name: 'E2E Loan Product' }, 'loan.factory')).toBe(42);
  });

  test('reads the `resourceId` spelling returned by create-* envelopes', () => {
    expect(resolveProductId({ resourceId: 7 }, 'savings.factory')).toBe(7);
  });

  test('prefers `id` when a payload carries both spellings', () => {
    // Fineract product-list rows carry `id`; a create envelope merged on
    // top could add `resourceId`. `id` is the canonical product key.
    expect(resolveProductId({ id: 3, resourceId: 99 }, 'loan.factory')).toBe(3);
  });

  test('accepts id 0 rather than treating it as absent', () => {
    // Guards against a `||` regression — 0 is falsy but a valid id.
    expect(resolveProductId({ id: 0 }, 'loan.factory')).toBe(0);
  });

  test('falls back to a numeric resourceId when id is present but not numeric', () => {
    // `id ?? resourceId` would latch onto the non-numeric `id` and throw,
    // discarding a perfectly good `resourceId`. Selection must be by type,
    // not merely by presence.
    expect(resolveProductId({ id: 'invalid', resourceId: 7 }, 'savings.factory')).toBe(7);
  });

  test('throws a caller-tagged error when neither spelling is numeric', () => {
    // The silent failure this replaces was an account POSTed with
    // `productId: undefined`, which Fineract rejects with an opaque 400.
    expect(() => resolveProductId({ name: 'no id here' }, 'savings.factory')).toThrow(
      /savings\.factory: product payload missing a numeric id\/resourceId/
    );
  });

  test('throws on a string id instead of silently coercing it', () => {
    expect(() => resolveProductId({ id: '42' }, 'loan.factory')).toThrow(/loan\.factory/);
  });

  test('throws on null and undefined payloads', () => {
    expect(() => resolveProductId(null, 'loan.factory')).toThrow(/loan\.factory/);
    expect(() => resolveProductId(undefined, 'loan.factory')).toThrow(/loan\.factory/);
  });
});
