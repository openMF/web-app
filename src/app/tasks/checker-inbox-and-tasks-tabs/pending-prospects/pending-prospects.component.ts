/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Subscription, timeout } from 'rxjs';
import { _ as extract } from '@ngx-translate/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

/** Angular Material Imports */
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import {
  PendingProspect,
  PendingProspectsResponse,
  PendingProspectsSearchParams,
  TasksService
} from '../../tasks.service';

import { resolveProspectProgress } from './pending-prospects-progress';

interface RegistrationStatusOption {
  value: string;
  labelKey: string;
}

// Exact values from Savings Plugin ProspectRegistrationStatus; no catalog endpoint is exposed.
const REGISTRATION_STATUS_OPTIONS: RegistrationStatusOption[] = [
  { value: 'PENDING', labelKey: 'labels.inputs.Pending' },
  { value: 'IN_PROGRESS', labelKey: 'labels.inputs.In Progress' },
  { value: 'SUBMITTED', labelKey: 'labels.inputs.Submitted' },
  { value: 'COMPLETED', labelKey: 'labels.inputs.Completed' },
  { value: 'REJECTED', labelKey: 'labels.inputs.Rejected' },
  { value: 'WITHDRAWN', labelKey: 'labels.inputs.Withdrawn' }
];

const SORT_FIELDS = new Set([
  'displayName',
  'externalRef',
  'registrationStatus',
  'currentStage',
  'lastCompletedStage',
  'stoppedAtStage',
  'pendingCreditCount',
  'createdAt',
  'lastUpdatedAt'
]);

