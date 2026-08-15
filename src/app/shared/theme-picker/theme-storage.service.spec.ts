/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { SettingsService } from 'app/settings/settings.service';
import { BrandingService, TenantBranding } from './branding.service';
import { ThemeStorageService } from './theme-storage.service';
import { PRIMARY_COLOR_THEMES } from './theme.model';

describe('ThemeStorageService', () => {
  let service: ThemeStorageService;
  let getTenantBranding: jest.Mock;
  let tenantIdentifier: string;

  const green = PRIMARY_COLOR_THEMES.find((theme) => theme.id === 'green');
  const primaryHue = () => document.documentElement.style.getPropertyValue('--brand-primary-500');

  beforeEach(() => {
    // The global setup stubs localStorage with no-op mocks; back them with a
    // real in-memory store so the tenant cache can actually be exercised.
    const store = new Map<string, string>();
    jest.spyOn(localStorage, 'getItem').mockImplementation((key) => store.get(key) ?? null);
    jest.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      store.set(key, String(value));
    });

    document.documentElement.removeAttribute('style');
    tenantIdentifier = 'default';
    getTenantBranding = jest.fn().mockReturnValue(of({ primaryColor: 'green' }));

    TestBed.configureTestingModule({
      providers: [
        ThemeStorageService,
        { provide: BrandingService, useValue: { getTenantBranding } },
        {
          provide: SettingsService,
          useValue: {
            get tenantIdentifier() {
              return tenantIdentifier;
            }
          }
        }
      ]
    });
    service = TestBed.inject(ThemeStorageService);
  });

  it('reads the tenant colour from the branding endpoint', () => {
    service.fetchTenantTheme().subscribe();
    expect(getTenantBranding).toHaveBeenCalled();
    expect(primaryHue()).toBe(green.primary);
  });

  it('applies the same colour regardless of which user is signed in', () => {
    // Nothing in the service depends on the user; two loads yield one brand.
    service.fetchTenantTheme().subscribe();
    const afterFirstUser = primaryHue();
    document.documentElement.removeAttribute('style');
    service.fetchTenantTheme().subscribe();
    expect(primaryHue()).toBe(afterFirstUser);
  });

  it('falls back to blue when the branding endpoint is absent (plugin not installed)', () => {
    getTenantBranding.mockReturnValue(throwError(() => ({ status: 404 })));
    let resolved: string | undefined;
    service.fetchTenantTheme().subscribe((theme) => (resolved = theme.id));
    expect(resolved).toBe('blue');
    expect(primaryHue()).toBe('');
  });

  it('falls back to blue when the user lacks permission', () => {
    getTenantBranding.mockReturnValue(throwError(() => ({ status: 403 })));
    let resolved: string | undefined;
    service.fetchTenantTheme().subscribe((theme) => (resolved = theme.id));
    expect(resolved).toBe('blue');
  });

  it('falls back to blue for an unrecognised colour', () => {
    getTenantBranding.mockReturnValue(of({ primaryColor: 'chartreuse' }));
    let resolved: string | undefined;
    service.fetchTenantTheme().subscribe((theme) => (resolved = theme.id));
    expect(resolved).toBe('blue');
  });

  it('caches per tenant so switching tenants does not leak branding', () => {
    service.fetchTenantTheme().subscribe();
    expect(service.getCachedTheme().id).toBe('green');

    tenantIdentifier = 'other';
    expect(service.getCachedTheme().id).toBe('blue');
  });

  it('falls back to blue when the read is rejected as unauthorised', () => {
    // The endpoint is reachable but refuses the caller: a deployment where the
    // read is authenticated and the request carries no usable credentials.
    // Branding is cosmetic, so this must be silent rather than disruptive.
    getTenantBranding.mockReturnValue(throwError(() => ({ status: 401 })));
    let resolved: string | undefined;
    service.fetchTenantTheme().subscribe((theme) => (resolved = theme.id));
    expect(resolved).toBe('blue');
  });

  it('falls back rather than throwing when the payload is not a string', () => {
    // Nothing guarantees the wire type. Resolution runs before the error
    // handler in the pipe, so a type error inside it has to be caught too.
    // Cast through unknown: this models malformed wire data, and the service's
    // response type stays honest about what the endpoint is meant to return.
    getTenantBranding.mockReturnValue(of({ primaryColor: 42 } as unknown as TenantBranding));
    let resolved: string | undefined;
    let errored = false;
    service.fetchTenantTheme().subscribe({
      next: (theme) => (resolved = theme.id),
      error: () => (errored = true)
    });

    expect(errored).toBe(false);
    expect(resolved).toBe('blue');
  });

  it('does not overwrite a known colour when a later read fails', () => {
    // An outage must not reset the tenant's branding to the default.
    service.fetchTenantTheme().subscribe();
    expect(service.getCachedTheme().id).toBe('green');

    getTenantBranding.mockReturnValue(throwError(() => ({ status: 500 })));
    service.fetchTenantTheme().subscribe();

    expect(service.getCachedTheme().id).toBe('green');
    expect(primaryHue()).toBe(green.primary);
  });

  it('reads a tenant once however many times it is asked to load', () => {
    // Callers signal "the tenant may have changed" rather than "fetch now",
    // and the authentication state replays on subscribe, so repeated loads
    // must not each cost a request.
    service.loadTenantTheme();
    service.loadTenantTheme();
    service.loadTenantTheme();

    expect(getTenantBranding).toHaveBeenCalledTimes(1);
  });

  it('reads again only when the tenant changes', () => {
    service.loadTenantTheme();
    service.loadTenantTheme();
    expect(getTenantBranding).toHaveBeenCalledTimes(1);

    tenantIdentifier = 'other';
    getTenantBranding.mockReturnValue(of({ primaryColor: 'red' }));
    service.loadTenantTheme();
    expect(getTenantBranding).toHaveBeenCalledTimes(2);

    // The tenant is what drove the second read, not the changed stub: each
    // colour landed under its own tenant's key.
    expect(service.getCachedTheme('other').id).toBe('red');
    expect(service.getCachedTheme('default').id).toBe('green');
  });

  it('does not apply a response that arrives after the tenant changed', () => {
    // The tenant selector switches tenant without a reload, so a read can
    // still be in flight when it does. The answer belongs to the tenant that
    // was asked, and painting it now would show the wrong brand.
    const pending = new Subject<TenantBranding>();
    getTenantBranding.mockReturnValue(pending);
    service.fetchTenantTheme().subscribe();

    tenantIdentifier = 'other';
    pending.next({ primaryColor: 'red' });
    pending.complete();

    expect(primaryHue()).toBe('');
    expect(service.getCachedTheme('default').id).toBe('red');
    expect(service.getCachedTheme('other').id).toBe('blue');
  });

  it('reads the new tenant colour after the tenant changes', () => {
    service.fetchTenantTheme().subscribe();
    expect(primaryHue()).toBe(green.primary);

    tenantIdentifier = 'other';
    getTenantBranding.mockReturnValue(of({ primaryColor: 'red' }));
    service.fetchTenantTheme().subscribe();

    const red = PRIMARY_COLOR_THEMES.find((theme) => theme.id === 'red');
    expect(primaryHue()).toBe(red.primary);
    expect(service.getCachedTheme().id).toBe('red');
  });

  it('paints the cached colour immediately, before the request resolves', () => {
    service.fetchTenantTheme().subscribe();

    // A fresh page load with the request still pending.
    document.documentElement.removeAttribute('style');
    getTenantBranding.mockReturnValue(new Subject());
    service.loadTenantTheme();

    expect(primaryHue()).toBe(green.primary);
  });
});
