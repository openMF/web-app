/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { _ as extract } from '@ngx-translate/core';
import {
  Subject,
  catchError,
  distinctUntilChanged,
  map,
  merge,
  of,
  startWith,
  switchMap,
  tap,
  timeout,
  timer
} from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TasksService } from 'app/tasks/tasks.service';
import { hasPendingProspectsPermission } from 'app/tasks/checker-inbox-and-tasks-tabs/pending-prospects/pending-prospects.guard';
import { environment } from 'environments/environment';
import { COMMERCIAL_STAGES, ProspectSnapshot, prospectSnapshot, validResourceId } from './commercial-pipeline.model';

export interface CommercialOffice {
  id: number | string;
  name: string;
}

@Component({
  selector: 'mifosx-commercial-panel',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatPaginator,
    MatProgressSpinner,
    MatTableModule
  ],
  templateUrl: './commercial-panel.component.html',
  styleUrls: ['./commercial-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommercialPanelComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);
  private readonly auth = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly reload = new Subject<void>();

  @Input() offices: CommercialOffice[] = [];
  readonly search = this.formBuilder.nonNullable.control('');
  readonly office = this.formBuilder.nonNullable.control<number | string>('');
  readonly stages = COMMERCIAL_STAGES;
  readonly columns = [
    'prospect',
    ...COMMERCIAL_STAGES.map((stage) => stage.code),
    'reportedStage'
  ];
  readonly metrics = [
    { key: extract('commercialPipeline.inProgress'), css: '' },
    { key: extract('commercialPipeline.onTime'), css: 'yellow' },
    { key: extract('commercialPipeline.atRisk'), css: 'orange' },
    { key: extract('commercialPipeline.overdue'), css: 'red' },
    { key: extract('commercialPipeline.average'), css: '' }
  ];
  rows: ProspectSnapshot[] = [];
  selected: ProspectSnapshot | null = null;
  attention: ProspectSnapshot[] = [];
  loading = false;
  error = false;
  canRead = false;
  pageIndex = 0;
  pageSize = 10;
  total: number | null = null;

  ngOnInit(): void {
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    this.canRead = !environment.productionModeEnableRBAC || hasPendingProspectsPermission(permissions);
    if (!this.canRead) return;

    // Raw input reaches the outer switchMap immediately, cancelling both debounce and stale HTTP.
    const searchChanges = this.search.valueChanges.pipe(
      map((value) => value.trim()),
      distinctUntilChanged(),
      map(() => 'search')
    );
    merge(searchChanges, this.office.valueChanges.pipe(map(() => 'office')), this.reload.pipe(map(() => 'refresh')))
      .pipe(
        startWith('refresh'),
        tap((cause) => {
          if (cause !== 'refresh') this.pageIndex = 0;
          this.loading = true;
          this.error = false;
          this.clearResults();
          this.cdr.markForCheck();
        }),
        switchMap((cause) =>
          timer(cause === 'search' ? 300 : 0).pipe(
            switchMap(() => {
              const officeId = this.office.value || undefined;
              if (
                officeId !== undefined &&
                !this.offices.some((office) => validResourceId(office.id) && String(office.id) === String(officeId))
              ) {
                this.error = true;
                return of(null);
              }
              return this.tasksService
                .getPendingProspects({
                  q: this.search.value.trim(),
                  officeId,
                  offset: this.pageIndex * this.pageSize,
                  limit: this.pageSize,
                  orderBy: 'prospectId',
                  sortOrder: 'ASC'
                })
                .pipe(
                  timeout(30000),
                  catchError(() => {
                    this.error = true;
                    return of(null);
                  })
                );
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        // A malformed success must never become a reassuring empty portfolio or zero metric.
        if (!response || !Array.isArray(response.pageItems)) this.error = true;
        const items = Array.isArray(response?.pageItems) ? response.pageItems : [];
        if (
          items.some(
            (row) => !row || !validResourceId(row.prospectId) || [
                row.displayName,
                row.externalRef,
                row.registrationStatus,
                row.currentStage,
                row.lastCompletedStage,
                row.stoppedAtStage
              ].some((value) => value != null && typeof value !== 'string')
          ) ||
          new Set(items.map((row) => row?.prospectId?.toString())).size !== items.length ||
          items.length > this.pageSize
        ) {
          this.error = true;
        }
        const serverTotal =
          Number.isSafeInteger(response?.totalFilteredRecords) && response.totalFilteredRecords >= 0
            ? response.totalFilteredRecords
            : null;
        if (
          !this.error &&
          serverTotal !== null &&
          items.length === 0 &&
          this.pageIndex > 0 &&
          this.pageIndex * this.pageSize >= serverTotal
        ) {
          // A refresh may remove the last page. Reload the last valid page instead of hiding navigation.
          this.pageIndex = Math.max(0, Math.ceil(serverTotal / this.pageSize) - 1);
          this.refresh();
          return;
        }
        if (items.length === 0 && serverTotal !== null && serverTotal > this.pageIndex * this.pageSize) {
          this.error = true;
        }
        if (!this.error) {
          this.rows = items.map(prospectSnapshot);
          this.total =
            serverTotal !== null && serverTotal >= this.pageIndex * this.pageSize + items.length ? serverTotal : null;
          this.attention = this.rows.filter((row) => !!row.stoppedAtStage);
          this.selected = this.rows[0] ?? null;
        }
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  refresh(): void {
    this.reload.next();
  }

  changePage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.refresh();
  }

  select(row: ProspectSnapshot): void {
    this.selected = row;
  }

  stageLabel(code?: string): string {
    return this.stages.some((stage) => stage.code === code)
      ? `commercialPipeline.stages.${code}`
      : code || extract('commercialPipeline.unknown');
  }

  clientRoute(row: ProspectSnapshot, notes = false): (string | number)[] | null {
    if (!validResourceId(row.prospect.clientId) || !this.hasPermission('READ_CLIENT')) return null;
    if (notes && (!this.hasPermission('READ_CLIENTNOTE') || !this.hasPermission('CREATE_CLIENTNOTE'))) return null;
    return [
      '/clients',
      row.prospect.clientId,
      notes ? 'notes' : 'general'
    ];
  }

  private hasPermission(permission: string): boolean {
    if (!environment.productionModeEnableRBAC) return true;
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes(permission) ||
      (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ'))
    );
  }

  private clearResults(): void {
    this.rows = [];
    this.selected = null;
    this.attention = [];
    this.total = null;
  }
}
