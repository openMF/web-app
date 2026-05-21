/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let authServiceMock: jest.Mocked<Pick<AuthenticationService, 'isAuthenticated' | 'logout'>>;
  let routerMock: jest.Mocked<Pick<Router, 'navigate'>>;

  const buildState = (url: string): RouterStateSnapshot => ({ url }) as RouterStateSnapshot;
  const emptyRoute = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: jest.fn(),
      logout: jest.fn()
    };
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthenticationGuard,
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }]
    });

    guard = TestBed.inject(AuthenticationGuard);
  });

  it('allows the route when user is authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    const result = guard.canActivate(emptyRoute, buildState('/clients'));
    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });

  it('redirects to /login with returnUrl when target is a deep link', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    const result = guard.canActivate(emptyRoute, buildState('/clients/1/general'));
    expect(result).toBe(false);
    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/clients/1/general' },
      replaceUrl: true
    });
  });

  it('redirects to /login WITHOUT returnUrl when target is "/" (default landing)', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    guard.canActivate(emptyRoute, buildState('/'));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], { queryParams: {}, replaceUrl: true });
  });

  it('redirects to /login WITHOUT returnUrl when target is already /login (avoids loops)', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    guard.canActivate(emptyRoute, buildState('/login'));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], { queryParams: {}, replaceUrl: true });
  });

  it('redirects to /login WITHOUT returnUrl when target is /login with stale params', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    guard.canActivate(emptyRoute, buildState('/login?returnUrl=/foo'));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], { queryParams: {}, replaceUrl: true });
  });

  it('preserves complex URLs with query params and fragments', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    const target = '/loans/42?tab=schedule#repayment';
    guard.canActivate(emptyRoute, buildState(target));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: target },
      replaceUrl: true
    });
  });

  it('preserves /login-history as a returnUrl (does not match the exact /login route)', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    guard.canActivate(emptyRoute, buildState('/login-history'));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/login-history' },
      replaceUrl: true
    });
  });
});
