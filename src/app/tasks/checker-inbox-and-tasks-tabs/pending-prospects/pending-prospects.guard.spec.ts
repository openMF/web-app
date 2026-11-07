/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import {
  PENDING_PROSPECTS_PERMISSION,
  hasPendingProspectsPermission,
  pendingProspectsGuard
} from './pending-prospects.guard';

describe('Pending prospects route permissions', () => {
  it('matches the backend READ_PROSPECT permission and recognizes aggregate access', () => {
    expect(PENDING_PROSPECTS_PERMISSION).toBe('READ_PROSPECT');
    expect(hasPendingProspectsPermission(['READ_PROSPECT'])).toBe(true);
    expect(hasPendingProspectsPermission(['ALL_FUNCTIONS'])).toBe(true);
    expect(hasPendingProspectsPermission(['ALL_FUNCTIONS_READ'])).toBe(true);
    expect(hasPendingProspectsPermission(['READ_CLIENT'])).toBe(false);
  });
  it('redirects unauthorized direct navigation when RBAC is enabled', () => {
    const previous = environment.productionModeEnableRBAC;
    environment.productionModeEnableRBAC = true;
    const denied = {} as UrlTree;
    try {
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['READ_CLIENT'] }) } },
          { provide: Router, useValue: { createUrlTree: () => denied } }
        ]
      });
      expect(TestBed.runInInjectionContext(() => pendingProspectsGuard({} as never, {} as never))).toBe(denied);
    } finally {
      environment.productionModeEnableRBAC = previous;
    }
  });
});
