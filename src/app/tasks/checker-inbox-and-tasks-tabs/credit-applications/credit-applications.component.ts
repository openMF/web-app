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
  inject,
  output,
  HostListener,
  effect
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
import { EMPTY, BehaviorSubject, Subject, timer, forkJoin, from, of, throwError, defer } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  expand,
  finalize,
  map,
  mergeMap,
  switchMap,
  takeUntil,
  toArray
} from 'rxjs/operators';
import moment from 'moment';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SearchService } from 'app/search/search.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateService, _ as extract } from '@ngx-translate/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { OrganizationService } from 'app/organization/organization.service';
import {
  CreditCurrencyOption,
  CreditCurrencyState,
  CreditFilterDialogData,
  CreditFilterKind,
  CreditFilterPatch,
  CreditStateOption
} from './credit-filter-dialog.model';
import { CreditFilterDialogComponent } from './credit-filter-dialog.component';
import {
  CREDIT_STATUSES,
  creditStatusId,
  creditFilterError,
  creditCalendarDate,
  creditCsvCell
} from './credit-workspace.utils';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatIconButton } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoanApprovalMoneyPipe } from '../loan-approval/loan-approval-money.pipe';
import { totals, minorUnits } from '../loan-approval/loan-approval.models';
import { MassRejectionAttemptsService } from './mass-rejection-attempts.service';
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
    FormatNumberPipe,
    LoanApprovalMoneyPipe,
    MatSlideToggleModule,
    MatIconButton,
    MatAutocompleteModule,
    MatMenuModule,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditApplicationsComponent implements OnInit {
  private searchService = inject(SearchService);
  clientMatches: { entityId: number; entityName: string; entityAccountNo?: string }[] = [];
  selectedClientName = '';
  clientLookupFailed = false;
  private authenticationService = inject(AuthenticationService);
  private organizationService = inject(OrganizationService);
  private translateService = inject(TranslateService);
  readonly queueCountChange = output<number | null>();
  private reads = new Subject<void>();
  private massCounts = new Subject<any>();
  private attempts = inject(MassRejectionAttemptsService);
  private summaries = new Subject<any>();
  private exportCancel = new Subject<void>();
  private summaryScope = '';
  private allPageObservation = 0;
  private selectionVersion = 0;
  private currencyLoading = false;
  private readonly currencyState = new BehaviorSubject<CreditCurrencyState>({
    options: [],
    loading: false,
    failed: false
  });
  private loadedPage: any[] = [];
  private appliedFilters: any = {};
  private formBuilder = inject(UntypedFormBuilder);
  private tasksService = inject(TasksService);
  private loansService = inject(LoansService);
  private clientsService = inject(ClientsService);
  private productsService = inject(ProductsService);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  private routePath = this.route.snapshot.routeConfig?.path;
  isCreditSearch = this.routePath === 'credit' || this.route.snapshot.data['title'] === 'Credit';
  isMassRejection = this.routePath === 'mass-rejection' || this.route.snapshot.data['title'] === 'Mass Rejection';
  isRequests = !this.isCreditSearch && !this.isMassRejection;
  creditApplicationsForm: UntypedFormGroup = this.createSearchForm();

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = this.isMassRejection ? [
        'select',
        'clientName',
        'accountNo',
        'amount',
        'submittedOnDate',
        'status'
      ] : this.isCreditSearch ? [
          'select',
          'accountNo',
          'clientName',
          'productName',
          'amount',
          'submittedOnDate',
          'status',
          'actions'
        ] : [
          ...(this.isMassRejection ? ['select'] : []),
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
  currencyOptions: CreditCurrencyOption[] = [];
  readonly summaryCards = [
    { status: '', key: 'labels.inputs.All', tone: 'all' },
    { status: 100, key: extract('credits.pending'), tone: 'pending' },
    { status: 300, key: 'labels.status.Active', tone: 'active' },
    { status: 500, key: 'labels.inputs.Rejected', tone: 'rejected' }
  ];
  summaryCounts: Record<string, number | null> = {};
  summaryLoading = false;
  exporting = false;
  exportError = false;
  approving = false;
  batchOutcomes: { application: any; outcome: 'succeeded' | 'failed' | 'uncertain' | 'queued'; reason?: string }[] = [];
  readonly presentationKeys = [
    extract('credits.pageMatches'),
    extract('credits.visibleRange'),
    extract('credits.exporting'),
    extract('credits.exportFiltered'),
    extract('credits.exportSelected'),
    extract('credits.review'),
    extract('credits.missingType'),
    extract('credits.missingLocation'),
    extract('credits.unknownStatus'),
    extract('credits.selectApplication'),
    extract('credits.page'),
    extract('credits.approveConfirmation')
  ];
  readonly outcomeKeys = {
    queued: extract('massRejection.queued'),
    succeeded: extract('credits.succeeded'),
    failed: extract('credits.failed'),
    uncertain: extract('credits.uncertain')
  };

  loanProductOptions: OptionItem[] = [];
  clientTypeOptions: OptionItem[] = [];
  stateOptions: CreditStateOption[] = [];
  statusOptions: OptionItem[] = [...CREDIT_APPLICATION_STATUS_OPTIONS];

  pageSize = this.isCreditSearch ? 25 : 10;
  pageIndex = 0;
  totalFilteredRecords = 0;
  orderBy = 'submittedOnDate';
  sortOrder = 'DESC';
  loading = false;
  loadFailed = false;
  filterError = '';
  rejecting = false;
  confirmingRejection = false;
  rejectionResultMessage = '';
  rejectionResultParams: any = {};
  rejectionResultType: 'success' | 'error' | '' = '';
  selectedApplicationIds = new Set<number | string>();
  selectedApplications = new Map<number | string, any>();
  failedApplications: any[] = [];

  rejectableOnly = false;
  rejectableCount: number | null = null;
  scopeTotal: number | null = null;
  rejectionForm = this.formBuilder.group({
    rejectedOnDate: [
      null,
      Validators.required
    ],
    reason: [
      '',
      Validators.required
    ],
    customReason: [
      '',
      Validators.maxLength(1000)
    ],
    note: [
      '',
      Validators.maxLength(1000)
    ]
  });

  constructor() {
    effect(() => {
      const businessDate = this.settingsService.businessDate;
      if (
        this.isMassRejection &&
        !this.rejectionForm.controls.rejectedOnDate.dirty &&
        businessDate instanceof Date &&
        !Number.isNaN(businessDate.getTime())
      ) {
        this.rejectionForm.patchValue({ rejectedOnDate: new Date(businessDate) });
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  protectPendingBatch(event: BeforeUnloadEvent): void {
    if (this.isMassRejection && this.rejecting) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  get businessDate(): Date | null {
    const date = this.settingsService.businessDate;
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  get selectedRows(): any[] {
    return Array.from(this.selectedApplications.values());
  }
  get selectedTotals() {
    return totals(
      this.selectedRows.map((row) => ({
        id: row.loanId,
        accountNo: row.accountNo,
        principal: String(row.amount),
        currency: { code: row.currencyCode, decimalPlaces: this.currencyDigits(row.currencyCode) }
      }))
    );
  }
  amountText(value: unknown): string {
    return value == null ? '' : String(value);
  }
  get rejectionNote(): string {
    const { reason, customReason, note } = this.rejectionForm.getRawValue();
    const reasonText =
      reason === 'custom'
        ? String(customReason || '').trim()
        : reason === 'documentation'
          ? this.translateService.instant(extract('massRejection.documentation'))
          : '';
    return reasonText
      ? this.translateService.instant(extract('massRejection.reasonPrefix')) +
          ': ' +
          reasonText +
          (String(note || '').trim()
            ? '\n' + this.translateService.instant(extract('massRejection.notePrefix')) + ': ' + String(note).trim()
            : '')
      : '';
  }
  get rejectionDateError(): string {
    const value = this.rejectionForm.controls.rejectedOnDate.value;
    const date = value instanceof Date ? creditCalendarDate(value) : null;
    if (
      !date?.isValid() ||
      !this.businessDate ||
      this.rejectionForm.controls.rejectedOnDate.invalid ||
      date.isAfter(creditCalendarDate(this.businessDate), 'day')
    )
      return extract('massRejection.invalidDate');
    if (
      this.selectedRows.some(
        (row) =>
          !row.submittedOnDate ||
          !creditCalendarDate(row.submittedOnDate).isValid() ||
          date.isBefore(creditCalendarDate(row.submittedOnDate), 'day')
      )
    )
      return extract('massRejection.beforeSubmission');
    return '';
  }
  get canRejectSelection(): boolean {
    return (
      !this.busy &&
      !this.loading &&
      this.hasPermission('REJECT_LOAN') &&
      this.selectedRows.length > 0 &&
      this.selectedRows.every(
        (row) => this.isRejectable(row) && !this.attempts.locked(row.loanId, this.isWorkingCapitalApplication(row))
      ) &&
      this.rejectionForm.controls.note.valid &&
      (this.rejectionForm.controls.reason.value !== 'custom' || this.rejectionForm.controls.customReason.valid) &&
      !this.rejectionDateError &&
      !!this.rejectionNote &&
      this.rejectionNote.length <= 1000 &&
      this.selectedTotals !== null
    );
  }
  disabledReason(application: any): string {
    if (this.attempts.locked(application.loanId, this.isWorkingCapitalApplication(application)))
      return extract('massRejection.previousAttempt');
    if (this.isRejectable(application))
      return this.hasPermission('REJECT_LOAN') ? '' : extract('massRejection.permission');
    return (
      (
        {
          200: extract('massRejection.approved'),
          300: extract('massRejection.active'),
          500: extract('massRejection.rejected')
        } as Record<number, string>
      )[creditStatusId(application)] || extract('massRejection.ineligible')
    );
  }
  toggleRejectableOnly(checked: boolean): void {
    if (this.busy) return;
    this.rejectableOnly = checked;
    this.applyFilters();
  }
  removeSelected(application: any): void {
    if (this.busy) return;
    this.selectedApplicationIds.delete(application.loanId);
    this.selectedApplications.delete(application.loanId);
    this.selectionVersion++;
    this.changeDetectorRef.markForCheck();
  }
  cancelRejection(): void {
    if (this.busy) return;
    this.clearSelection();
    this.rejectionForm.reset({ rejectedOnDate: this.businessDate, reason: '', customReason: '', note: '' });
  }

  ngOnInit(): void {
    this.reads
      .pipe(
        switchMap(() => {
          this.loading = true;
          this.loadFailed = false;
          return (
            this.isMassRejection
              ? this.tasksService.getCreditApplications(this.buildSearchParams(), true)
              : this.tasksService.getCreditApplications(this.buildSearchParams())
          ).pipe(
            map((data: any) => ({ data, failed: false })),
            catchError(() => of({ data: null, failed: true }))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ data, failed }) => {
        this.loading = false;
        this.loadFailed = failed;
        if (failed) {
          this.loadedPage = [];
          this.dataSource.data = [];
          this.clearSelection();
          this.filterError = 'labels.text.Unable to load credit applications';
        } else {
          this.loadedPage = data?.pageItems || [];
          this.filterCurrentPage();
          this.totalFilteredRecords = data?.totalFilteredRecords ?? 0;
          if (this.isMassRejection) this.mergeStatusOptions(this.loadedPage);
          this.pruneSelectionWithRefreshedPage(this.loadedPage);
          if (!this.appliedFilters.status && this.isCreditSearch) {
            if (typeof data?.totalFilteredRecords === 'number') {
              this.allPageObservation++;
              this.summaryCounts[''] = data.totalFilteredRecords;
            }
            if (Object.keys(this.appliedFilters).length === 0) this.queueCountChange.emit(this.summaryCounts['']);
          }
        }
        this.changeDetectorRef.markForCheck();
      });
    this.summaries
      .pipe(
        switchMap((scope) => {
          this.summaryLoading = true;
          this.summaryCounts = {};
          const allPageObservation = this.allPageObservation;
          return forkJoin(
            this.summaryCards.map((card) =>
              this.tasksService
                .getCreditApplications({
                  ...scope,
                  ...(card.status === '' ? {} : { status: card.status }),
                  offset: 0,
                  limit: 1
                })
                .pipe(
                  map((data: any) => ({
                    status: card.status,
                    allPageObservation,
                    count: typeof data?.totalFilteredRecords === 'number' ? data.totalFilteredRecords : null
                  })),
                  catchError(() => of({ status: card.status, allPageObservation, count: null }))
                )
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((counts) => {
        counts.forEach(({ status, count, allPageObservation }) => {
          // A newer unfiltered page is a fresher All observation than this summary request.
          if (status === '' && allPageObservation !== this.allPageObservation) return;
          this.summaryCounts[String(status)] = count;
          if (status === '' && this.summaryScope === '{}') this.queueCountChange.emit(count);
        });
        this.summaryLoading = false;
        this.changeDetectorRef.markForCheck();
      });
    if (this.isCreditSearch || this.isMassRejection) {
      this.creditApplicationsForm
        .get('pageSearch')
        .valueChanges.pipe(
          map((value) => (typeof value === 'string' ? value.trim() : '')),
          distinctUntilChanged(),
          // Reset emissions cancel pending timers/lookups immediately and allow the same term again.
          switchMap((term) => {
            this.clientMatches = [];
            this.clientLookupFailed = false;
            if (this.busy) return of([]);
            const search = () => {
              if (this.busy) return of([]);
              this.clearSelection();
              this.filterCurrentPage();
              this.changeDetectorRef.markForCheck();
              return term.length >= 3 && this.hasPermission('READ_CLIENT')
                ? this.searchService.getSearchResults(term, 'clients').pipe(
                    catchError(() => {
                      this.clientLookupFailed = true;
                      return of([]);
                    })
                  )
                : of([]);
            };
            return term ? timer(300).pipe(switchMap(search)) : search();
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((matches: any[]) => {
          this.clientMatches = (matches || [])
            .filter((match) => match.entityType === 'CLIENT' && match.entityId && match.entityName)
            .slice(0, 20);
          this.changeDetectorRef.markForCheck();
        });
    }
    if (this.isMassRejection) {
      this.massCounts
        .pipe(
          switchMap((scope) =>
            forkJoin({
              all: this.tasksService
                .getCreditApplications({ ...scope, offset: 0, limit: 1 }, true)
                .pipe(catchError(() => of(null))),
              pending: this.tasksService
                .getCreditApplications({ ...scope, status: 100, offset: 0, limit: 200 }, true)
                .pipe(catchError(() => of(null)))
            })
          ),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(({ all, pending }) => {
          this.scopeTotal = Number.isSafeInteger(all?.totalFilteredRecords) ? all.totalFilteredRecords : null;
          this.rejectableCount =
            Number.isSafeInteger(pending?.totalFilteredRecords) &&
            Array.isArray(pending?.pageItems) &&
            pending.totalFilteredRecords === pending.pageItems.length &&
            pending.totalFilteredRecords <= 200 &&
            new Set(pending.pageItems.map((row: any) => String(row.loanId))).size === pending.pageItems.length
              ? pending.pageItems.filter(
                  (row: any) =>
                    this.isRejectable(row) && !this.attempts.locked(row.loanId, this.isWorkingCapitalApplication(row))
                ).length
              : null;
          if (Object.keys(this.appliedFilters).every((key) => key === 'status'))
            this.queueCountChange.emit(this.rejectableCount);
          this.changeDetectorRef.markForCheck();
        });
    }
    this.loadFilterOptions();
    this.loadCreditApplications();
  }

  get busy(): boolean {
    return this.rejecting || this.approving || this.confirmingRejection;
  }

  hasPermission(permission: string): boolean {
    const permissions = this.authenticationService.getCredentials()?.permissions || [];
    // Financial commands always require explicit mutation permission, even when menu RBAC is disabled.
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes(permission) ||
      (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ'))
    );
  }

  selectClient(client: { entityId: number; entityName: string }): void {
    if (this.busy || !this.hasPermission('READ_CLIENT')) return;
    this.selectedClientName = client.entityName;
    this.creditApplicationsForm.patchValue({ clientId: client.entityId }, { emitEvent: false });
    this.creditApplicationsForm.get('pageSearch').setValue('');
    this.clientMatches = [];
    this.applyFilters();
  }

  clearClient(): void {
    if (this.busy) return;
    this.selectedClientName = '';
    this.creditApplicationsForm.patchValue({ clientId: '' });
    this.applyFilters();
  }

  selectStatus(status: number | string): void {
    if (this.busy) return;
    this.creditApplicationsForm.patchValue({ status });
    this.applyFilters();
  }

  openFilter(kind: CreditFilterKind): void {
    if (this.busy) return;
    this.dialog
      .open<CreditFilterDialogComponent, CreditFilterDialogData, CreditFilterPatch>(CreditFilterDialogComponent, {
        width: '480px',
        maxWidth: '96vw',
        data: {
          kind,
          value: this.creditApplicationsForm.getRawValue(),
          currencies$: this.currencyState.asObservable(),
          retryCurrencies: () => this.loadCurrencies(),
          states: this.stateOptions
        }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (!value || this.busy) return;
        this.creditApplicationsForm.patchValue(value);
        this.applyFilters();
      });
  }

  filterActive(kind: string): boolean {
    const v = this.creditApplicationsForm.value;
    return kind === 'dates'
      ? !!(v.submittedFrom || v.submittedTo)
      : kind === 'amount'
        ? (v.minAmount !== '' && v.minAmount != null) || (v.maxAmount !== '' && v.maxAmount != null) || !!v.currencyCode
        : !!(v.stateProvinceId || v.municipality);
  }

  private filterCurrentPage(): void {
    const query = String(this.creditApplicationsForm.get('pageSearch')?.value || '')
      .trim()
      .toLocaleLowerCase();
    const eligiblePage =
      this.isMassRejection && this.rejectableOnly
        ? this.loadedPage.filter((row) => this.isRejectable(row))
        : this.loadedPage;
    this.dataSource.data = query
      ? eligiblePage.filter((row) =>
          [
            row.clientName,
            row.accountNo ?? row.loanId
          ].some((value) =>
            String(value ?? '')
              .toLocaleLowerCase()
              .includes(query)
          )
        )
      : eligiblePage;
  }

  applyFilters(): void {
    if (this.busy) return;
    if (!this.validateFilters()) {
      return;
    }
    this.appliedFilters = this.filterParams();
    this.clearSelection();
    this.resetPage();
    this.loadCreditApplications();
  }

  clearFilters(): void {
    if (this.busy) return;
    this.rejectableOnly = false;
    this.selectedClientName = '';
    this.clientMatches = [];
    this.clientLookupFailed = false;
    this.creditApplicationsForm.reset();
    this.appliedFilters = {};
    this.filterError = '';
    this.clearSelection();
    this.resetPage();
    this.loadCreditApplications();
  }

  retryLoad(): void {
    if (this.busy) return;
    this.loadCreditApplications();
  }

  changePaging(event: PageEvent): void {
    if (this.busy) return;
    this.clearSelection();
    this.creditApplicationsForm.get('pageSearch')?.reset('');
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadCreditApplications();
  }

  sortData(sort: Sort): void {
    if (this.busy) return;
    this.orderBy = sort.direction ? sort.active : 'submittedOnDate';
    this.sortOrder = sort.direction === 'asc' ? 'ASC' : 'DESC';
    this.clearSelection();
    this.resetPage();
    this.loadCreditApplications();
  }

  viewCreditApplication(application: any): void {
    if (application.loanId && !this.busy) {
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

  statusKey(application: any): string {
    return CREDIT_STATUSES[creditStatusId(application)]?.key || '';
  }
  statusTone(application: any): string {
    return CREDIT_STATUSES[creditStatusId(application)]?.tone || 'neutral';
  }
  statusLabel(status: any): string {
    return typeof status === 'object' && status !== null
      ? String(status.value || status.code || status.id || '')
      : String(status ?? '');
  }
  initials(name: string): string {
    return String(name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => Array.from(part)[0] || '')
      .join('')
      .toLocaleUpperCase();
  }
  locationLabel(application: any): string {
    return [
      this.stateName(application.stateProvinceId),
      application.municipality
    ]
      .filter(Boolean)
      .join(' / ');
  }
  relativeDate(value: any): string {
    if (!value) return '';
    const date = creditCalendarDate(value);
    if (!date.isValid()) return '';
    const days = moment().startOf('day').diff(date.startOf('day'), 'days');
    return this.translateService.instant(
      days === 0
        ? extract('credits.today')
        : days === 1
          ? extract('credits.yesterday')
          : days < 0
            ? extract('credits.futureDays')
            : extract('credits.daysAgo'),
      { count: Math.abs(days) }
    );
  }
  currencyDigits(code: string): number {
    const currency = this.currencyOptions.find((item) => item.code === code);
    if (this.isMassRejection && currency?.decimalPlaces == null) return NaN;
    if (currency?.decimalPlaces != null) return currency.decimalPlaces;
    try {
      return new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits;
    } catch {
      return Number(this.settingsService.decimals);
    }
  }
  get rangeStart(): number {
    return this.loadedPage.length ? this.pageIndex * this.pageSize + 1 : 0;
  }
  get rangeEnd(): number {
    return this.loadedPage.length ? this.pageIndex * this.pageSize + this.loadedPage.length : 0;
  }
  get pageNumbers(): number[] {
    const pages = Math.ceil(this.totalFilteredRecords / this.pageSize);
    const start = Math.max(0, Math.min(this.pageIndex - 1, pages - 3));
    return Array.from({ length: Math.min(pages, 3) }, (_, i) => start + i);
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
    if (
      this.isMassRejection &&
      !(typeof application?.loanId === 'number'
        ? Number.isSafeInteger(application.loanId) && application.loanId > 0
        : typeof application?.loanId === 'string' && /^[1-9][0-9]{0,18}$/.test(application.loanId))
    )
      return false;
    return (
      !!application?.loanId && this.isSupportedApplicationProduct(application) && creditStatusId(application) === 100
    );
  }

  isApprovable(application: any): boolean {
    // Working-capital approval requires additional authoritative template fields. Use its individual review workflow.
    return this.isRejectable(application) && !this.isWorkingCapitalApplication(application);
  }

  canSelect(application: any): boolean {
    if (this.isMassRejection)
      return (
        this.hasPermission('REJECT_LOAN') &&
        this.isRejectable(application) &&
        !this.attempts.locked(application.loanId, this.isWorkingCapitalApplication(application))
      );
    return (
      (this.hasPermission('REJECT_LOAN') && this.isRejectable(application)) ||
      (this.hasPermission('APPROVE_LOAN') && this.isApprovable(application))
    );
  }

  get summaryFailed(): boolean {
    return Object.values(this.summaryCounts).some((count) => count === null);
  }
  retrySummary(): void {
    if (this.busy || this.summaryLoading) return;
    this.summaryScope = '';
    this.loadCreditApplications();
  }

  get outcomeCounts() {
    return {
      total: this.batchOutcomes.length,
      ...(this.isMassRejection ? { queued: this.batchOutcomes.filter((row) => row.outcome === 'queued').length } : {}),
      succeeded: this.batchOutcomes.filter((row) => row.outcome === 'succeeded').length,
      failed: this.batchOutcomes.filter((row) => row.outcome === 'failed').length,
      uncertain: this.batchOutcomes.filter((row) => row.outcome === 'uncertain').length
    };
  }

  get canApproveSelection(): boolean {
    return (
      this.hasPermission('APPROVE_LOAN') &&
      this.selectedApplications.size > 0 &&
      moment(this.settingsService.businessDate).isValid() &&
      Array.from(this.selectedApplications.values()).every((row) => this.isApprovable(row))
    );
  }

  isSelected(application: any): boolean {
    return this.selectedApplicationIds.has(application?.loanId);
  }

  toggleSelection(application: any, checked: boolean): void {
    if (this.busy || this.loading || !this.canSelect(application)) {
      return;
    }
    if (checked) {
      this.selectedApplicationIds.add(application.loanId);
      this.selectedApplications.set(application.loanId, application);
    } else {
      this.selectedApplicationIds.delete(application.loanId);
      this.selectedApplications.delete(application.loanId);
    }
    this.selectionVersion++;
    this.changeDetectorRef.markForCheck();
  }

  visibleRejectableApplications(): any[] {
    return this.dataSource.data.filter((application) => this.canSelect(application));
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
    this.selectionVersion++;
    this.selectedApplicationIds.clear();
    this.selectedApplications.clear();
  }

  massReject(): void {
    this.rejectionResultMessage = '';
    this.rejectionResultParams = {};
    this.rejectionResultType = '';

    if (this.busy || !this.hasPermission('REJECT_LOAN')) {
      return;
    }

    if (this.selectedApplicationIds.size === 0) {
      this.rejectionResultMessage = 'labels.text.Select at least one credit application to reject';
      this.rejectionResultType = 'error';
      this.changeDetectorRef.markForCheck();
      return;
    }

    if (!Array.from(this.selectedApplications.values()).every((row) => this.isRejectable(row))) return;
    if (this.isMassRejection && !this.canRejectSelection) {
      this.rejectionForm.markAllAsTouched();
      return;
    }
    const reviewedData = this.isMassRejection
      ? { ...this.rejectionForm.getRawValue(), note: this.rejectionNote }
      : null;
    const snapshot = new Map(
      this.selectedRows.map((row) => [
        row.loanId,
        JSON.parse(
          JSON.stringify(this.isMassRejection ? { ...row, productType: this.applicationProductType(row) } : row)
        )
      ])
    );
    const selectionVersion = this.selectionVersion;
    this.confirmingRejection = true;
    this.creditApplicationsForm.disable({ emitEvent: false });
    if (this.isMassRejection) this.rejectionForm.disable({ emitEvent: false });
    const dialogRef = this.dialog.open(MassRejectCreditApplicationsDialogComponent, {
      data: {
        selectedCount: this.selectedApplicationIds.size,
        ...(this.isMassRejection
          ? { accounts: this.selectedRows.map((row) => row.accountNo ?? row.loanId), confirmation: reviewedData }
          : {}),
        rejectedOnDate: this.settingsService.businessDate || new Date()
      } as MassRejectCreditApplicationsDialogData
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dialogResult: any) => {
        this.confirmingRejection = false;
        this.rejectionForm.enable({ emitEvent: false });
        if (!dialogResult?.confirm) {
          this.creditApplicationsForm.enable({ emitEvent: false });
          this.changeDetectorRef.markForCheck();
          return;
        }
        if (
          !this.hasPermission('REJECT_LOAN') ||
          selectionVersion !== this.selectionVersion ||
          !Array.from(snapshot.values()).every((row) => this.isRejectable(row) && this.isSelected(row))
        ) {
          this.creditApplicationsForm.enable({ emitEvent: false });
          this.rejectionResultMessage = extract('credits.rejectionCanceled');
          this.rejectionResultParams = {};
          this.rejectionResultType = 'error';
          this.changeDetectorRef.markForCheck();
          return;
        }
        this.rejectSelectedApplications(reviewedData || dialogResult.data, snapshot);
      });
  }

  private rejectSelectedApplications(formData: any, selectedSnapshot: Map<number | string, any>): void {
    if (!this.isMassRejection) {
      this.rejectLegacyApplications(formData, selectedSnapshot);
      return;
    }
    if (this.rejecting || !this.hasPermission('REJECT_LOAN') || this.selectedApplicationIds.size === 0) {
      return;
    }

    this.rejecting = true;
    this.rejectionResultMessage = '';
    this.rejectionResultParams = {};
    this.rejectionResultType = '';
    this.failedApplications = [];
    this.batchOutcomes = [];
    this.rejectionForm.disable({ emitEvent: false });
    const rejectionPayload = this.buildRejectionPayload(formData);
    from(Array.from(selectedSnapshot.values()))
      .pipe(
        mergeMap((application) => this.verifiedRejection(application, rejectionPayload), 3),
        toArray(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((outcomes) => {
        this.batchOutcomes = outcomes;
        this.failedApplications = [];
        this.rejectionResultMessage = outcomes.some((row) => row.outcome === 'uncertain')
          ? extract('credits.uncertainResult')
          : extract('credits.batchComplete');
        this.rejectionResultType = outcomes.every((row) => row.outcome === 'succeeded') ? 'success' : 'error';
        this.clearSelection();
        this.rejecting = false;
        this.creditApplicationsForm.enable({ emitEvent: false });
        this.rejectionForm.enable({ emitEvent: false });
        this.queueCountChange.emit(null);
        this.summaryScope = '';
        this.loadCreditApplications();
      });
  }

  private rejectLegacyApplications(formData: any, selectedSnapshot: Map<number | string, any>): void {
    if (this.rejecting || !this.hasPermission('REJECT_LOAN') || this.selectedApplicationIds.size === 0) {
      return;
    }

    this.rejecting = true;
    this.rejectionResultMessage = '';
    this.rejectionResultParams = {};
    this.rejectionResultType = '';
    this.failedApplications = [];
    this.batchOutcomes = [];
    const rejectionPayload = this.buildRejectionPayload(formData);
    const selectedLoanIds = Array.from(selectedSnapshot.keys());

    from(selectedLoanIds)
      .pipe(
        mergeMap((loanId) => {
          const application = selectedSnapshot.get(loanId);
          const request$ = this.isWorkingCapitalApplication(application)
            ? this.loansService.applyWorkingCapitalLoanAccountCommand(loanId, 'reject', rejectionPayload)
            : this.loansService.loanActionButtons(loanId, 'reject', rejectionPayload);

          return request$.pipe(
            map(() => ({ loanId, error: null as any })),
            catchError((error) =>
              of({
                error,
                loanId
              })
            )
          );
        }, 3),
        toArray(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((results: any[]) => {
        const failed = results.filter((result) => result?.error).length;
        const succeeded = results.length - failed;
        this.failedApplications = results
          .map((result) => (result?.error ? selectedSnapshot.get(result.loanId) : null))
          .filter((application) => !!application);

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
          results.forEach((result) => {
            if (!result?.error) {
              this.selectedApplicationIds.delete(result.loanId);
              this.selectedApplications.delete(result.loanId);
            }
          });
        }

        this.batchOutcomes = results.map((result) => ({
          application: selectedSnapshot.get(result.loanId),
          outcome: this.commandOutcome(result.error)
        }));
        if (this.batchOutcomes.some((result) => result.outcome === 'uncertain')) {
          this.rejectionResultMessage = extract('credits.uncertainResult');
          this.rejectionResultType = 'error';
        }
        this.clearSelection();
        this.rejecting = false;
        this.creditApplicationsForm.enable({ emitEvent: false });
        this.queueCountChange.emit(null);
        this.summaryScope = '';
        this.loadCreditApplications();
      });
  }

  private verifiedRejection(application: any, payload: any) {
    const id = String(application.loanId);
    const workingCapital = this.isWorkingCapitalApplication(application);
    let submitted = false;
    let responseReceived = false;
    const detail = () =>
      workingCapital
        ? this.loansService.getWorkingCapitalLoanDetails(id, true)
        : this.loansService.getLoanAccountDetails(id, true);
    const denied = (reason: string) => throwError(() => ({ status: 409, reason }));
    return defer(() => {
      if (!this.hasPermission('REJECT_LOAN') || !this.isRejectable(application))
        return denied(extract('massRejection.permission'));
      return detail().pipe(
        switchMap((loan) => {
          if (String(loan?.id) !== id || loan.accountNo !== application.accountNo || loan.status?.id !== 100)
            return denied(extract('massRejection.changed'));
          const digits = this.currencyDigits(application.currencyCode);
          const requested = minorUnits(String(application.amount), digits);
          if (
            String(loan.loanProductId) !== String(application.productId) ||
            (application.clientId != null && String(loan.clientId) !== String(application.clientId)) ||
            loan.currency?.code !== application.currencyCode ||
            loan.currency?.decimalPlaces !== digits ||
            requested === null ||
            minorUnits(loan.proposedPrincipal ?? loan.principal, digits) !== requested
          )
            return denied(extract('massRejection.changed'));
          const date = moment(payload.rejectedOnDate, this.dateUtils.angularToMomentFormat(payload.dateFormat), true);
          const submittedDate = loan.timeline?.submittedOnDate ?? loan.submittedOnDate;
          if (
            !date.isValid() ||
            !this.businessDate ||
            !submittedDate ||
            !creditCalendarDate(submittedDate).isValid() ||
            date.isBefore(creditCalendarDate(submittedDate), 'day') ||
            date.isAfter(creditCalendarDate(this.businessDate), 'day')
          )
            return denied(extract('massRejection.invalidDate'));
          // Fineract enforces client office-joining restrictions atomically; its loan detail does not expose that date.
          if (!this.hasPermission('REJECT_LOAN')) return denied(extract('massRejection.permission'));
          if (!this.attempts.lock(application.loanId, workingCapital))
            return denied(extract('massRejection.previousAttempt'));
          return defer(() => {
            submitted = true;
            return workingCapital
              ? this.loansService.applyWorkingCapitalLoanAccountCommand(application.loanId, 'reject', payload)
              : this.loansService.loanActionButtons(application.loanId, 'reject', payload);
          }).pipe(
            switchMap((response) => {
              responseReceived = true;
              if (response?.rollbackTransaction === true || (response?.commandId && !response?.resourceId))
                return of({ application, outcome: 'queued' as const, reason: extract('massRejection.queued') });
              if (String(response?.resourceId) !== id)
                return of({ application, outcome: 'uncertain' as const, reason: extract('massRejection.readback') });
              return forkJoin({
                loan: detail(),
                notes: workingCapital ? of(null) : this.loansService.getLoanNotes(id)
              }).pipe(
                map(({ loan: current, notes }) => {
                  const matched =
                    String(current?.id) === id &&
                    current.accountNo === application.accountNo &&
                    current.status?.id === 500;
                  const persisted =
                    workingCapital || (Array.isArray(notes) && notes.some((note) => note.note === payload.note));
                  return {
                    application,
                    outcome: matched && persisted ? ('succeeded' as const) : ('uncertain' as const),
                    ...(matched && persisted ? {} : { reason: extract('massRejection.readback') })
                  };
                })
              );
            })
          );
        })
      );
    }).pipe(
      catchError((error) => {
        const uncertain =
          submitted && (responseReceived || !error?.status || error.status >= 500 || error.status === 408);
        if (submitted && !uncertain) this.attempts.unlock(application.loanId, workingCapital);
        return of({
          application,
          outcome: uncertain ? ('uncertain' as const) : ('failed' as const),
          reason: uncertain
            ? extract('massRejection.readback')
            : error?.reason ||
              (submitted ? extract('massRejection.backendValidation') : extract('massRejection.preflight'))
        });
      })
    );
  }

  massApprove(): void {
    if (this.busy || !this.canApproveSelection) return;
    const snapshot = new Map(this.selectedApplications);
    const businessDate = this.settingsService.businessDate;
    this.confirmingRejection = true;
    this.creditApplicationsForm.disable({ emitEvent: false });
    this.dialog
      .open(MassRejectCreditApplicationsDialogComponent, {
        data: {
          operation: 'approve',
          selectedCount: snapshot.size,
          accounts: Array.from(snapshot.values()).map((row) => row.accountNo ?? row.loanId),
          rejectedOnDate: businessDate
        }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.confirmingRejection = false;
        if (!result?.confirm || !this.hasPermission('APPROVE_LOAN')) {
          this.creditApplicationsForm.enable({ emitEvent: false });
          this.changeDetectorRef.markForCheck();
          return;
        }
        this.approving = true;
        this.batchOutcomes = [];
        this.failedApplications = [];
        this.rejectionResultParams = {};
        const payload = {
          approvedOnDate: this.dateUtils.formatDate(result.data.rejectedOnDate, this.settingsService.dateFormat),
          dateFormat: this.settingsService.dateFormat,
          locale: this.settingsService.language.code
        };
        from(Array.from(snapshot.values()))
          .pipe(
            mergeMap(
              (application) =>
                this.loansService.loanActionButtons(application.loanId, 'approve', payload).pipe(
                  map(() => ({ application, outcome: 'succeeded' as const })),
                  catchError((error) => of({ application, outcome: this.commandOutcome(error) }))
                ),
              3
            ),
            toArray(),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe((outcomes) => {
            this.batchOutcomes = outcomes;
            this.approving = false;
            this.creditApplicationsForm.enable({ emitEvent: false });
            this.clearSelection();
            this.rejectionResultMessage = outcomes.some((row) => row.outcome === 'uncertain')
              ? extract('credits.uncertainResult')
              : extract('credits.batchComplete');
            this.rejectionResultType = outcomes.every((row) => row.outcome === 'succeeded') ? 'success' : 'error';
            this.queueCountChange.emit(null);
            this.summaryScope = '';
            this.loadCreditApplications();
          });
      });
  }

  private commandOutcome(error: any): 'succeeded' | 'failed' | 'uncertain' {
    if (!error) return 'succeeded';
    return !error.status || error.status >= 500 ? 'uncertain' : 'failed';
  }

  exportCsv(): void {
    if (this.busy || this.exporting || this.loading || this.loadFailed) return;
    this.exporting = true;
    this.exportError = false;
    const selected = Array.from(this.selectedApplications.values());
    const params = { ...this.appliedFilters, orderBy: this.orderBy, sortOrder: this.sortOrder, limit: 200 };
    // All-filtered exports are bounded; incomplete, changed or failed exports never download a partial file.
    const source = selected.length
      ? of(selected)
      : this.tasksService.getCreditApplications({ ...params, offset: 0 }).pipe(
          expand((page: any, index) => {
            const nextOffset = (index + 1) * 200;
            if (
              !Number.isInteger(page?.totalFilteredRecords) ||
              page.totalFilteredRecords > 10000 ||
              !Array.isArray(page.pageItems)
            )
              return throwError(() => new Error('invalid export'));
            return nextOffset < page.totalFilteredRecords
              ? this.tasksService.getCreditApplications({ ...params, offset: nextOffset })
              : EMPTY;
          }),
          toArray(),
          map((pages: any[]) => {
            const total = pages[0]?.totalFilteredRecords;
            const rows = pages.flatMap((page) => page.pageItems);
            if (
              rows.length !== total ||
              pages.some((page) => page.totalFilteredRecords !== total) ||
              new Set(rows.map((row) => row.loanId)).size !== rows.length
            )
              throw new Error('incomplete export');
            return rows;
          })
        );
    source
      .pipe(
        takeUntil(this.exportCancel),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.exporting = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (rows: any[]) => {
          const headers = [
            'labels.inputs.Application / Account No.',
            'labels.inputs.Customer',
            'labels.inputs.Customer Type',
            'labels.inputs.Product',
            'labels.inputs.Amount',
            'labels.inputs.Currency',
            'labels.inputs.Submitted Date',
            'labels.inputs.Status',
            'labels.inputs.State',
            'labels.inputs.Municipality'
          ];
          const lines = [headers.map((key) => creditCsvCell(this.translateService.instant(key))).join(',')];
          rows.forEach((row) =>
            lines.push(
              [
                creditCsvCell(row.accountNo ?? row.loanId, true),
                creditCsvCell(row.clientName),
                creditCsvCell(this.clientTypeName(row.clientTypeId)),
                creditCsvCell(row.productName),
                creditCsvCell(row.amount),
                creditCsvCell(row.currencyCode),
                creditCsvCell(row.submittedOnDate ? creditCalendarDate(row.submittedOnDate).format('YYYY-MM-DD') : ''),
                creditCsvCell(
                  this.statusKey(row)
                    ? this.translateService.instant(this.statusKey(row))
                    : this.statusLabel(row.status)
                ),
                creditCsvCell(this.stateName(row.stateProvinceId)),
                creditCsvCell(row.municipality)
              ].join(',')
            )
          );
          const url = URL.createObjectURL(
            new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
          );
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = selected.length ? 'selected-credit-applications.csv' : 'filtered-credit-applications.csv';
          anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
        error: () => {
          this.exportError = true;
          this.changeDetectorRef.markForCheck();
        }
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
    // The authoritative credit-application search reads Fineract's m_loan records. If an
    // extension does not explicitly identify a working-capital product, use the normal loan
    // command instead of making a real application non-selectable because optional lookup
    // metadata is absent.
    return normalizedProductType ? '' : application?.loanId ? 'loan' : '';
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
    this.loadCurrencies();
    forkJoin({
      loanProducts: this.productsService.getLoanProductsBasicDetails().pipe(catchError(() => of([]))),
      clientTemplate: this.clientsService.getClientTemplate().pipe(catchError(() => of({}))),
      addressTemplate: this.clientsService.getClientAddressTemplate().pipe(catchError(() => of({})))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.loanProductOptions = data.loanProducts || [];
        this.clientTypeOptions = data.clientTemplate?.clientTypeOptions || [];
        this.stateOptions = data.addressTemplate?.stateProvinceIdOptions || [];
        if (this.isMassRejection && !this.busy) {
          this.clearSelection();
          this.filterCurrentPage();
          this.refreshMassCounts();
        }
        this.changeDetectorRef.markForCheck();
      });
  }

  private loadCurrencies(): void {
    if (this.currencyLoading) return;
    this.currencyLoading = true;
    this.currencyState.next({ options: [], loading: true, failed: false });
    this.organizationService
      .getCurrencies()
      .pipe(
        map((data: any) => ({ options: data?.selectedCurrencyOptions || [], loading: false, failed: false })),
        catchError(() => of({ options: [], loading: false, failed: true })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((state) => {
        this.currencyLoading = false;
        this.currencyOptions = state.options;
        this.currencyState.next(state);
        this.changeDetectorRef.markForCheck();
      });
  }

  private loadCreditApplications(): void {
    this.exportCancel.next();
    this.exportError = false;
    this.filterError = '';
    if (!this.isCreditSearch) {
      if (this.isMassRejection) this.refreshMassCounts();
      this.reads.next();
      return;
    }
    const { status, ...scope } = this.appliedFilters;
    const key = JSON.stringify(scope);
    if (key !== this.summaryScope) {
      this.summaryScope = key;
      this.summaries.next(scope);
    }
    this.reads.next();
  }

  private refreshMassCounts(): void {
    const { status, ...scope } = this.appliedFilters;
    this.rejectableCount = null;
    this.scopeTotal = null;
    this.massCounts.next(scope);
  }

  private buildSearchParams(): any {
    return {
      ...this.appliedFilters,
      offset: this.pageIndex * this.pageSize,
      limit: this.pageSize,
      orderBy: this.orderBy,
      sortOrder: this.sortOrder
    };
  }

  private filterParams(): any {
    const { submittedFrom, submittedTo, pageSearch, ...values } = this.creditApplicationsForm.value;
    return this.removeEmptyParams({
      ...values,
      ...(this.isMassRejection ? { status: this.rejectableOnly ? 100 : '' } : {}),
      submittedFrom: this.formatApiDate(submittedFrom),
      submittedTo: this.formatApiDate(submittedTo)
    });
  }

  private createSearchForm(): UntypedFormGroup {
    if (this.isMassRejection) {
      return this.formBuilder.group({
        submittedFrom: [''],
        submittedTo: [''],
        pageSearch: [''],
        clientId: [''],
        productId: ['']
      });
    }

    const prototypeControls = {
      submittedFrom: [''],
      submittedTo: [''],
      minAmount: [''],
      maxAmount: [''],
      currencyCode: [''],
      pageSearch: [''],
      clientId: [''],
      status: [''],
      stateProvinceId: [''],
      municipality: [''],
      productId: ['']
    };

    if (this.isCreditSearch) {
      return this.formBuilder.group(prototypeControls);
    }

    return this.formBuilder.group({
      submittedFrom: [''],
      submittedTo: [''],
      clientTypeId: [''],
      stateProvinceId: [''],
      municipality: [''],
      productId: [''],
      maxAmount: [''],
      currencyCode: ['']
    });
  }

  private removeEmptyParams(params: any): any {
    const populatedParams: any = {};
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== '' && value !== null && value !== undefined) {
        populatedParams[key] = value;
      }
    });
    return populatedParams;
  }

  private validateFilters(): boolean {
    this.filterError = creditFilterError(this.creditApplicationsForm.value);
    if (!this.filterError && this.creditApplicationsForm.invalid) this.filterError = extract('credits.invalidDate');
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
        this.selectedApplicationIds.delete(loanId);
        this.selectedApplications.delete(loanId);
        return;
      }
      if (this.canSelect(refreshedApplication)) {
        this.selectedApplications.set(loanId, refreshedApplication);
      } else {
        this.selectedApplicationIds.delete(loanId);
        this.selectedApplications.delete(loanId);
      }
    });
  }

  private mergeStatusOptions(applications: any[]): void {
    const options = new Map(
      this.statusOptions.map((option) => [
        `${option.id ?? option.code}`,
        option
      ])
    );
    applications.forEach((application) => {
      const status = application?.status;
      if (!status || typeof status !== 'object' || (status.id === undefined && !status.code)) {
        return;
      }
      options.set(`${status.id ?? status.code}`, {
        id: status.id,
        code: status.code,
        value: status.value,
        displayLabel: status.value || status.code
      });
    });
    this.statusOptions = Array.from(options.values());
  }
}
