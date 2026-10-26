/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';

/** rxjs Imports */
import { Observable, tap } from 'rxjs';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

/** Custom Models */
import { TENANT_MASTER_CREDENTIALS_KEY, TENANT_MASTER_USERNAME_KEY, TenantTemplate } from './models/tenant.model';

/**
 * Path of the tenant management API, below the server's API provider path.
 *
 * `/v1/admin/tenants` rather than `/v1/tenants`, because core Fineract already serves
 * `/v1/tenants/{tenantId}/oidc-config`.
 */
export const TENANT_MANAGEMENT_API_PATH = '/v1/admin/tenants';

/**
 * Builds an HTTP Basic token, encoding the credential as UTF-8 first.
 *
 * `btoa` only accepts Latin-1, so a password with any character outside it would throw. Spring
 * Security decodes the Basic header as UTF-8, so this is also what the backend expects.
 */
function basicToken(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let binary = '';
  bytes.forEach((byte: number) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

/**
 * Holds the master credential the tenant management API is called with.
 *
 * Tenant administration runs in a master context above every tenant: the plugin authenticates
 * against master users in the tenant store, not against any tenant's users, so the web-app session
 * cannot be reused here — a tenant's own user is refused with 401 however privileged it is. This
 * section therefore signs in separately, and the credential it obtains lives only in this tab.
 */
@Injectable({
  providedIn: 'root'
})
export class TenantMasterSessionService {
  private settingsService = inject(SettingsService);

  /**
   * A client with no interceptors at all.
   *
   * `AuthenticationInterceptor` ends with `request.clone({ setHeaders })`, which would overwrite the
   * master `Authorization` header with the tenant session's and attach a tenant header this API
   * does not want. It sits on the DI interceptor chain, so `HttpService`'s opt-outs do not reach
   * it. Building the client straight from `HttpBackend` is how `RemittancesService` and the
   * translation loader already talk to differently-authenticated endpoints.
   */
  private http = new HttpClient(inject(HttpBackend));

  private readonly credentials = signal<string | null>(sessionStorage.getItem(TENANT_MASTER_CREDENTIALS_KEY) ?? null);
  private readonly masterUsername = signal<string | null>(sessionStorage.getItem(TENANT_MASTER_USERNAME_KEY) ?? null);

  /** Whether this tab holds a master credential. */
  readonly isSignedIn = computed(() => !!this.credentials());

  /** The signed-in master user, for display. */
  readonly username = this.masterUsername.asReadonly();

  /** Absolute base URL of the tenant management API on the currently selected server. */
  get baseUrl(): string {
    return this.settingsService.baseServerUrl + TENANT_MANAGEMENT_API_PATH;
  }

  /**
   * Headers for a tenant management request: Basic master credentials, and deliberately no
   * `Fineract-Platform-TenantId` — this API is not addressed to a tenant.
   */
  get headers(): HttpHeaders {
    return this.headersFor(this.credentials());
  }

  /**
   * Verifies a master credential and, only if the server accepts it, keeps it for this tab.
   *
   * The template endpoint is the cheapest authenticated read, so a wrong password fails here rather
   * than on the first thing the user tries to do. Errors are passed through untouched: the sign-in
   * card reports them itself instead of raising the global session-expired alert.
   */
  signIn(username: string, password: string): Observable<TenantTemplate> {
    const token = basicToken(username, password);
    return this.http
      .get<TenantTemplate>(`${this.baseUrl}/template`, { headers: this.headersFor(token) })
      .pipe(tap(() => this.store(username, token)));
  }

  /** Drops the master credential from this tab. */
  signOut(): void {
    sessionStorage.removeItem(TENANT_MASTER_CREDENTIALS_KEY);
    sessionStorage.removeItem(TENANT_MASTER_USERNAME_KEY);
    this.credentials.set(null);
    this.masterUsername.set(null);
  }

  private store(username: string, token: string): void {
    sessionStorage.setItem(TENANT_MASTER_CREDENTIALS_KEY, token);
    sessionStorage.setItem(TENANT_MASTER_USERNAME_KEY, username);
    this.credentials.set(token);
    this.masterUsername.set(username);
  }

  private headersFor(token: string | null): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Basic ${token ?? ''}`
    });
  }
}
