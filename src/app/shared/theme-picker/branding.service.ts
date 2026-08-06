/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

/** Custom Models */
import { BRANDING_API_PATH } from './theme.model';

/** Branding configured for the current tenant. */
export interface TenantBranding {
  primaryColor: string;
}

/**
 * Reads and updates the tenant's branding.
 *
 * Backed by the Mifos self-service plugin, which owns the `/branding` endpoint and the table behind
 * it. The endpoint is therefore absent on deployments without that plugin, which callers must treat
 * as "no branding configured" rather than an error.
 */
@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  private http = inject(HttpClient);
  private httpBackend = inject(HttpBackend);
  private settingsService = inject(SettingsService);

  /**
   * Reads without credentials, bypassing the interceptor chain.
   *
   * The endpoint is public, and is served by the plugin's own security chain, which authenticates
   * against the self-service user store. A platform user does not exist there, so presenting the
   * credentials `AuthenticationInterceptor` attaches to every other request fails authentication
   * before the endpoint's public rule is ever reached - the request has to carry none.
   *
   * Bypassing the chain also means supplying what those interceptors would have: the tenant, which
   * is the only thing identifying whose branding to return, and the platform base URL.
   * @returns {Observable<TenantBranding>} Branding of the current tenant.
   */
  getTenantBranding(): Observable<TenantBranding> {
    const anonymousHttp = new HttpClient(this.httpBackend);
    return anonymousHttp.get<TenantBranding>(`${this.settingsService.serverUrl}${BRANDING_API_PATH}`, {
      headers: new HttpHeaders({ 'Fineract-Platform-TenantId': this.settingsService.tenantIdentifier || 'default' })
    });
  }

  /**
   * @param {string} primaryColor Identifier of the colour to apply tenant wide.
   * @returns {Observable<TenantBranding>} Branding as stored.
   */
  updateTenantBranding(primaryColor: string): Observable<TenantBranding> {
    return this.http.put<TenantBranding>(BRANDING_API_PATH, { primaryColor });
  }
}