@Component({
  selector: 'mifosx-pending-prospects',
  templateUrl: './pending-prospects.component.html',
  styleUrls: ['./pending-prospects.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    MatSort,
    MatSortHeader,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingProspectsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private searchSubscription?: Subscription;
  private appliedFilters: PendingProspectsSearchParams = {};
  private tasksService = inject(TasksService);
  private dateUtils = inject(Dates);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  pendingProspectsForm = this.formBuilder.group({
    createdFrom: this.formBuilder.control<Date | null>(null),
    createdTo: this.formBuilder.control<Date | null>(null),
    registrationStatus: this.formBuilder.nonNullable.control('')
  });

  dataSource = new MatTableDataSource<PendingProspect>([]);
  displayedColumns: string[] = [
    'displayName',
    'externalRef',
    'registrationStatus',
    'currentStage',
    'lastCompletedStage',
    'stoppedAtStage',
    'pendingCreditCount',
    'createdAt',
    'lastUpdatedAt'
  ];
  registrationStatusOptions = REGISTRATION_STATUS_OPTIONS;

  pageSize = 10;
  pageIndex = 0;
  totalFilteredRecords = 0;
  orderBy = 'lastUpdatedAt';
  sortOrder = 'DESC';
  loading = false;
  loadError = '';
  filterError = '';

  ngOnInit(): void {
    this.loadPendingProspects();
  }

  applyFilters(): void {
    if (!this.validateFilters()) {
      return;
    }
    this.appliedFilters = this.buildFilters();
    this.resetPage();
    this.loadPendingProspects();
  }

  clearFilters(): void {
    this.pendingProspectsForm.reset();
    this.appliedFilters = {};
    this.filterError = '';
    this.resetPage();
    this.loadPendingProspects();
  }

  changePaging(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadPendingProspects();
  }

  sortData(sort: Sort): void {
    this.orderBy = sort.direction && SORT_FIELDS.has(sort.active) ? sort.active : 'lastUpdatedAt';
    this.sortOrder = sort.direction === 'asc' ? 'ASC' : 'DESC';
    this.resetPage();
    this.loadPendingProspects();
  }

  viewClient(prospect: PendingProspect): void {
    if (this.hasClientLink(prospect)) {
      this.router.navigate([
        '/clients',
        prospect.clientId,
        'general'
      ]);
    }
  }

  hasClientLink(prospect: PendingProspect): boolean {
    const permissions = this.authenticationService.getCredentials()?.permissions ?? [];
    return (
      !!prospect.clientId &&
      (!environment.productionModeEnableRBAC ||
        permissions.some((permission) => [
            'ALL_FUNCTIONS',
            'ALL_FUNCTIONS_READ',
            'READ_CLIENT'
          ].includes(permission)))
    );
  }

  registrationStatusLabel(status?: string | null): string {
    const normalized = `${status || ''}`.trim().toUpperCase();
    const option = this.registrationStatusOptions.find((statusOption) => statusOption.value === normalized);
    return option?.labelKey || this.readableCode(status) || extract('pendingProspects.statusUnavailable');
  }

  stageLabel(stage?: string): string {
    return this.readableCode(stage) || extract('pendingProspects.stageUnavailable');
  }

  progress(prospect: PendingProspect) {
    return resolveProspectProgress(prospect);
  }

  pendingStepLabel(prospect: PendingProspect): string {
    const step = this.progress(prospect).pendingStep;
    return step ? this.readableCode(step) : extract('pendingProspects.stepUnavailable');
  }

  registrationDate(prospect: PendingProspect): string | number[] | undefined {
    // Search is over UTC technical creation dates. Keep the displayed date in that same calendar.
    return typeof prospect.createdAt === 'string' ? prospect.createdAt.slice(0, 10) : prospect.createdAt;
  }

  pendingCreditCount(prospect: PendingProspect): number | string {
    return prospect.pendingCreditCount ?? '—';
  }

  private loadPendingProspects(): void {
    this.searchSubscription?.unsubscribe();
    this.dataSource.data = [];
    this.totalFilteredRecords = 0;
    this.loading = true;
    this.loadError = '';

    this.searchSubscription = this.tasksService
      .getPendingProspects(this.buildSearchParams())
      .pipe(timeout(30000), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: PendingProspectsResponse) => {
          this.dataSource.data = data?.pageItems || [];
          this.totalFilteredRecords = data?.totalFilteredRecords || 0;
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this.dataSource.data = [];
          this.totalFilteredRecords = 0;
          this.loading = false;
          this.loadError =
            error.status === 403
              ? extract('pendingProspects.permissionDenied')
              : error.status === 400
                ? extract('pendingProspects.invalidFilters')
                : error.name === 'TimeoutError'
                  ? extract('pendingProspects.timeout')
                  : 'labels.text.Unable to load pending prospects';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private buildFilters(): PendingProspectsSearchParams {
    const formValue = this.pendingProspectsForm.getRawValue();
    return {
      createdFrom: this.formatApiDate(formValue.createdFrom),
      createdTo: this.formatApiDate(formValue.createdTo),
      registrationStatus: formValue.registrationStatus
    };
  }

  private buildSearchParams(): PendingProspectsSearchParams {
    return {
      ...this.appliedFilters,
      offset: this.pageIndex * this.pageSize,
      limit: this.pageSize,
      orderBy: this.orderBy,
      sortOrder: this.sortOrder
    };
  }

  private validateFilters(): boolean {
    const { createdFrom, createdTo, registrationStatus } = this.pendingProspectsForm.getRawValue();
    this.filterError = '';
    const invalidDate = (value: Date | null) =>
      value !== null && (!(value instanceof Date) || !Number.isFinite(value.getTime()));
    if (this.pendingProspectsForm.invalid || invalidDate(createdFrom) || invalidDate(createdTo)) {
      this.filterError = extract('pendingProspects.invalidDate');
    } else if (
      registrationStatus &&
      !this.registrationStatusOptions.some((option) => option.value === registrationStatus)
    ) {
      this.filterError = extract('pendingProspects.invalidFilters');
    } else if (createdFrom && createdTo && this.dateUtils.isAfter(createdFrom, createdTo)) {
      this.filterError = 'labels.text.From Date cannot be after To Date';
    }
    this.changeDetectorRef.markForCheck();
    return !this.filterError;
  }

  private formatApiDate(date: Date | null): string {
    // Local calendar selection -> ASCII yyyy-MM-dd, without UTC conversion or localized digits.
    return date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : '';
  }

  private resetPage(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  private readableCode(value?: string | null): string {
    const rawValue = `${value || ''}`.trim();
    if (!rawValue || rawValue.toUpperCase() === 'UNKNOWN') {
      return '';
    }

    return rawValue
      .toLowerCase()
      .split(/[_\s-]+/)
      .filter((part) => !!part)
      .map((part) => (part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
      .join(' ');
  }
}
