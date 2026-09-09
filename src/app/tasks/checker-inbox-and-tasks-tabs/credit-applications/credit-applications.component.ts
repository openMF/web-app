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
import { MatDialog } from '@angular/material/dialog';
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
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TasksService } from '../../tasks.service';
import {
  MassRejectCreditApplicationsDialogComponent,
  MassRejectCreditApplicationsDialogData
} from './mass-reject-credit-applications-dialog/mass-reject-credit-applications-dialog.component';

interface OptionItem {
  id?: number | string;
  code?: string;
  value?: string;
  name?: string;
  shortName?: string;
  displayLabel?: string;
  labelKey?: string;
  productType?: string;
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
  private productsService = inject(ProductsService);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private dialog = inject(MatDialog);
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
    'select',
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
  rejecting = false;
  rejectionResultMessage = '';
  rejectionResultParams: any = {};
  rejectionResultType: 'success' | 'error' | '' = '';
  selectedApplicationIds = new Set<number | string>();
  selectedApplications = new Map<number | string, any>();

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadCreditApplications();
  }

  applyFilters(): void {
    if (!this.validateFilters()) {
      return;
    }
    this.clearSelection();
    this.resetPage();
    this.loadCreditApplications();
  }

  clearFilters(): void {
    this.creditApplicationsForm.reset();
    this.filterError = '';
    this.clearSelection();
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
    this.clearSelection();
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

  isRejectable(application: any): boolean {
    const status = application?.status;
    const statusId = typeof status === 'object' && status !== null ? status.id : application?.statusId;
    const statusCode = typeof status === 'object' && status !== null ? status.code : '';
    const statusValue = `${this.statusLabel(status)}`.toLowerCase();

    return (
      !!application?.loanId &&
      this.isSupportedApplicationProduct(application) &&
      (statusId === 100 ||
        statusCode === 'loanStatusType.submitted.and.pending.approval' ||
        statusValue === 'submitted and pending approval' ||
        statusValue === 'submitted')
    );
  }

  isSelected(application: any): boolean {
    return this.selectedApplicationIds.has(application?.loanId);
  }

  toggleSelection(application: any, checked: boolean): void {
    if (!this.isRejectable(application)) {
      return;
    }
    if (checked) {
      this.selectedApplicationIds.add(application.loanId);
      this.selectedApplications.set(application.loanId, application);
    } else {
      this.selectedApplicationIds.delete(application.loanId);
      this.selectedApplications.delete(application.loanId);
    }
  }

  visibleRejectableApplications(): any[] {
    return this.dataSource.data.filter((application) => this.isRejectable(application));
  }

  allVisibleSelected(): boolean {
    const visibleRejectableApplications = this.visibleRejectableApplications();
    return (
      visibleRejectableApplications.length > 0 &&
      visibleRejectableApplications.every((application) => this.isSelected(application))
    );
  }

  partiallyVisibleSelected(): boolean {
    const visibleRejectableApplications = this.visibleRejectableApplications();
    return (
      visibleRejectableApplications.some((application) => this.isSelected(application)) && !this.allVisibleSelected()
    );
  }

  toggleVisibleSelection(checked: boolean): void {
    this.visibleRejectableApplications().forEach((application) => this.toggleSelection(application, checked));
  }

  clearSelection(): void {
    this.selectedApplicationIds.clear();
    this.selectedApplications.clear();
  }

  massReject(): void {
    this.rejectionResultMessage = '';
    this.rejectionResultParams = {};
    this.rejectionResultType = '';

    if (this.rejecting) {
      return;
    }

    if (this.selectedApplicationIds.size === 0) {
      this.rejectionResultMessage = 'labels.text.Select at least one credit application to reject';
      this.rejectionResultType = 'error';
      this.changeDetectorRef.markForCheck();
      return;
    }

    const dialogRef = this.dialog.open(MassRejectCreditApplicationsDialogComponent, {
      data: {
        selectedCount: this.selectedApplicationIds.size,
        rejectedOnDate: this.settingsService.businessDate || new Date()
      } as MassRejectCreditApplicationsDialogData
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dialogResult: any) => {
        if (!dialogResult?.confirm) {
          return;
        }
        this.rejectSelectedApplications(dialogResult.data);
      });
  }

  private rejectSelectedApplications(formData: any): void {
    if (this.rejecting || this.selectedApplicationIds.size === 0) {
      return;
    }

    this.rejecting = true;
    this.rejectionResultMessage = '';
    this.rejectionResultParams = {};
    this.rejectionResultType = '';
    const rejectionPayload = this.buildRejectionPayload(formData);
    const selectedLoanIds = Array.from(this.selectedApplicationIds);

    forkJoin(
      selectedLoanIds.map((loanId) => {
        const application = this.selectedApplications.get(loanId);
        const request$ = this.isWorkingCapitalApplication(application)
          ? this.loansService.applyWorkingCapitalLoanAccountCommand(loanId, 'reject', rejectionPayload)
          : this.loansService.loanActionButtons(loanId, 'reject', rejectionPayload);

        return request$.pipe(
          catchError((error) =>
            of({
              error,
              loanId
            })
          )
        );
      })
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results: any[]) => {
        const failed = results.filter((result) => result?.error).length;
        const succeeded = results.length - failed;

        if (failed === 0) {
          this.rejectionResultMessage = 'labels.text.All selected credit applications were rejected successfully';
          this.rejectionResultType = 'success';
          this.clearSelection();
        } else if (succeeded === 0) {
          this.rejectionResultMessage = 'labels.text.No selected credit applications could be rejected';
          this.rejectionResultType = 'error';
        } else {
          this.rejectionResultMessage = 'labels.text.Selected credit applications rejection partial result';
          this.rejectionResultParams = {
            succeeded,
            total: results.length,
            failed
          };
          this.rejectionResultType = 'error';
          results.forEach((result, index) => {
            if (!result?.error) {
              this.selectedApplicationIds.delete(selectedLoanIds[index]);
              this.selectedApplications.delete(selectedLoanIds[index]);
            }
          });
        }

        this.rejecting = false;
        this.loadCreditApplications();
      });
  }

  private buildRejectionPayload(formData: any): any {
    const dateFormat = this.settingsService.dateFormat;
    const rejectedOnDate =
      formData.rejectedOnDate instanceof Date
        ? this.dateUtils.formatDate(formData.rejectedOnDate, dateFormat)
        : formData.rejectedOnDate;

    return {
      rejectedOnDate,
      note: formData.note,
      dateFormat,
      locale: this.settingsService.language.code
    };
  }

  private isSupportedApplicationProduct(application: any): boolean {
    return !!this.applicationProductType(application);
  }

  private isWorkingCapitalApplication(application: any): boolean {
    return this.applicationProductType(application) === 'workingcapital';
  }

  private applicationProductType(application: any): 'loan' | 'workingcapital' | '' {
    const productType =
      application?.productType ??
      application?.loanProductType ??
      application?.product?.productType ??
      this.productTypeFromLookup(application);
    const productTypeValue =
      typeof productType === 'object' && productType !== null
        ? productType.value || productType.code || productType.name || productType.id
        : productType;
    const normalizedProductType = `${productTypeValue || ''}`.toLowerCase().replace(/[\s_-]/g, '');

    if (normalizedProductType === 'workingcapital' || normalizedProductType === 'workingcapitalloans') {
      return 'workingcapital';
    }
    if (normalizedProductType === 'loan' || normalizedProductType === 'loans') {
      return 'loan';
    }
    return '';
  }

  private productTypeFromLookup(application: any): string {
    const matches = this.loanProductOptions.filter((product) => `${product.id}` === `${application?.productId}`);
    if (matches.length === 1) {
      return matches[0].productType || '';
    }

    const productName = `${application?.productName || application?.product?.name || ''}`.toLowerCase();
    const productShortName = `${application?.productShortName || application?.product?.shortName || ''}`.toLowerCase();
    const matchedProduct = matches.find(
      (product) =>
        (!!productName && `${product.name || ''}`.toLowerCase() === productName) ||
        (!!productShortName && `${product.shortName || ''}`.toLowerCase() === productShortName)
    );

    return matchedProduct?.productType || '';
  }

  private loadFilterOptions(): void {
    forkJoin({
      loanProducts: this.productsService.getLoanProductsBasicDetails().pipe(catchError(() => of([]))),
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
          const pageItems = data?.pageItems || [];
          this.dataSource.data = pageItems;
          this.pruneSelectionWithRefreshedPage(pageItems);
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

  private pruneSelectionWithRefreshedPage(pageItems: any[]): void {
    this.selectedApplications.forEach((_application, loanId) => {
      const refreshedApplication = pageItems.find((application) => `${application.loanId}` === `${loanId}`);
      if (!refreshedApplication) {
        return;
      }
      if (this.isRejectable(refreshedApplication)) {
        this.selectedApplications.set(loanId, refreshedApplication);
      } else {
        this.selectedApplicationIds.delete(loanId);
        this.selectedApplications.delete(loanId);
      }
    });
  }
}
