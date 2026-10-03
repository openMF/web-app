/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import { AuthenticationInterceptor } from './authentication.interceptor';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';

describe('AuthenticationInterceptor', () => {
  let interceptor: AuthenticationInterceptor;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  const mockSettingsService: { tenantIdentifier: string | null } = {
    tenantIdentifier: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthenticationInterceptor,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: HTTP_INTERCEPTORS, useExisting: AuthenticationInterceptor, multi: true }]
    });
    interceptor = TestBed.inject(AuthenticationInterceptor);
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
    interceptor.removeAuthorizationTenant();
    interceptor.removeTwoFactorAuthorization();
    mockSettingsService.tenantIdentifier = null;
  });

  describe('intercept', () => {
    it('should set Fineract-Platform-TenantId on internal requests', async () => {
      const resultPromise = firstValueFrom(http.get('/clients'));

      const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
      expect(req.request.headers.get('Fineract-Platform-TenantId')).toBe(environment.fineractPlatformTenantId);

      req.flush([]);
      await resultPromise;
    });

    it('should use custom tenant from SettingsService when set', async () => {
      mockSettingsService.tenantIdentifier = 'custom-tenant';
      const resultPromise = firstValueFrom(http.get('/clients'));

      const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
      expect(req.request.headers.get('Fineract-Platform-TenantId')).toBe('custom-tenant');

      req.flush([]);
      await resultPromise;
    });

    it('should pass https external URLs through without Fineract headers', async () => {
      const resultPromise = firstValueFrom(http.get('https://api.external.com/data'));

      const req = httpMock.expectOne((r) => r.url === 'https://api.external.com/data' && r.method === 'GET');
      expect(req.request.headers.has('Fineract-Platform-TenantId')).toBe(false);

      req.flush({});
      await resultPromise;
    });

    it('should pass http external URLs through without Fineract headers', async () => {
      const resultPromise = firstValueFrom(http.get('http://api.external.com/data'));

      const req = httpMock.expectOne((r) => r.url === 'http://api.external.com/data' && r.method === 'GET');
      expect(req.request.headers.has('Fineract-Platform-TenantId')).toBe(false);

      req.flush({});
      await resultPromise;
    });

    it('should include Authorization header on requests when previously set', async () => {
      interceptor.setAuthorizationToken('dGVzdDp0ZXN0');
      const resultPromise = firstValueFrom(http.get('/clients'));

      const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
      expect(req.request.headers.get('Authorization')).toBe('Basic dGVzdDp0ZXN0');

      req.flush([]);
      await resultPromise;
    });
  });

  describe('setAuthorizationToken', () => {
    it('should set Basic prefix when OAuth is disabled', async () => {
      const originalOAuth = environment.oauth.enabled;
      try {
        environment.oauth.enabled = false;
        interceptor.setAuthorizationToken('dGVzdDp0ZXN0');

        const resultPromise = firstValueFrom(http.get('/clients'));
        const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
        expect(req.request.headers.get('Authorization')).toBe('Basic dGVzdDp0ZXN0');

        req.flush([]);
        await resultPromise;
      } finally {
        environment.oauth.enabled = originalOAuth;
      }
    });

    it('should set Bearer prefix when OAuth is enabled', async () => {
      const originalOAuth = environment.oauth.enabled;
      try {
        environment.oauth.enabled = true;
        interceptor.setAuthorizationToken('my-oauth-token');

        const resultPromise = firstValueFrom(http.get('/clients'));
        const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
        expect(req.request.headers.get('Authorization')).toBe('Bearer my-oauth-token');

        req.flush([]);
        await resultPromise;
      } finally {
        environment.oauth.enabled = originalOAuth;
      }
    });
  });

  describe('Two-Factor Authentication', () => {
    it('should set Fineract-Platform-TFA-Token header', async () => {
      interceptor.setTwoFactorAccessToken('tfa-token-123');
      const resultPromise = firstValueFrom(http.get('/clients'));

      const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
      expect(req.request.headers.get('Fineract-Platform-TFA-Token')).toBe('tfa-token-123');

      req.flush([]);
      await resultPromise;
    });

    it('should remove TFA header after removeTwoFactorAuthorization', async () => {
      interceptor.setTwoFactorAccessToken('tfa-token-123');
      interceptor.removeTwoFactorAuthorization();

      const resultPromise = firstValueFrom(http.get('/clients'));
      const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
      expect(req.request.headers.has('Fineract-Platform-TFA-Token')).toBe(false);

      req.flush([]);
      await resultPromise;
    });
  });

  describe('removeAuthorization / removeAuthorizationTenant', () => {
    it('should remove only Authorization header and keep tenant', async () => {
      mockSettingsService.tenantIdentifier = environment.fineractPlatformTenantId;
      interceptor.setAuthorizationToken('dGVzdDp0ZXN0');
      interceptor.removeAuthorization();

      const resultPromise = firstValueFrom(http.get('/clients'));
      const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
      expect(req.request.headers.has('Authorization')).toBe(false);
      expect(req.request.headers.has('Fineract-Platform-TenantId')).toBe(true);

      req.flush([]);
      await resultPromise;
    });

    it('should remove both Authorization and tenant headers', async () => {
      interceptor.setAuthorizationToken('dGVzdDp0ZXN0');
      interceptor.removeAuthorizationTenant();

      const resultPromise = firstValueFrom(http.get('/clients'));
      const req = httpMock.expectOne((r) => r.url === '/clients' && r.method === 'GET');
      expect(req.request.headers.has('Authorization')).toBe(false);
      expect(req.request.headers.has('Fineract-Platform-TenantId')).toBe(false);

      req.flush([]);
      await resultPromise;
    });
  });
});
