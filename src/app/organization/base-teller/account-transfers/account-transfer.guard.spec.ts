/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { accountTransferGuard, canReadTransfers } from './account-transfer.guard';
import { environment } from 'environments/environment';
describe('account transfer permissions', () => {
  it.each([
    ['READ_ACCOUNTTRANSFER'],
    ['ALL_FUNCTIONS'],
    ['ALL_FUNCTIONS_READ']
  ])('accepts %s', (permission) => expect(canReadTransfers([permission])).toBe(true));
  it.each([
    [],
    ['CREATE_ACCOUNTTRANSFER'],
    ['READ_TELLER']
  ])('denies unrelated permission %j', (...permissions) =>
    expect(canReadTransfers(permissions as string[])).toBe(false)
  );
  it('protects direct navigation even when global RBAC is disabled', () => {
    const original = environment.productionModeEnableRBAC;
    environment.productionModeEnableRBAC = false;
    const denied = {};
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: [] as string[] }) } },
        { provide: Router, useValue: { createUrlTree: () => denied } }
      ]
    });
    expect(TestBed.runInInjectionContext(() => accountTransferGuard({} as never, {} as never))).toBe(denied);
    environment.productionModeEnableRBAC = original;
  });
});
