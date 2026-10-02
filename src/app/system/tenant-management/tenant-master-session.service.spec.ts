/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import { SettingsService } from 'app/settings/settings.service';
import { TenantMasterSessionService } from './tenant-master-session.service';
import { TENANT_MASTER_CREDENTIALS_KEY, TENANT_MASTER_USERNAME_KEY } from './models/tenant.model';

/**
 * The shared Jest setup replaces storage with call spies that keep nothing, so these tests install
 * a real in-memory one: what matters here is that the credential is kept only when the server
 * accepted it, which a stub that stores nothing cannot show.
 */
function installInMemorySessionStorage(): void {
  const entries = new Map<string, string>();
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => (entries.has(key) ? entries.get(key) : null),
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
      clear: () => entries.clear(),
      key: (index: number) => [...entries.keys()][index] ?? null,
      get length() {
        return entries.size;
      }
    }
  });
}

describe('TenantMasterSessionService', () => {
  let service: TenantMasterSessionService;
  let httpMock: HttpTestingController;

  const baseUrl = 'https://fineract.example.org/fineract-provider/api/v1/admin/tenants';

  beforeEach(() => {
    installInMemorySessionStorage();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SettingsService,
          useValue: { baseServerUrl: 'https://fineract.example.org/fineract-provider/api' }
        }
      ]
    });
    service = TestBed.inject(TenantMasterSessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('starts signed out when the tab holds no credential', () => {
    expect(service.isSignedIn()).toBe(false);
    expect(service.username()).toBeNull();
  });

  it('sends Basic credentials and no tenant header when verifying a sign-in', () => {
    service.signIn('master', 'a long master password').subscribe();

    const request = httpMock.expectOne(`${baseUrl}/template`);
    expect(request.request.headers.get('Authorization')).toBe(`Basic ${btoa('master:a long master password')}`);
    // This API is not addressed to a tenant; sending one would be meaningless here.
    expect(request.request.headers.has('Fineract-Platform-TenantId')).toBe(false);
    request.flush({ timezones: [], statuses: [] });
  });

  it('encodes the credential as UTF-8, so a non-Latin-1 password does not throw', () => {
    service.signIn('maître', 'pässwörd-достаточно-длинный').subscribe();

    const request = httpMock.expectOne(`${baseUrl}/template`);
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(request.request.headers.get('Authorization').replace('Basic ', '')), (character: string) =>
        character.charCodeAt(0)
      )
    );
    expect(decoded).toBe('maître:pässwörd-достаточно-длинный');
    request.flush({ timezones: [], statuses: [] });
  });

  it('keeps the credential only once the server has accepted it', () => {
    service.signIn('master', 'a long master password').subscribe();
    httpMock.expectOne(`${baseUrl}/template`).flush({ timezones: [], statuses: [] });

    expect(service.isSignedIn()).toBe(true);
    expect(service.username()).toBe('master');
    expect(sessionStorage.getItem(TENANT_MASTER_CREDENTIALS_KEY)).toBe(btoa('master:a long master password'));
    expect(sessionStorage.getItem(TENANT_MASTER_USERNAME_KEY)).toBe('master');
  });

  it('keeps nothing when the credential is rejected', () => {
    service.signIn('master', 'wrong').subscribe({ error: () => undefined });
    httpMock.expectOne(`${baseUrl}/template`).flush('', { status: 401, statusText: 'Unauthorized' });

    expect(service.isSignedIn()).toBe(false);
    expect(sessionStorage.getItem(TENANT_MASTER_CREDENTIALS_KEY)).toBeNull();
  });

  it('drops the credential on sign out', () => {
    service.signIn('master', 'a long master password').subscribe();
    httpMock.expectOne(`${baseUrl}/template`).flush({ timezones: [], statuses: [] });

    service.signOut();

    expect(service.isSignedIn()).toBe(false);
    expect(service.username()).toBeNull();
    expect(sessionStorage.getItem(TENANT_MASTER_CREDENTIALS_KEY)).toBeNull();
    expect(sessionStorage.getItem(TENANT_MASTER_USERNAME_KEY)).toBeNull();
  });
});
