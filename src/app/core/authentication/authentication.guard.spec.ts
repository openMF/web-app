/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationGuard', () => {
  function createGuard(authenticated: boolean): {
    guard: AuthenticationGuard;
    router: { navigate: jest.Mock };
    authenticationService: { isAuthenticated: jest.Mock; logout: jest.Mock };
  } {
    const router = { navigate: jest.fn() };
    const authenticationService = {
      isAuthenticated: jest.fn().mockReturnValue(authenticated),
      logout: jest.fn().mockReturnValue(of(true))
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthenticationService, useValue: authenticationService }
      ]
    });

    return { guard: TestBed.runInInjectionContext(() => new AuthenticationGuard()), router, authenticationService };
  }

  function stateFor(url: string): RouterStateSnapshot {
    return { url } as RouterStateSnapshot;
  }

  const route = {} as ActivatedRouteSnapshot;

  it('should let an authenticated user through without redirecting', () => {
    const { guard, router } = createGuard(true);

    expect(guard.canActivate(route, stateFor('/clients'))).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should block an unauthenticated user and redirect to login', () => {
    const { guard, router } = createGuard(false);

    expect(guard.canActivate(route, stateFor('/clients'))).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], expect.objectContaining({ replaceUrl: true }));
  });

  it('should preserve the requested route as the return URL', () => {
    const { guard, router, authenticationService } = createGuard(false);

    guard.canActivate(route, stateFor('/clients/1/general?tab=savings'));

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      replaceUrl: true,
      queryParams: { returnUrl: '/clients/1/general?tab=savings' }
    });
    expect(authenticationService.logout).toHaveBeenCalledWith('/clients/1/general?tab=savings');
  });
});
