/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { SettingsService } from 'app/settings/settings.service';
import { BrandingService, TenantBranding } from './branding.service';
import { resolvePrimaryColorTheme, Theme } from './theme.model';

/**
 * Applies the tenant's brand colour.
 *
 * The colour lives in the Mifos self-service plugin, which stores it per tenant
 * in its own table, so every user of a tenant sees the same branding on every
 * device. Reads go through `BrandingService`; Fineract itself knows nothing
 * about it.
 *
 * The last known colour is cached per tenant so a reload paints the right brand
 * immediately instead of flashing the default while the request is in flight.
 * Any failure - the plugin not installed, a user without permission, or an
 * outage - falls back to the default colour silently, because branding must
 * never block or interrupt the application.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeStorageService {
  private brandingService = inject(BrandingService);
  private settingsService = inject(SettingsService);

  /** Cache of the last known colour, keyed by tenant. */
  private themeCacheKey = 'mifosXTenantPrimaryColor';

  /**
   * Applies the cached colour immediately, then refreshes it from the server.
   * Called after authentication and on startup.
   */
  loadTenantTheme(): void {
    this.applyTheme(this.getCachedTheme());
    this.fetchTenantTheme().subscribe();
  }

  /**
   * Reads the tenant's configured colour, applies it and caches it.
   *
   * Only a colour the server actually returned is cached: a failed read falls
   * back to the last known colour, so an outage cannot overwrite the tenant's
   * branding with the default.
   * @returns {Observable<Theme>} The applied theme; never errors.
   */
  fetchTenantTheme(): Observable<Theme> {
    return this.brandingService.getTenantBranding().pipe(
      map((branding: TenantBranding) => resolvePrimaryColorTheme(branding?.primaryColor)),
      tap((theme: Theme) => this.cacheTheme(theme)),
      catchError(() => of(this.getCachedTheme())),
      tap((theme: Theme) => this.applyTheme(theme))
    );
  }

  /**
   * Applies a theme without persisting it, so an administrator previewing a
   * colour sees it at once. Persistence is the Theme page's responsibility.
   * @param {Theme} theme
   */
  previewTheme(theme: Theme): void {
    this.applyTheme(theme);
  }

  /**
   * Applies a theme and caches it as the tenant's colour. Used after the Theme
   * page has successfully saved the configuration.
   * @param {Theme} theme
   */
  installTheme(theme: Theme): void {
    this.cacheTheme(theme);
    this.applyTheme(theme);
  }

  /**
   * @returns {Theme} Last known colour for the current tenant, else the default.
   */
  getCachedTheme(): Theme {
    return resolvePrimaryColorTheme(this.readCache()[this.getTenantIdentifier()]);
  }

  /**
   * @returns Tenant the colour belongs to; the cache is keyed by it so
   * switching tenants cannot show the previous tenant's branding.
   */
  private getTenantIdentifier(): string {
    return this.settingsService.tenantIdentifier || 'default';
  }

  /**
   * @returns Cached theme ids keyed by tenant, tolerating corrupt storage.
   */
  private readCache(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(this.themeCacheKey)) ?? {};
    } catch {
      return {};
    }
  }

  /**
   * @param {Theme} theme Theme to remember for the current tenant.
   */
  private cacheTheme(theme: Theme): void {
    try {
      const cache = this.readCache();
      cache[this.getTenantIdentifier()] = theme.id;
      localStorage.setItem(this.themeCacheKey, JSON.stringify(cache));
    } catch {
      // Persistence is best effort: unavailable or full storage must not stop
      // the colour from being applied for this session.
    }
  }

  /**
   * Writes the theme's hues onto the document root. The default theme removes
   * the overrides instead, letting the stylesheet fallbacks apply.
   * @param {Theme} theme
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    if (theme.isDefault) {
      root.style.removeProperty('--brand-primary-100');
      root.style.removeProperty('--brand-primary-500');
      root.style.removeProperty('--brand-primary-700');
    } else {
      root.style.setProperty('--brand-primary-100', theme.light);
      root.style.setProperty('--brand-primary-500', theme.primary);
      root.style.setProperty('--brand-primary-700', theme.dark);
    }
  }
}
