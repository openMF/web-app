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

/** rxjs Imports */
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { OrganizationService } from 'app/organization/organization.service';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TasksService } from '../../tasks.service';

interface OptionItem {
  id?: number | string;
  code?: string;
  value?: string;
  name?: string;
  displayLabel?: string;
  labelKey?: string;
}

const CREDIT_APPLICATION_STATUS_OPTIONS: OptionItem[] = [
  { id: 100, labelKey: 'labels.inputs.Submitted and pending approval' },
  { id: 200, labelKey: 'labels.inputs.Approved' },
  { id: 400, labelKey: 'labels.inputs.Withdrawn by applicant' },
  { id: 500, labelKey: 'labels.inputs.Rejected' }
];

@Component({
  selector: 'mifosx-credit-applications',
  templateUrl: './credit-applications.component.html',
  styleUrls: ['./credit-applications.component.scss'],
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
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditApplicationsComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private tasksService = inject(TasksService);
  private loansService = inject(LoansService);
  private clientsService = inject(ClientsService);
  private organizationService = inject(OrganizationService);
  private dateUtils = inject(Dates);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  creditApplicationsForm: UntypedFormGroup = this.formBuilder.group({
    submittedFrom: [''],
    submittedTo: [''],
    clientTypeId: [''],
    stateProvinceId: [''],
    municipality: [''],
    productId: [''],
    minAmount: [''],
    maxAmount: [''],
    status: [''],
    currencyCode: ['']
  });

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'accountNo',
    'clientName',
    'clientType',
    'productName',
    'amount',
    'currencyCode',
    'submittedOnDate',
    'location',
    'status'
  ];

  loanProductOptions: OptionItem[] = [];
  clientTypeOptions: OptionItem[] = [];
  stateOptions: OptionItem[] = [];
  statusOptions: OptionItem[] = CREDIT_APPLICATION_STATUS_OPTIONS;
  currencyOptions: OptionItem[] = [];

  pageSize = 10;
  pageIndex = 0;
  totalFilteredRecords = 0;
  orderBy = 'submittedOnDate';
  sortOrder = 'DESC';
  loading = false;
  filterError = '';

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadCreditApplications();
  }

  applyFilters(): void {
    if (!this.validateFilters()) {
      return;
    }
    this.resetPage();
    this.loadCreditApplications();
  }

  clearFilters(): void {
    this.creditApplicationsForm.reset();
    this.filterError = '';
    this.resetPage();
    this.loadCreditApplications();
  }

  changePaging(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadCreditApplications();
  }

  sortData(sort: Sort): void {
    this.orderBy = sort.direction ? sort.active : 'submittedOnDate';
    this.sortOrder = sort.direction === 'asc' ? 'ASC' : 'DESC';
    this.resetPage();
    this.loadCreditApplications();
  }

  viewCreditApplication(application: any): void {
    if (application.loanId) {
      this.router.navigate([
        '/loans',
        application.loanId,
        'general'
      ]);
    }
  }

  clientTypeName(clientTypeId: number | string): string {
    return (
      this.optionLabel(this.clientTypeOptions.find((option) => `${option.id}` === `${clientTypeId}`)) ||
      `${clientTypeId || ''}`
    );
  }

  stateName(stateProvinceId: number | string): string {
    return (
      this.optionLabel(this.stateOptions.find((option) => `${option.id}` === `${stateProvinceId}`)) ||
      `${stateProvinceId || ''}`
    );
  }

  statusLabel(status: any): string {
    if (typeof status === 'object' && status !== null) {
      return status.value || status.code || status.name || status.id || '';
    }
    return status || '';
  }

  optionLabel(option?: OptionItem): string {
    if (!option) {
      return '';
    }
    return option.displayLabel || option.name || option.value || option.code || `${option.id || ''}`;
  }

  optionValue(option: OptionItem): number | string {
    return option.id ?? option.code ?? option.value ?? option.name ?? '';
  }

  private loadFilterOptions(): void {
    forkJoin({
      loanProducts: this.loansService.getLoanProducts().pipe(catchError(() => of([]))),
      clientTemplate: this.clientsService.getClientTemplate().pipe(catchError(() => of({}))),
      addressTemplate: this.clientsService.getClientAddressTemplate().pipe(catchError(() => of({}))),
      currencies: this.organizationService.getCurrencies().pipe(catchError(() => of({})))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.loanProductOptions = data.loanProducts || [];
        this.clientTypeOptions = data.clientTemplate?.clientTypeOptions || [];
        this.stateOptions = data.addressTemplate?.stateProvinceIdOptions || [];
        this.currencyOptions = data.currencies?.selectedCurrencyOptions || data.currencies?.currencyOptions || [];
        this.changeDetectorRef.markForCheck();
      });
  }

  private loadCreditApplications(): void {
    this.loading = true;
    this.filterError = '';
    const params = this.buildSearchParams();

    this.tasksService
      .getCreditApplications(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.dataSource.data = data?.pageItems || [];
          this.totalFilteredRecords = data?.totalFilteredRecords || 0;
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.dataSource.data = [];
          this.totalFilteredRecords = 0;
          this.loading = false;
          this.filterError = 'labels.text.Unable to load credit applications';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private buildSearchParams(): any {
    const formValue = this.creditApplicationsForm.value;
    return {
      submittedFrom: this.formatApiDate(formValue.submittedFrom),
      submittedTo: this.formatApiDate(formValue.submittedTo),
      clientTypeId: formValue.clientTypeId,
      stateProvinceId: formValue.stateProvinceId,
      municipality: formValue.municipality,
      productId: formValue.productId,
      minAmount: formValue.minAmount,
      maxAmount: formValue.maxAmount,
      status: formValue.status,
      currencyCode: formValue.currencyCode,
      offset: this.pageIndex * this.pageSize,
      limit: this.pageSize,
      orderBy: this.orderBy,
      sortOrder: this.sortOrder
    };
  }

  private validateFilters(): boolean {
    const formValue = this.creditApplicationsForm.value;
    const hasMinAmount = formValue.minAmount !== '' && formValue.minAmount !== null;
    const hasMaxAmount = formValue.maxAmount !== '' && formValue.maxAmount !== null;
    const minAmount = Number(formValue.minAmount);
    const maxAmount = Number(formValue.maxAmount);

    this.filterError = '';

    if (
      formValue.submittedFrom &&
      formValue.submittedTo &&
      this.dateUtils.isAfter(formValue.submittedFrom, formValue.submittedTo)
    ) {
      this.filterError = 'labels.text.From Date cannot be after To Date';
    } else if ((hasMinAmount && minAmount < 0) || (hasMaxAmount && maxAmount < 0)) {
      this.filterError = 'labels.text.Amounts cannot be negative';
    } else if (hasMinAmount && hasMaxAmount && minAmount > maxAmount) {
      this.filterError = 'labels.text.Minimum Amount cannot be greater than Maximum Amount';
    } else if ((hasMinAmount || hasMaxAmount) && !formValue.currencyCode) {
      this.filterError = 'labels.text.Currency is required when filtering by amount';
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
}
