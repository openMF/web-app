/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { transactionReversalGuard } from './transaction-reversal.guard';

describe('transactionReversalGuard', () => {
  const original = environment.productionModeEnableRBAC;
  let permissions: string[];

  beforeEach(() => {
    environment.productionModeEnableRBAC = true;
    permissions = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }
      ]
    });
  });

  afterEach(() => (environment.productionModeEnableRBAC = original));

  const run = () =>
    TestBed.runInInjectionContext(() =>
      transactionReversalGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  it('allows the reversal read permission', () => {
    permissions = ['READ_BASE_TELLER_TRANSACTION_REVERSAL'];
    expect(run()).toBe(true);
  });

  it('allows all functions', () => {
    permissions = ['ALL_FUNCTIONS'];
    expect(run()).toBe(true);
  });

  it('allows global read access', () => {
    permissions = ['ALL_FUNCTIONS_READ'];
    expect(run()).toBe(true);
  });

  it('redirects users without reversal permission', () => {
    const result = run();
    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe(
      '/organization/base-teller'
    );
  });
});
