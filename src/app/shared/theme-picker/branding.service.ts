/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

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

  /**
   * @returns {Observable<TenantBranding>} Branding of the tenant the user is signed in to.
   */
  getTenantBranding(): Observable<TenantBranding> {
    return this.http.get<TenantBranding>(BRANDING_API_PATH);
  }

  /**
   * @param {string} primaryColor Identifier of the colour to apply tenant wide.
   * @returns {Observable<TenantBranding>} Branding as stored.
   */
  updateTenantBranding(primaryColor: string): Observable<TenantBranding> {
    return this.http.put<TenantBranding>(BRANDING_API_PATH, { primaryColor });
  }
}
