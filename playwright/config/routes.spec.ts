/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import { ROUTES, appRoutePath, isAtRoute, toAppRoutePath } from './routes';

// Pure-logic specs — they run under the `unit` Playwright project with no
// browser, no app and no backend. Both routing styles are covered by
// passing `usesHashRouting` explicitly instead of relying on BEHAVIOR.
test.use({ storageState: { cookies: [], origins: [] } });

const HASH = true;
const HISTORY = false;

test.describe('appRoutePath()', () => {
  test('reads the route from the fragment under hash routing', () => {
    expect(appRoutePath(new URL('https://host/#/clients/1/general'), HASH)).toBe('/clients/1/general');
  });

  test('drops the query string under hash routing', () => {
    expect(appRoutePath(new URL('https://host/#/clients/1/general?tab=2'), HASH)).toBe('/clients/1/general');
  });

  test('ignores the path in front of the fragment under hash routing', () => {
    expect(appRoutePath(new URL('https://host/app/#/groups'), HASH)).toBe('/groups');
  });

  test('returns the root route when there is no fragment under hash routing', () => {
    expect(appRoutePath(new URL('https://host/'), HASH)).toBe('/');
    expect(appRoutePath(new URL('https://host/#'), HASH)).toBe('/');
  });

  test('reads the route from the path under history routing', () => {
    expect(appRoutePath(new URL('https://host/clients/1/general?tab=2'), HISTORY)).toBe('/clients/1/general');
  });

  test('ignores the fragment under history routing', () => {
    expect(appRoutePath(new URL('https://host/clients#section'), HISTORY)).toBe('/clients');
  });
});

test.describe('toAppRoutePath()', () => {
  test('drops the hash-routing prefix from a ROUTES value', () => {
    expect(toAppRoutePath('/#/clients/1/family-members')).toBe('/clients/1/family-members');
    expect(toAppRoutePath(ROUTES.login)).toBe('/login');
  });

  test('leaves a history-routing value unchanged', () => {
    expect(toAppRoutePath('/clients/1/family-members')).toBe('/clients/1/family-members');
  });
});

test.describe('isAtRoute()', () => {
  const route = ROUTES.clientFamilyMembers(7);

  test('matches the exact route under hash routing, ignoring the query string', () => {
    expect(isAtRoute(new URL('https://host/#/clients/7/family-members'), route, HASH)).toBe(true);
    expect(isAtRoute(new URL('https://host/#/clients/7/family-members?x=1'), route, HASH)).toBe(true);
  });

  test('rejects a child route, another client and the root route', () => {
    expect(isAtRoute(new URL('https://host/#/clients/7/family-members/add'), route, HASH)).toBe(false);
    expect(isAtRoute(new URL('https://host/#/clients/8/family-members'), route, HASH)).toBe(false);
    expect(isAtRoute(new URL('https://host/#/'), route, HASH)).toBe(false);
  });

  test('matches the same route under history routing', () => {
    expect(isAtRoute(new URL('https://host/clients/7/family-members'), route, HISTORY)).toBe(true);
    expect(isAtRoute(new URL('https://host/clients/7/family-members/add'), route, HISTORY)).toBe(false);
  });
});
