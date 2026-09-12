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
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
import { PendingProspect, PendingProspectsResponse, TasksService } from '../../tasks.service';

interface RegistrationStatusOption {
  value: string;
  labelKey: string;
}

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
  private formBuilder = inject(UntypedFormBuilder);
  private tasksService = inject(TasksService);
  private dateUtils = inject(Dates);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  pendingProspectsForm: UntypedFormGroup = this.formBuilder.group({
    q: [''],
    createdFrom: [''],
    createdTo: [''],
    registrationStatus: ['']
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
    this.resetPage();
    this.loadPendingProspects();
  }

  clearFilters(): void {
    this.pendingProspectsForm.reset();
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
    if (prospect.clientId) {
      this.router.navigate([
        '/clients',
        prospect.clientId,
        'general'
      ]);
    }
  }

  hasClientLink(prospect: PendingProspect): boolean {
    return !!prospect.clientId;
  }

  registrationStatusLabel(status?: string): string {
    const normalized = `${status || ''}`.trim().toUpperCase();
    const option = this.registrationStatusOptions.find((statusOption) => statusOption.value === normalized);
    return option?.labelKey || this.readableCode(status);
  }

  stageLabel(stage?: string): string {
    return this.readableCode(stage) || 'labels.inputs.Unknown';
  }

  pendingCreditCount(prospect: PendingProspect): number | string {
    return prospect.pendingCreditCount ?? 0;
  }

  private loadPendingProspects(): void {
    this.loading = true;
    this.loadError = '';

    this.tasksService
      .getPendingProspects(this.buildSearchParams())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: PendingProspectsResponse) => {
          this.dataSource.data = data?.pageItems || [];
          this.totalFilteredRecords = data?.totalFilteredRecords || 0;
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.dataSource.data = [];
          this.totalFilteredRecords = 0;
          this.loading = false;
          this.loadError = 'labels.text.Unable to load pending prospects';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private buildSearchParams(): any {
    const formValue = this.pendingProspectsForm.value;
    return {
      q: formValue.q,
      createdFrom: this.formatApiDate(formValue.createdFrom),
      createdTo: this.formatApiDate(formValue.createdTo),
      registrationStatus: formValue.registrationStatus,
      offset: this.pageIndex * this.pageSize,
      limit: this.pageSize,
      orderBy: this.orderBy,
      sortOrder: this.sortOrder
    };
  }

  private validateFilters(): boolean {
    const formValue = this.pendingProspectsForm.value;
    this.filterError = '';

    if (
      formValue.createdFrom &&
      formValue.createdTo &&
      this.dateUtils.isAfter(formValue.createdFrom, formValue.createdTo)
    ) {
      this.filterError = 'labels.text.From Date cannot be after To Date';
    }

    this.changeDetectorRef.markForCheck();
    return !this.filterError;
  }

  private formatApiDate(date: Date | string): string {
    return date ? this.dateUtils.formatDate(date, Dates.DEFAULT_DATEFORMAT) : '';
  }

  private resetPage(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  private readableCode(value?: string): string {
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
