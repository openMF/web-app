/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { cashInventoryGuard } from './cash-inventory.guard';

describe('cashInventoryGuard', () => {
  const originalRbac = environment.productionModeEnableRBAC;

  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
  });

  function run(permissions: string[]): boolean | UrlTree {
    TestBed.resetTestingModule();
    const deniedTree = {} as UrlTree;
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: Router, useValue: { createUrlTree: jest.fn(() => deniedTree) } }
      ]
    });
    environment.productionModeEnableRBAC = true;
    return TestBed.runInInjectionContext(() => cashInventoryGuard({} as never, {} as never)) as boolean | UrlTree;
  }

  it.each([
    'READ_BASE_TELLER_CASH_INVENTORY',
    'ALL_FUNCTIONS_READ',
    'ALL_FUNCTIONS'
  ])('allows %s', (permission) => {
    expect(run([permission])).toBe(true);
  });

  it('redirects a user without inventory permission', () => {
    expect(run(['READ_TELLER'])).not.toBe(true);
  });

  it('allows access when RBAC is disabled', () => {
    environment.productionModeEnableRBAC = false;
    expect(cashInventoryGuard({} as never, {} as never)).toBe(true);
  });
});
