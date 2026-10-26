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
import { servicePaymentGuard } from './service-payment.guard';

describe('servicePaymentGuard', () => {
  const originalProductionMode = environment.productionMode;
  const originalRbac = environment.productionModeEnableRBAC;

  afterEach(() => {
    environment.productionMode = originalProductionMode;
    environment.productionModeEnableRBAC = originalRbac;
  });

  function run(productionMode: boolean, permissions: string[]): boolean | UrlTree {
    const deniedTree = {} as UrlTree;
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: Router, useValue: { createUrlTree: jest.fn(() => deniedTree) } }
      ]
    });
    environment.productionMode = productionMode;
    environment.productionModeEnableRBAC = true;
    return TestBed.runInInjectionContext(() => servicePaymentGuard({} as never, {} as never)) as boolean | UrlTree;
  }

  it('redirects when production mode is disabled', () => {
    expect(run(false, ['READ_BASE_TELLER_SERVICE_PAYMENT'])).not.toBe(true);
  });

  it('allows the exact backend read permission in production mode', () => {
    expect(run(true, ['READ_BASE_TELLER_SERVICE_PAYMENT'])).toBe(true);
  });

  it('redirects users without the backend read permission', () => {
    expect(run(true, ['READ_TELLER'])).not.toBe(true);
  });
});
