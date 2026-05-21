/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { AuthenticationService } from './authentication.service';
import { AuthenticationInterceptor } from './authentication.interceptor';
import { AlertService } from '../alert/alert.service';
import { AuthMode } from './oauth.config';
import { environment } from '../../../environments/environment';

/**
 * Cross-cutting tests for the storage / cross-tab behaviour added by
 * WEB-956. These exercise the code paths that differ per `AuthMode`
 * (Basic, OAuth2, OIDC, +2FA) without requiring a live backend.
 *
 * The cross-tab logout listener and the `initializeOAuthService()`
 * storage choice are the parts of the fix that only fire in non-Basic
 * modes; testing them here lets us prove correctness for OAuth2/OIDC
 * without needing a Keycloak / Zitadel / mock-oauth2-server.
 */
describe('AuthenticationService — cross-mode storage & cross-tab logout', () => {
  let oauthService: jest.Mocked<
    Pick<
      OAuthService,
      | 'configure'
      | 'setStorage'
      | 'logOut'
      | 'loadDiscoveryDocumentAndTryLogin'
      | 'setupAutomaticSilentRefresh'
      | 'events'
      | 'hasValidAccessToken'
      | 'getAccessToken'
      | 'getRefreshToken'
      | 'refreshToken'
    >
  >;
  let interceptor: jest.Mocked<
    Pick<
      AuthenticationInterceptor,
      'setAuthorizationToken' | 'removeAuthorization' | 'removeTwoFactorAuthorization' | 'setTwoFactorAccessToken'
    >
  >;
  let alertService: jest.Mocked<Pick<AlertService, 'alert' | 'alertEvent'>>;
  let translate: jest.Mocked<Pick<TranslateService, 'instant'>>;
  let http: jest.Mocked<Pick<HttpClient, 'post' | 'put'>>;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    // Reset auth mode flags before each test so they don't leak between cases.
    (environment.OIDC as any).oidcServerEnabled = false;
    (environment.oauth as any).enabled = false;

    oauthService = {
      configure: jest.fn(),
      setStorage: jest.fn(),
      logOut: jest.fn(),
      loadDiscoveryDocumentAndTryLogin: jest.fn().mockResolvedValue(true),
      setupAutomaticSilentRefresh: jest.fn(),
      events: new BehaviorSubject({ type: 'idle' }) as any,
      hasValidAccessToken: jest.fn().mockReturnValue(false),
      getAccessToken: jest.fn().mockReturnValue(''),
      getRefreshToken: jest.fn().mockReturnValue(''),
      refreshToken: jest.fn().mockResolvedValue({})
    } as any;

    interceptor = {
      setAuthorizationToken: jest.fn(),
      removeAuthorization: jest.fn(),
      removeTwoFactorAuthorization: jest.fn(),
      setTwoFactorAccessToken: jest.fn()
    } as any;

    alertService = {
      alert: jest.fn(),
      alertEvent: new BehaviorSubject({} as any)
    } as any;

    translate = {
      instant: jest.fn((k: string) => k)
    } as any;

    http = {
      post: jest.fn(),
      put: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: OAuthService, useValue: oauthService },
        { provide: AuthenticationInterceptor, useValue: interceptor },
        { provide: AlertService, useValue: alertService },
        { provide: TranslateService, useValue: translate },
        { provide: HttpClient, useValue: http }]
    });
  });

  describe('initializeOAuthService — storage choice', () => {
    it('uses localStorage as OAuth tokens store (independent of enableRememberMe)', async () => {
      // Force non-Basic mode so initializeOAuthService runs in the constructor.
      (environment.OIDC as any).oidcServerEnabled = true;
      // Instantiate the service (TestBed.inject does this lazily).
      const svc = TestBed.inject(AuthenticationService);
      // setStorage should be called once with localStorage in init.
      const calls = oauthService.setStorage.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(1);
      expect(calls[0][0]).toBe(localStorage);
    });
  });

  describe('listenForCrossTabAuthEvents — Basic mode logout', () => {
    it('clears credentials + 2FA token + headers when a logout broadcast arrives (Basic)', () => {
      // Basic mode is the default — no environment overrides needed.
      const svc = TestBed.inject(AuthenticationService);
      // Seed both stores to simulate a logged-in tab with 2FA.
      localStorage.setItem('mifosXCredentials', JSON.stringify({ username: 'mifos', rememberMe: true }));
      sessionStorage.setItem('mifosXCredentials', JSON.stringify({ username: 'mifos', rememberMe: false }));
      localStorage.setItem('mifosXTwoFactorAuthenticationToken', JSON.stringify({ token: 'abc' }));
      sessionStorage.setItem('mifosXTwoFactorAuthenticationToken', JSON.stringify({ token: 'abc' }));
      // Mark this tab as logged-in so the listener acts on the broadcast.
      (svc as any).userLoggedIn$.next(true);
      (svc as any).handleCrossTabAuthEvent({ data: { type: 'logout' } });

      expect(interceptor.removeAuthorization).toHaveBeenCalledTimes(1);
      expect(interceptor.removeTwoFactorAuthorization).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('mifosXCredentials')).toBeFalsy();
      expect(sessionStorage.getItem('mifosXCredentials')).toBeFalsy();
      expect(localStorage.getItem('mifosXTwoFactorAuthenticationToken')).toBeFalsy();
      expect(sessionStorage.getItem('mifosXTwoFactorAuthenticationToken')).toBeFalsy();
      // Basic mode → MUST NOT call oauthService.logOut (no OAuth tokens to clear).
      expect(oauthService.logOut).not.toHaveBeenCalled();
    });
  });

  describe('listenForCrossTabAuthEvents — OAuth2 / OIDC mode logout', () => {
    it('additionally clears OAuth library tokens via oauthService.logOut(true) (OIDC)', () => {
      (environment.OIDC as any).oidcServerEnabled = true;
      const svc = TestBed.inject(AuthenticationService);
      (svc as any).userLoggedIn$.next(true);

      (svc as any).handleCrossTabAuthEvent({ data: { type: 'logout' } });

      // Critical: passive tab must call logOut(true) so library-managed tokens
      // (access_token / id_token / refresh_token) don't linger.
      expect(oauthService.logOut).toHaveBeenCalledWith(true);
    });

    it('additionally clears OAuth library tokens via oauthService.logOut(true) (OAuth2)', () => {
      (environment.oauth as any).enabled = true;
      const svc = TestBed.inject(AuthenticationService);
      (svc as any).userLoggedIn$.next(true);

      (svc as any).handleCrossTabAuthEvent({ data: { type: 'logout' } });

      expect(oauthService.logOut).toHaveBeenCalledWith(true);
    });
  });

  describe('listenForCrossTabAuthEvents — login broadcast', () => {
    it('does nothing when current tab is already logged-in (avoids re-broadcast loops)', () => {
      // Basic mode is the default — no environment overrides needed.
      const svc = TestBed.inject(AuthenticationService);
      (svc as any).userLoggedIn$.next(true);

      (svc as any).handleCrossTabAuthEvent({ data: { type: 'login' } });

      // No restoreSession side-effects when we're already logged-in.
      expect(interceptor.setAuthorizationToken).not.toHaveBeenCalled();
    });
  });

  describe('storage envelope', () => {
    it('default storage field is localStorage (no per-tab fragmentation)', () => {
      // Basic mode is the default — no environment overrides needed.
      const svc = TestBed.inject(AuthenticationService);
      // Direct private field access via `any` — explicit cross-mode invariant.
      expect((svc as any).storage).toBe(localStorage);
    });
  });
});
