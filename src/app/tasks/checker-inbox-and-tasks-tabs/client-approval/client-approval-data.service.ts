/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { ClientsService } from 'app/clients/clients.service';
import { SearchService } from 'app/search/search.service';
import { SettingsService } from 'app/settings/settings.service';
import { TasksService } from '../../tasks.service';
import { ClientScope, ClientSnapshot, PendingClient, pendingClient } from './client-approval.models';

export const CLIENT_AGGREGATE_LIMIT = 1000;

/** Scope aggregation is explicitly bounded. Large queues always keep server pagination. */
@Injectable({ providedIn: 'root' })
export class ClientApprovalDataService {
  /** Retain locks across queue navigation without sharing client IDs between tenants. */
  private readonly activationLocks = new Set<string>();
  private settings = inject(SettingsService);
  private tasks = inject(TasksService);
  private clients = inject(ClientsService);
  private search = inject(SearchService);

  isActivationLocked(clientId: number): boolean {
    return this.activationLocks.has(this.activationLockKey(clientId));
  }

  lockActivation(clientId: number): void {
    this.activationLocks.add(this.activationLockKey(clientId));
  }

  private activationLockKey(clientId: number): string {
    return JSON.stringify([
      this.settings.tenantIdentifier,
      clientId
    ]);
  }

  snapshot(scope: ClientScope): Observable<ClientSnapshot> {
    return this.tasks.getPendingClients({ ...scope, limit: CLIENT_AGGREGATE_LIMIT, offset: 0 }).pipe(
      map((response) => {
        if (!Array.isArray(response?.pageItems)) throw new Error('Invalid pending-client response');
        const rows: PendingClient[] = response.pageItems;
        const total =
          Number.isSafeInteger(response.totalFilteredRecords) && response.totalFilteredRecords >= rows.length
            ? response.totalFilteredRecords
            : null;
        const complete =
          total !== null &&
          total === rows.length &&
          total <= CLIENT_AGGREGATE_LIMIT &&
          new Set(rows.map((row) => row.id)).size === total &&
          rows.every(pendingClient);
        return { rows, total, complete };
      })
    );
  }

  /** The existing authorized search endpoint supports exact account matches, retaining leading zeros. */
  account(accountNo: string, scope: ClientScope): Observable<ClientSnapshot> {
    return this.search.getSearchResults(accountNo, 'clients', true).pipe(
      switchMap((matches: any[]) => {
        if (!Array.isArray(matches)) return throwError(() => new Error('Invalid account lookup'));
        const ids = [
          ...new Set<number>(
            matches
              .filter(
                (item) =>
                  item.entityType === 'CLIENT' &&
                  item.entityAccountNo === accountNo &&
                  Number.isSafeInteger(item.entityId)
              )
              .map((item) => item.entityId)
          )
        ];
        // Exact account numbers should identify one record; ambiguous responses are never enumerated unboundedly.
        if (ids.length > 1) return throwError(() => new Error('Ambiguous account lookup'));
        return ids.length
          ? this.clients.getClientData(String(ids[0])).pipe(map((row) => [row as PendingClient]))
          : of([]);
      }),
      map((rows) => {
        const filtered = rows.filter(
          (row) =>
            row.accountNo === accountNo &&
            pendingClient(row) &&
            (!scope.officeId || row.officeId === scope.officeId) &&
            (!scope.staffId || row.staffId === scope.staffId)
        );
        return { rows: filtered, total: filtered.length, complete: true };
      })
    );
  }
}
