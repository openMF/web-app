/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { vaultCashDepositGuard, vaultDepositHistoryGuard } from './vault-cash-deposit.guard';

describe('vaultCashDepositGuard', () => {
  const rbac = environment.productionModeEnableRBAC;
  afterEach(() => (environment.productionModeEnableRBAC = rbac));
  function run(permissions: string[], authenticated = true, history = false) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useValue: { isAuthenticated: () => authenticated, getCredentials: () => ({ permissions }) }
        },
        { provide: Router, useValue: { createUrlTree: (path: string[]) => ({ path }) as unknown as UrlTree } }
      ]
    });
    return TestBed.runInInjectionContext(() =>
      (history ? vaultDepositHistoryGuard : vaultCashDepositGuard)({} as never, {} as never)
    );
  }
  it.each([
    'READ_BASE_TELLER_CASH_INVENTORY',
    'ALL_FUNCTIONS_READ',
    'ALL_FUNCTIONS'
  ])('allows %s', (permission) => expect(run([permission])).toBe(true));
  it.each([
    false,
    true
  ])('denies unauthorized direct URLs with legacy RBAC=%s', (rbacEnabled) => {
    environment.productionModeEnableRBAC = rbacEnabled;
    expect(run(['READ_TELLER'])).toEqual({ path: ['/organization/base-teller'] });
  });
  it('redirects anonymous access to login', () => expect(run(['ALL_FUNCTIONS'], false)).toEqual({ path: ['/login'] }));
  it.each(
    [
      ['ALL_FUNCTIONS'],
      ['ALL_FUNCTIONS_READ'],
      [
        'READ_BASE_TELLER_CASH_INVENTORY',
        'READ_BASE_TELLER_TRANSACTION_HISTORY'
      ]
    ].map((rights) => [rights])
  )('allows authorized history routes: %j', (permissions) => expect(run(permissions, true, true)).toBe(true));
  it.each(
    [
      [],
      ['READ_BASE_TELLER_CASH_INVENTORY'],
      ['READ_BASE_TELLER_TRANSACTION_HISTORY']
    ].map((rights) => [rights])
  )('denies history without both read permissions: %j', (permissions) =>
    expect(run(permissions, true, true)).toEqual({ path: ['/organization/base-teller'] })
  );
  it('redirects anonymous history to login', () =>
    expect(run(['ALL_FUNCTIONS'], false, true)).toEqual({ path: ['/login'] }));
});
