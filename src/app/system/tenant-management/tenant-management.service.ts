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
import { Tenant, TenantTemplate, TenantsPage, TenantsQuery } from './models/tenant.model';
import { tenantManagementErrorKey, tenantManagementErrorMessage } from './tenant-management-error';

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
          message:
            tenantManagementErrorMessage(error) || this.translateService.instant(tenantManagementErrorKey(error.status))
        });
        return throwError(() => error);
      })
    );
  }
}
