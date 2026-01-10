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
import { Observable, BehaviorSubject } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Audit Trails custom data source to implement server side filtering, pagination and sorting.
 */
export class AuditTrailsDataSource implements DataSource<any> {
  /** Audit Trails behavior subject to represent loaded audit trails page. */
  private auditTrailsSubject = new BehaviorSubject<any[]>([]);
  /** Records subject to represent total number of filtered audit trail records. */
  private recordsSubject = new BehaviorSubject<number>(0);

  /** Records observable which can be subscribed to get the value of total number of filtered audit trail records. */
  public records$ = this.recordsSubject.asObservable();

  /**
   * @param {SystemService} systemService System Service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Gets audit trails on the basis of provided parameters and emits the value.
   * @param {any} filterBy Properties by which entries should be filtered.
   * @param {string} orderBy Property by which entries should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} pageIndex Page number.
   * @param {number} limit Number of entries within the page.
   */
  getAuditTrails(
    filterBy: any,
    orderBy: string = '',
    sortOrder: string = '',
    pageIndex: number = 0,
    limit: number = 10
  ) {
    this.auditTrailsSubject.next([]);
    this.systemService
      .getAuditTrails(filterBy, orderBy, sortOrder, pageIndex * limit, limit)
      .subscribe((auditTrails: any) => {
        this.recordsSubject.next(auditTrails.totalFilteredRecords);
        this.auditTrailsSubject.next(auditTrails.pageItems);
      });
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.auditTrailsSubject.asObservable();
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  disconnect(collectionViewer: CollectionViewer): void {
    this.auditTrailsSubject.complete();
    this.recordsSubject.complete();
  }
}
