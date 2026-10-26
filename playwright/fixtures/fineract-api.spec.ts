/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';

import { FineractApiClient } from './fineract-api';

/**
 * Pure-logic unit spec for {@link FineractApiClient} URL construction —
 * no live backend, no browser. The request context is replaced with a
 * recorder so the assertion is on the URL the client *would* send.
 *
 * Regression target: `productId: 0` is a valid product scope. A
 * truthiness guard (`if (productId)`) drops it, silently downgrading the
 * template request to an unscoped one. These tests pin the explicit
 * `!== undefined` guard in `getLoanTemplate` / `getSavingsAccountTemplate`.
 */

/**
 * Build a client whose request context records the URL of the next GET
 * and returns a minimal OK/JSON response, so template methods resolve
 * without touching the network.
 *
 * @param record - Receives the URL passed to `ctx.get`.
 * @returns A `FineractApiClient` with its private context stubbed.
 */
function clientRecordingGetUrl(record: (url: string) => void): FineractApiClient {
  const client = new FineractApiClient('http://localhost', 'default', 'user', 'pass');
  // The request context is a private field created in `init()`; the unit
  // under test is URL construction, so a recording stub stands in for it.
  (client as unknown as { ctx: unknown }).ctx = {
    get: async (url: string) => {
      record(url);
      return { ok: () => true, json: async () => ({}) };
    }
  };
  return client;
}

test.describe('FineractApiClient · template product scoping', () => {
  test('getSavingsAccountTemplate sends productId=0 rather than dropping it', async () => {
    let requestedUrl = '';
    const client = clientRecordingGetUrl((url) => (requestedUrl = url));

    await client.getSavingsAccountTemplate(1, 0);

    expect(requestedUrl).toContain('productId=0');
  });

  test('getLoanTemplate sends productId=0 rather than dropping it', async () => {
    let requestedUrl = '';
    const client = clientRecordingGetUrl((url) => (requestedUrl = url));

    await client.getLoanTemplate(1, 0);

    expect(requestedUrl).toContain('productId=0');
  });

  test('getSavingsAccountTemplate omits productId when it is undefined', async () => {
    let requestedUrl = '';
    const client = clientRecordingGetUrl((url) => (requestedUrl = url));

    await client.getSavingsAccountTemplate(1);

    expect(requestedUrl).not.toContain('productId');
  });
});
