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

import { Injectable, inject } from '@angular/core';
import { Observable, catchError, defer, map, of, timeout } from 'rxjs';
import { TasksService } from 'app/tasks/tasks.service';
import { LoansService } from 'app/loans/loans.service';
import { SystemService } from 'app/system/system.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import {
  AuditEvent,
  Queue,
  QueuePage,
  OperationsTask,
  validTaskKey,
  creditTask,
  enrollmentTasks,
  prospectTask,
  validId
} from './operations-task.model';

@Injectable({ providedIn: 'root' })
export class OperationsDataService {
  private readonly tasks = inject(TasksService);
  private readonly system = inject(SystemService);
  private readonly loans = inject(LoansService);
  private readonly auth = inject(AuthenticationService);
  private readonly settings = inject(SettingsService);
  readonly pageSize = 25;

  hasPermission(permission: string): boolean {
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes('ALL_FUNCTIONS_READ') ||
      permissions.includes(permission)
    );
  }
  /** Who and where the data belongs to: server, tenant and user. Changing it invalidates any selection. */
  identity(): string {
    const user = this.auth.getCredentials();
    return JSON.stringify([
      this.settings.serverHost,
      this.settings.tenantIdentifier,
      user?.userId,
      user?.staffId,
      user?.officeId,
      user?.permissions
    ]);
  }
  /** Identity plus the business date used for aging. A date-only change refreshes ages but keeps selection. */
  scope(): string {
    const date = this.settings.businessDate;
    return JSON.stringify([
      date instanceof Date && Number.isFinite(date.getTime()) ? [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
          ] : null,
      this.identity()
    ]);
  }
  load(queue: Queue, pageIndex: number): Observable<QueuePage> {
    const permissions = queue === 'registrations' ? ['READ_PROSPECT'] : queue === 'enrollment' ? [
              'READ_CLIENT',
              'READ_ENROLLMENT_STATUS'
            ] : ['READ_LOAN'];
    const empty: QueuePage = { queue, state: 'denied', tasks: [], total: null, count: 0 };
    if (!permissions.every((permission) => this.hasPermission(permission))) return of(empty);
    const offset = pageIndex * this.pageSize;
    const date = this.settings.businessDate;
    const businessDate = date instanceof Date && Number.isFinite(date.getTime()) ? [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
          ] : null;
    return defer(() =>
      queue === 'registrations'
        ? this.tasks.getPendingProspects({ offset, limit: this.pageSize, orderBy: 'prospectId', sortOrder: 'ASC' })
        : queue === 'enrollment'
          ? this.tasks.getEnrollmentCases({ view: 'enrollment', offset, limit: this.pageSize })
          : this.tasks.getCreditApplications({
              status: queue === 'approval' ? 100 : 200,
              offset,
              limit: this.pageSize,
              orderBy: 'submittedOnDate',
              sortOrder: 'ASC'
            })
    ).pipe(
      timeout(30000),
      map((response: any): QueuePage => {
        const rows = response?.pageItems;
        const total = response?.totalFilteredRecords;
        if (
          !Array.isArray(rows) ||
          rows.length > this.pageSize ||
          !Number.isSafeInteger(total) ||
          total < 0 ||
          (rows.length > 0 && total < offset + rows.length) ||
          (rows.length === 0 && total > offset)
        )
          throw new Error('Invalid queue page');
        const identities = rows.map(
          (row) => row?.[queue === 'registrations' ? 'prospectId' : queue === 'enrollment' ? 'clientId' : 'loanId']
        );
        if (!identities.every(validId) || new Set(identities.map(String)).size !== rows.length)
          throw new Error('Invalid identities');
        const tasks = rows.flatMap((row) => {
          const textFields = queue === 'registrations' ? [
                  'displayName',
                  'externalRef',
                  'registrationStatus',
                  'currentStage'
                ] : [
                  'clientName',
                  'accountNo'
                ];
          if (textFields.some((field) => row[field] != null && typeof row[field] !== 'string'))
            throw new Error('Invalid queue record');
          if (
            queue === 'enrollment' &&
            (!Array.isArray(row.enrollmentStages) ||
              row.enrollmentStages.some((stage: any) => !stage || typeof stage.name !== 'string'))
          )
            throw new Error('Invalid enrollment stages');
          return queue === 'registrations'
            ? prospectTask(row)
            : queue === 'enrollment'
              ? enrollmentTasks(row)
              : creditTask(row, queue, businessDate);
        });
        if (new Set(tasks.map((task) => task.key)).size !== tasks.length) throw new Error('Duplicate task');
        return { queue, state: 'ready', tasks, total, count: rows.length };
      }),
      catchError(() => of({ ...empty, state: 'error' as const }))
    );
  }
  /** Resolve existing qualified loan/client identities without scanning queue pages. */
  lookupTask(key: string): Observable<OperationsTask | null> {
    if (!validTaskKey(key)) return of(null);
    const [
      resource,
      id,
      stage
    ] = key.split(':');
    const date = this.settings.businessDate;
    const businessDate = date instanceof Date && Number.isFinite(date.getTime()) ? [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
          ] : null;
    if (resource === 'loan' && this.hasPermission('READ_LOAN')) {
      return this.loans.getLoanAccountDetails(id).pipe(
        timeout(30000),
        map((row) => {
          if (!row || String(row.id) !== id || !validId(row.id) || [
              row.clientName,
              row.accountNo
            ].some((value) => value != null && typeof value !== 'string')) return null;
          return (
            creditTask(
              { ...row, loanId: row.id, submittedOnDate: row.timeline?.submittedOnDate },
              stage as 'approval' | 'disbursement',
              businessDate
            )[0] ?? null
          );
        }),
        catchError(() => of(null))
      );
    }
    if (
      resource === 'enrollment' &&
      this.hasPermission('READ_CLIENT') &&
      this.hasPermission('READ_ENROLLMENT_STATUS')
    ) {
      return this.tasks.getEnrollmentCases({ view: 'enrollment', clientId: id, offset: 0, limit: this.pageSize }).pipe(
        timeout(30000),
        map((response) => {
          if (!Array.isArray(response?.pageItems) || response.pageItems.length !== 1) return null;
          const row = response.pageItems[0];
          if (
            String(row?.clientId) !== id ||
            !validId(row.clientId) ||
            typeof row.clientName !== 'string' ||
            !Array.isArray(row.enrollmentStages) ||
            row.enrollmentStages.some((stage) => !stage)
          )
            return null;
          return enrollmentTasks(row).find((task) => task.key === key) ?? null;
        }),
        catchError(() => of(null))
      );
    }
    // Prospect search has no exact prospect-ID lookup. Never substitute a name or client ID.
    return of(null);
  }

  /** Loan events only: audit permission alone must not expose unrelated customer/compliance records. */
  audits(resourceId?: string): Observable<AuditEvent[] | null> {
    if (!this.hasPermission('READ_AUDIT') || !this.hasPermission('READ_LOAN')) return of(null);
    const filters = [{ type: 'entityName', value: 'LOAN' }];
    if (resourceId) {
      if (!validId(resourceId)) return of(null);
      filters.push({ type: 'resourceId', value: resourceId });
    }
    return this.system.getAuditTrails(filters, 'madeOnDate', 'DESC', 0, 10).pipe(
      timeout(30000),
      map((response: any) => {
        if (!Array.isArray(response?.pageItems) || response.pageItems.length > 10) throw new Error('Invalid audits');
        return response.pageItems.map((row: any): AuditEvent => {
          if (
            !validId(row?.id) ||
            row.entityName !== 'LOAN' ||
            !validId(row.resourceId) ||
            (resourceId && String(row.resourceId) !== resourceId) ||
            (typeof row.madeOnDate !== 'number' && typeof row.madeOnDate !== 'string') ||
            !Number.isFinite(new Date(row.madeOnDate).getTime()) ||
            [
              'maker',
              'actionName',
              'processingResult'
            ].some((field) => row[field] != null && typeof row[field] !== 'string')
          )
            throw new Error('Invalid audit event');
          return {
            id: row.id,
            madeOnDate: row.madeOnDate,
            maker: row.maker,
            actionName: row.actionName,
            entityName: row.entityName,
            resourceId: row.resourceId,
            processingResult: row.processingResult
          };
        });
      }),
      catchError(() => of(null))
    );
  }
}
