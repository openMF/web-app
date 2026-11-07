/**
 * Copyright since 2026 Mifos Initiative
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
import { creditPaymentGuard } from './credit-payment.guard';

describe('creditPaymentGuard', () => {
  const originalRbac = environment.productionModeEnableRBAC;

  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
    TestBed.resetTestingModule();
  });

  function run(permissions: string[]): boolean | UrlTree {
    const deniedTree = {} as UrlTree;
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: Router, useValue: { createUrlTree: jest.fn(() => deniedTree) } }
      ]
    });
    environment.productionModeEnableRBAC = true;
    return TestBed.runInInjectionContext(() => creditPaymentGuard({} as never, {} as never)) as boolean | UrlTree;
  }

  it('allows the exact backend read permission', () => {
    expect(run(['READ_BASE_TELLER_CREDIT_PAYMENT'])).toBe(true);
  });

  it('allows the platform all-functions read permission', () => {
    expect(run(['ALL_FUNCTIONS_READ'])).toBe(true);
  });

  it('redirects a user without read permission', () => {
    expect(run(['READ_TELLER'])).not.toBe(true);
  });
});
