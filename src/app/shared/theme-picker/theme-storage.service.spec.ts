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
import { BrandingService } from './branding.service';
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
    let resolved: string;
    service.fetchTenantTheme().subscribe((theme) => (resolved = theme.id));
    expect(resolved).toBe('blue');
    expect(primaryHue()).toBe('');
  });

  it('falls back to blue when the user lacks permission', () => {
    getTenantBranding.mockReturnValue(throwError(() => ({ status: 403 })));
    let resolved: string;
    service.fetchTenantTheme().subscribe((theme) => (resolved = theme.id));
    expect(resolved).toBe('blue');
  });

  it('falls back to blue for an unrecognised colour', () => {
    getTenantBranding.mockReturnValue(of({ primaryColor: 'chartreuse' }));
    let resolved: string;
    service.fetchTenantTheme().subscribe((theme) => (resolved = theme.id));
    expect(resolved).toBe('blue');
  });

  it('caches per tenant so switching tenants does not leak branding', () => {
    service.fetchTenantTheme().subscribe();
    expect(service.getCachedTheme().id).toBe('green');

    tenantIdentifier = 'other';
    expect(service.getCachedTheme().id).toBe('blue');
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
