/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable, catchError, throwError } from 'rxjs';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { AlertService } from 'app/core/alert/alert.service';
import { TenantMasterSessionService } from './tenant-master-session.service';

/** Custom Models */
import {
  CreateTenantPayload,
  DeleteTenantResponse,
  Tenant,
  TenantStatusCommand,
  TenantTemplate,
  TenantsPage,
  TenantsQuery,
  TestConnectionPayload,
  TestConnectionResponse,
  UpdateTenantPayload
} from './models/tenant.model';
import {
  tenantManagementErrorCode,
  tenantManagementErrorKey,
  tenantManagementErrorMessage
} from './tenant-management-error';

/**
 * Tenant management API binding.
 *
 * Every call carries the master credential held by {@link TenantMasterSessionService} and no tenant
 * header, on a client built straight from `HttpBackend` so no interceptor can replace either.
 */
@Injectable({
  providedIn: 'root'
})
export class TenantManagementService {
  private session = inject(TenantMasterSessionService);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);

  private http = new HttpClient(inject(HttpBackend));

  /**
   * Retrieves a page of tenants.
   *
   * `limit` is capped at 200 by the backend, and a missing or non-positive `limit` means that cap
   * rather than the whole table, so the page size is always sent explicitly.
   */
  getTenants(query: TenantsQuery): Observable<TenantsPage> {
    let params = new HttpParams().set('offset', `${query.offset ?? 0}`).set('limit', `${query.limit ?? 10}`);
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    return this.request(this.http.get<TenantsPage>(this.session.baseUrl, { headers: this.session.headers, params }));
  }

  /** Retrieves the selectable time zones and lifecycle statuses. */
  getTemplate(): Observable<TenantTemplate> {
    return this.request(
      this.http.get<TenantTemplate>(`${this.session.baseUrl}/template`, { headers: this.session.headers })
    );
  }

  /** Retrieves one tenant. */
  getTenant(tenantId: number | string): Observable<Tenant> {
    return this.request(
      this.http.get<Tenant>(`${this.session.baseUrl}/${tenantId}`, { headers: this.session.headers })
    );
  }

  /**
   * Registers a tenant, creating and migrating its schema.
   *
   * Synchronous by design: the call returns only once the schema has been created, proved reachable
   * and migrated, which takes the better part of a minute against a real database. Callers must
   * show progress and stop the form being submitted twice.
   */
  createTenant(payload: CreateTenantPayload): Observable<Tenant> {
    return this.request(this.http.post<Tenant>(this.session.baseUrl, payload, { headers: this.session.headers }));
  }

  /** Applies a partial update. */
  updateTenant(tenantId: number | string, payload: UpdateTenantPayload): Observable<Tenant> {
    return this.request(
      this.http.put<Tenant>(`${this.session.baseUrl}/${tenantId}`, payload, { headers: this.session.headers })
    );
  }

  /**
   * Activates, deactivates or suspends a tenant.
   *
   * The body is an empty object rather than nothing: the resource consumes JSON and declares no
   * body parameter, so a request without one is rejected.
   */
  changeStatus(tenantId: number | string, command: TenantStatusCommand): Observable<Tenant> {
    const params = new HttpParams().set('command', command);
    return this.request(
      this.http.post<Tenant>(`${this.session.baseUrl}/${tenantId}`, {}, { headers: this.session.headers, params })
    );
  }

  /**
   * Removes the tenant's registry entry.
   *
   * This never drops a schema and never deletes tenant data, and an active tenant is refused.
   */
  deleteTenant(tenantId: number | string): Observable<DeleteTenantResponse> {
    return this.request(
      this.http.delete<DeleteTenantResponse>(`${this.session.baseUrl}/${tenantId}`, {
        headers: this.session.headers
      })
    );
  }

  /** Probes a database with the supplied details, before anything is committed. */
  testConnection(payload: TestConnectionPayload): Observable<TestConnectionResponse> {
    return this.request(
      this.http.post<TestConnectionResponse>(`${this.session.baseUrl}/test-connection`, payload, {
        headers: this.session.headers
      })
    );
  }

  /**
   * Reports a failure and passes it on.
   *
   * A 401 also ends the master session, so the section falls back to its sign-in card instead of
   * leaving a dead credential in place and failing every subsequent request the same way.
   */
  private request<T>(call: Observable<T>): Observable<T> {
    return call.pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.session.signOut();
        }
        this.alertService.alert({
          type: this.translateService.instant('errors.tenantManagement.type'),
          message: this.messageFor(error)
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * The clearest thing that can be said about a failure.
   *
   * The classification the backend sends is preferred over its own English sentence, so a rejected
   * password reads as a rejected password in the user's language. A code this app has no
   * translation for falls back to the backend's message, and a response carrying neither falls back
   * to a generic line for the status.
   */
  private messageFor(error: HttpErrorResponse): string {
    const code = tenantManagementErrorCode(error);
    if (code) {
      const key = `errors.${code}`;
      const translated = this.translateService.instant(key);
      if (translated !== key) {
        return translated;
      }
    }
    return tenantManagementErrorMessage(error) || this.translateService.instant(tenantManagementErrorKey(error.status));
  }
}
