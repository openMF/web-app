/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';

/** rxjs Imports */
import { BehaviorSubject, Observable, catchError, finalize, of } from 'rxjs';

/** Custom Services */
import { TenantManagementService } from './tenant-management.service';

/** Custom Models */
import { Tenant, TenantsPage } from './models/tenant.model';

/**
 * Tenants data source implementing server side search, filtering and pagination.
 *
 * The API pages with `offset` and `limit` and offers no sort parameter, so the table is not
 * sortable — ordering is the registry's own, newest entries last.
 */
export class TenantsDataSource implements DataSource<Tenant> {
  /** Behavior subject to represent the loaded page of tenants. */
  private tenantsSubject = new BehaviorSubject<Tenant[]>([]);
  /** Records subject to represent the total number of filtered tenants. */
  private recordsSubject = new BehaviorSubject<number>(0);
  /** Loading subject, true while a page is in flight. */
  private loadingSubject = new BehaviorSubject<boolean>(false);

  /** Total number of filtered tenants, for the paginator's length. */
  public records$ = this.recordsSubject.asObservable();
  /** The loaded page, for callers that need the rows themselves. */
  public tenants$ = this.tenantsSubject.asObservable();
  /** Whether a page is currently being loaded. */
  public loading$ = this.loadingSubject.asObservable();

  /**
   * The total number of filtered tenants at the last load.
   *
   * Read synchronously right after a page arrives, so a caller can tell a complete list from the
   * first page of a longer one without threading a second observable through the table.
   */
  get totalRecords(): number {
    return this.recordsSubject.value;
  }

  /**
   * @param {TenantManagementService} tenantManagementService Tenant Management Service.
   */
  constructor(private tenantManagementService: TenantManagementService) {}

  /**
   * Loads a page of tenants and emits it.
   * @param {string} search Term matched against identifier and name.
   * @param {string} status Status to restrict to, or an empty string for all.
   * @param {number} pageIndex Page number.
   * @param {number} limit Number of entries within the page.
   */
  getTenants(search: string = '', status: string = '', pageIndex: number = 0, limit: number = 10): void {
    this.loadingSubject.next(true);
    this.tenantsSubject.next([]);
    this.tenantManagementService
      .getTenants({ search, status, offset: pageIndex * limit, limit })
      .pipe(
        // The service has already reported the failure; the table simply stays empty.
        catchError(() => of({ pageItems: [], totalFilteredRecords: 0 } as TenantsPage)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((tenants: TenantsPage) => {
        this.recordsSubject.next(tenants.totalFilteredRecords);
        this.tenantsSubject.next(tenants.pageItems);
      });
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  connect(collectionViewer: CollectionViewer): Observable<Tenant[]> {
    return this.tenantsSubject.asObservable();
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  disconnect(collectionViewer: CollectionViewer): void {
    this.tenantsSubject.complete();
    this.recordsSubject.complete();
    this.loadingSubject.complete();
  }
}
