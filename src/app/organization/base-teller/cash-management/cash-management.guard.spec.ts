/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { cashManagementGuard } from './cash-management.guard';

describe('cashManagementGuard', () => {
  const originalRbac = environment.productionModeEnableRBAC;

  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
  });

  function run(permission: string, permissions: string[]): boolean | UrlTree {
    TestBed.resetTestingModule();
    const deniedTree = {} as UrlTree;
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: Router, useValue: { createUrlTree: jest.fn(() => deniedTree) } }
      ]
    });
    environment.productionModeEnableRBAC = true;
    const route = { data: { permission } } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => cashManagementGuard(route, {} as never)) as boolean | UrlTree;
  }

  it.each([
    'READ_CASHIER_CLOSING',
    'READ_GLOBAL_SETTLEMENT',
    'CREATE_CASH_DEPOSIT',
    'READ_CASH_OPERATION_HISTORY',
    'READ_CASH_HOLDINGS'
  ])('allows the exact %s workflow permission', (permission) => {
    expect(run(permission, [permission])).toBe(true);
  });

  it('allows ALL_FUNCTIONS for write workflows', () => {
    expect(run('CREATE_CASH_DEPOSIT', ['ALL_FUNCTIONS'])).toBe(true);
  });

  it('allows ALL_FUNCTIONS_READ only for read workflows', () => {
    expect(run('READ_CASH_HOLDINGS', ['ALL_FUNCTIONS_READ'])).toBe(true);
    expect(run('CREATE_CASH_DEPOSIT', ['ALL_FUNCTIONS_READ'])).not.toBe(true);
  });

  it('redirects users without the required permission', () => {
    expect(run('READ_CASHIER_CLOSING', ['READ_TELLER'])).not.toBe(true);
  });

  it('allows access when RBAC is disabled', () => {
    environment.productionModeEnableRBAC = false;

    expect(cashManagementGuard({} as never, {} as never)).toBe(true);
  });
});
