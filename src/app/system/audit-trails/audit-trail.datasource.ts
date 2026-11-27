/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SystemService } from '../system.service';
import { AuditEvent, auditPage } from './audit-presentation';

/** One cancellable page request; totals always describe the server population, never a local subset. */
export class AuditTrailsDataSource implements DataSource<AuditEvent> {
  private rows = new BehaviorSubject<AuditEvent[]>([]);
  private records = new BehaviorSubject(0);
  private loading = new BehaviorSubject(false);
  private error = new BehaviorSubject(false);
  private request?: Subscription;
  readonly rows$ = this.rows.asObservable();
  readonly records$ = this.records.asObservable();
  readonly loading$ = this.loading.asObservable();
  readonly error$ = this.error.asObservable();

  constructor(
    private systemService: SystemService,
    private authorized: () => boolean = () => true
  ) {}

  getAuditTrails(
    filters: any,
    orderBy = 'id',
    sortOrder = 'desc',
    pageIndex = 0,
    limit = 25,
    identity?: { entityName: string; resourceId: string }
  ): void {
    this.clear();
    if (!this.authorized()) return;
    this.loading.next(true);
    this.request = this.systemService.getAuditTrails(filters, orderBy, sortOrder, pageIndex * limit, limit).subscribe({
      next: (response) => {
        if (!this.authorized()) {
          this.clear();
          return;
        }
        try {
          const page = auditPage(response, limit);
          this.records.next(page.total);
          this.rows.next(
            identity
              ? page.events.filter(
                  (event) => event.entityName === identity.entityName && event.resourceId === identity.resourceId
                )
              : page.events
          );
          this.loading.next(false);
        } catch {
          this.fail();
        }
      },
      error: () => this.fail()
    });
  }
  private fail(): void {
    this.rows.next([]);
    this.records.next(0);
    this.loading.next(false);
    this.error.next(true);
  }
  clear(): void {
    this.request?.unsubscribe();
    this.rows.next([]);
    this.records.next(0);
    this.loading.next(false);
    this.error.next(false);
  }
  connect(_viewer?: CollectionViewer) {
    return this.rows$;
  }
  disconnect(_viewer?: CollectionViewer): void {
    this.clear();
    this.rows.complete();
    this.records.complete();
    this.loading.complete();
    this.error.complete();
  }
}
