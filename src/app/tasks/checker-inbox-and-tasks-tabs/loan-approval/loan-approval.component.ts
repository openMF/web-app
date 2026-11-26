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
  OnInit,
  inject,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EMPTY, catchError, finalize, forkJoin, from, map, mergeMap, of, switchMap, toArray, timeout } from 'rxjs';
import { _ as extract } from '@ngx-translate/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanApprovalMoneyPipe } from './loan-approval-money.pipe';
import { TasksService } from '../../tasks.service';
import { LoanApprovalDataService, LOAN_AGGREGATE_LIMIT } from './loan-approval-data.service';
import {
  ApprovalLoan,
  ApprovalResult,
  ApprovalReview,
  calendarDate,
  commandOutcome,
  day,
  highValue,
  minorUnits,
  missingPurpose,
  officeId,
  pendingLoan,
  reviewLoan,
  totals
} from './loan-approval.models';
import { LoanApprovalConfirmDialogComponent } from './loan-approval-confirm-dialog.component';

interface OfficeGroup {
  key: string;
  name?: string;
  loans: ApprovalLoan[];
  count: number;
}
@Component({
  selector: 'mifosx-loan-approval',
  templateUrl: './loan-approval.component.html',
  styleUrls: ['./loan-approval.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatProgressBarModule,
    LoanApprovalMoneyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanApprovalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private data = inject(LoanApprovalDataService);
  private tasks = inject(TasksService);
  private settings = inject(SettingsService);
  private auth = inject(AuthenticationService);
  private dates = inject(Dates);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private loadVersion = 0;
  private selectionVersion = 0;
  readonly loanApprovalCountChange = output<number | null>();
  readonly filters = this.fb.group(
    { search: [''], office: [''], product: [''], currency: [''], minimum: [''], maximum: [''], purpose: [''] },
    { validators: () => this.amountRangeError() }
  );
  readonly approval = this.fb.group(
    { approvedOnDate: [
        this.settings.businessDate,
        Validators.required
      ], expectedDisbursementDate: this.fb.control<Date | null>(null, Validators.required) },
    { validators: () => this.dateError() }
  );
  readonly selection = new SelectionModel<number>(true, []);
  readonly collapsed = new Set<string>();
  readonly columns = [
    'select',
    'client',
    'loan',
    'amount',
    'purpose',
    'actions'
  ];
  readonly highValue = highValue;
  readonly missingPurpose = missingPurpose;
  readonly totals = totals;
  readonly labels = {
    acrossPages: extract('loanApproval.acrossPages'),
    allPending: extract('loanApproval.allPending'),
    approveMany: extract('loanApproval.approveMany'),
    approveOne: extract('loanApproval.approveOne'),
    empty: extract('loanApproval.empty'),
    loading: extract('loanApproval.loading'),
    loanMany: extract('loanApproval.loanMany'),
    loanOne: extract('loanApproval.loanOne'),
    processing: extract('loanApproval.processing'),
    selectedMany: extract('loanApproval.selectedMany'),
    selectedOne: extract('loanApproval.selectedOne'),
    serverScope: extract('loanApproval.serverScope'),
    unknownClient: extract('loanApproval.unknownClient'),
    unknownOffice: extract('loanApproval.unknownOffice'),
    approved: extract('loanApproval.approved'),
    review: extract('loanApproval.review'),
    failed: extract('loanApproval.failed'),
    uncertain: extract('loanApproval.uncertain')
  };
  offices: { id: number; name: string }[] = [];
  loans: ApprovalLoan[] = [];
  filtered: ApprovalLoan[] = [];
  pageLoans: ApprovalLoan[] = [];
  groups: OfficeGroup[] = [];
  products: { key: string; name: string }[] = [];
  currencies: { code: string; digits: number }[] = [];
  exposures = new Map<number, ApprovalLoan[]>();
  reviews: ApprovalReview[] = [];
  excluded: ApprovalLoan[] = [];
  results: ApprovalResult[] = [];
  total: number | null = null;
  complete = false;
  loading = false;
  error = false;
  refreshError = false;
  reviewChanged = false;
  busy = false;
  prepared = false;
  amountOpen = false;
  pageIndex = 0;
  pageSize = 10;
  readonly minDate = new Date(2000, 0, 1);
  get businessDate(): Date {
    return this.settings.businessDate;
  }
  get maxDate(): Date {
    return this.settings.maxFutureDate;
  }
  get canApprove(): boolean {
    return (this.auth.getCredentials()?.permissions ?? []).some((permission: string) => [
        'ALL_FUNCTIONS',
        'APPROVE_LOAN'
      ].includes(permission));
  }
  get selectedLoans(): ApprovalLoan[] {
    return this.loans.filter((loan) => this.selection.isSelected(loan.id));
  }
  get pageRequested() {
    return totals(this.pageLoans);
  }
  get selectedRequested() {
    return totals(this.selectedLoans);
  }
  get highValueCount(): number {
    return this.pageLoans.filter(highValue).length;
  }
  get missingCount(): number {
    return this.pageLoans.filter(missingPurpose).length;
  }
  get paginatorLength(): number {
    return this.complete ? this.filtered.length : (this.total ?? this.loans.length);
  }
  get pageCount(): number {
    return Math.max(1, Math.ceil(this.paginatorLength / this.pageSize));
  }
  get approvalDisabled(): boolean {
    return (
      !this.canApprove ||
      !this.prepared ||
      this.busy ||
      this.loading ||
      this.error ||
      this.total === null ||
      !this.reviews.length ||
      this.approval.invalid ||
      this.selectedRequested === null
    );
  }

  ngOnInit(): void {
    this.filters.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.clearSelection();
      if (!this.complete && this.pageIndex) {
        this.pageIndex = 0;
        this.loadPage();
      } else {
        this.pageIndex = 0;
        this.updateView();
      }
    });
    this.load();
  }
  load(): void {
    if (this.busy) return;
    const version = ++this.loadVersion;
    this.loading = true;
    this.error = false;
    this.clearSelection();
    forkJoin({ snapshot: this.data.page(LOAN_AGGREGATE_LIMIT, 0), offices: this.tasks.getAllOffices() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (version === this.loadVersion) {
            this.loading = false;
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: ({ snapshot, offices }) => {
          if (version !== this.loadVersion) return;
          this.pageIndex = 0;
          this.complete = snapshot.complete;
          this.total = snapshot.total;
          this.loanApprovalCountChange.emit(this.total);
          this.offices = Array.isArray(offices) ? offices : [];
          this.loans = this.complete ? snapshot.rows : snapshot.rows.slice(0, this.pageSize);
          this.updateOptions();
          this.updateView();
        },
        error: () => {
          if (version !== this.loadVersion) return;
          this.error = true;
          this.loans = [];
          this.total = null;
          this.complete = false;
          this.loanApprovalCountChange.emit(null);
          this.updateView();
        }
      });
  }
  private loadPage(): void {
    const version = ++this.loadVersion;
    this.loading = true;
    this.error = false;
    this.clearSelection();
    this.pageLoans = [];
    this.groups = [];
    this.data
      .page(this.pageSize, this.pageIndex * this.pageSize)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (version === this.loadVersion) {
            this.loading = false;
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: (snapshot) => {
          if (version !== this.loadVersion) return;
          if (snapshot.total !== null && this.pageIndex > 0 && this.pageIndex * this.pageSize >= snapshot.total) {
            this.pageIndex = Math.max(0, Math.ceil(snapshot.total / this.pageSize) - 1);
            this.loadPage();
            return;
          }
          this.loans = snapshot.rows;
          this.total = snapshot.total;
          this.loanApprovalCountChange.emit(this.total);
          this.updateOptions();
          this.updateView();
        },
        error: () => {
          if (version !== this.loadVersion) return;
          this.error = true;
          this.loans = [];
          this.updateView();
        }
      });
  }
  private updateOptions(): void {
    this.products = [
      ...new Map(
        this.loans.map((loan) => [
          this.productKey(loan),
          { key: this.productKey(loan), name: loan.loanProductName ?? '' }
        ])
      ).values()
    ];
    this.currencies = [
      ...new Map(
        this.loans
          .filter((loan) => loan.currency)
          .map((loan) => [
            loan.currency.code,
            { code: loan.currency.code, digits: loan.currency.decimalPlaces }
          ])
      ).values()
    ];
    this.filters.updateValueAndValidity({ emitEvent: false });
    this.exposures.clear();
    for (const loan of this.loans)
      if (loan.clientId != null)
        this.exposures.set(loan.clientId, [
          ...(this.exposures.get(loan.clientId) ?? []),
          loan
        ]);
  }
  productKey(loan: ApprovalLoan): string {
    return String(loan.loanProductId ?? loan.loanProductName ?? '');
  }
  private amountRangeError(): { amountRange: true } | null {
    if (!this.filters) return null;
    const f = this.filters.getRawValue();
    if (!f.minimum && !f.maximum) return null;
    const currency = this.currencies?.find((item) => item.code === f.currency);
    if (!currency) return { amountRange: true };
    const min = f.minimum ? minorUnits(f.minimum, currency.digits) : 0n;
    const max = f.maximum ? minorUnits(f.maximum, currency.digits) : null;
    return min === null || (f.maximum && max === null) || (max !== null && min > max) ? { amountRange: true } : null;
  }
  private dateError(): { approvalDates: true } | null {
    if (!this.approval) return null;
    const { approvedOnDate: approved, expectedDisbursementDate: expected } = this.approval.getRawValue();
    if (
      !(approved instanceof Date) ||
      !(expected instanceof Date) ||
      !Number.isFinite(day(approved)) ||
      !Number.isFinite(day(expected)) ||
      !Number.isFinite(this.businessDate?.getTime()) ||
      day(approved) > day(this.businessDate) ||
      day(approved) < day(this.minDate) ||
      day(expected) < day(approved) ||
      !Number.isFinite(this.maxDate?.getTime()) ||
      day(expected) > day(this.maxDate) ||
      this.reviews?.some((review) => day(approved) < day(review.submitted))
    )
      return { approvalDates: true };
    return null;
  }
  updateView(): void {
    const f = this.filters.getRawValue();
    const search = (f.search ?? '').trim().toLocaleLowerCase();
    const currency = this.currencies.find((item) => item.code === f.currency);
    const min = f.minimum && currency ? minorUnits(f.minimum, currency.digits) : null;
    const max = f.maximum && currency ? minorUnits(f.maximum, currency.digits) : null;
    this.filtered = this.filters.invalid
      ? []
      : this.loans.filter((loan) => {
          const value = minorUnits(loan.principal, loan.currency?.decimalPlaces);
          return (
            (!search ||
              [
                loan.clientName,
                loan.group?.name,
                loan.accountNo,
                loan.loanProductName
              ].some((text) =>
                String(text ?? '')
                  .toLocaleLowerCase()
                  .includes(search)
              )) &&
            (!f.office || String(officeId(loan) ?? '') === f.office) &&
            (!f.product || this.productKey(loan) === f.product) &&
            (!f.currency || loan.currency?.code === f.currency) &&
            (min === null || (value !== null && value >= min)) &&
            (max === null || (value !== null && value <= max)) &&
            (!f.purpose || (f.purpose === 'missing' ? missingPurpose(loan) : !missingPurpose(loan)))
          );
        });
    if (this.complete)
      this.pageIndex = Math.min(this.pageIndex, Math.max(0, Math.ceil(this.filtered.length / this.pageSize) - 1));
    this.pageLoans = this.complete
      ? this.filtered.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize)
      : this.filtered;
    const groups = new Map<string, OfficeGroup>();
    for (const loan of this.pageLoans) {
      const key = String(officeId(loan) ?? 'unknown');
      const group = groups.get(key) ?? {
        key,
        name: this.offices.find((office) => String(office.id) === key)?.name,
        loans: [],
        count: this.filtered.filter((item) => String(officeId(item) ?? 'unknown') === key).length
      };
      group.loans.push(loan);
      groups.set(key, group);
    }
    this.groups = [...groups.values()];
    this.cdr.markForCheck();
  }
  reset(): void {
    this.filters.reset({ search: '', office: '', product: '', currency: '', minimum: '', maximum: '', purpose: '' });
  }
  paginate(event: PageEvent): void {
    if (this.busy || this.loading) return;
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // Cross-page selection is available only for a complete snapshot; server pages are explicitly page-scoped.
    if (!this.complete) this.loadPage();
    else this.updateView();
  }
  selectable(loan: ApprovalLoan): boolean {
    return this.canApprove && pendingLoan(loan) && !this.data.locked(loan.id);
  }
  allSelected(rows: ApprovalLoan[]): boolean {
    const eligible = rows.filter((loan) => this.selectable(loan));
    return !!eligible.length && eligible.every((loan) => this.selection.isSelected(loan.id));
  }
  someSelected(rows: ApprovalLoan[]): boolean {
    return rows.some((loan) => this.selection.isSelected(loan.id)) && !this.allSelected(rows);
  }
  togglePage(rows: ApprovalLoan[]): void {
    if (this.busy || this.loading) return;
    const all = this.allSelected(rows);
    for (const loan of rows.filter((loan) => this.selectable(loan)))
      all ? this.selection.deselect(loan.id) : this.selection.select(loan.id);
    this.selectionChanged();
  }
  toggle(loan: ApprovalLoan): void {
    if (!this.busy && !this.loading && this.selectable(loan)) {
      this.selection.toggle(loan.id);
      this.selectionChanged();
    }
  }
  selectOffice(key: string): void {
    if (this.complete) this.togglePage(this.filtered.filter((loan) => String(officeId(loan) ?? 'unknown') === key));
  }
  clearSelection(): void {
    this.selectionVersion++;
    this.selection.clear();
    this.prepared = false;
    this.reviews = [];
    this.excluded = [];
  }
  private selectionChanged(): void {
    this.selectionVersion++;
    if (this.approval.controls.approvedOnDate.pristine)
      this.approval.controls.approvedOnDate.setValue(this.businessDate);
    this.prepared = false;
    this.reviews = [];
    this.excluded = [];
    const expected = this.selectedLoans.map((loan) =>
      calendarDate(loan.timeline?.expectedDisbursementDate ?? loan.expectedDisbursementDate)
    );
    const common =
      expected.length && expected.every((date) => date && day(date) === day(expected[0])) ? expected[0] : null;
    if (this.approval.controls.expectedDisbursementDate.pristine)
      this.approval.controls.expectedDisbursementDate.setValue(common);
  }
  initials(loan: ApprovalLoan): string {
    return (loan.clientName ?? loan.group?.name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toLocaleUpperCase();
  }
  loanLink(loan: ApprovalLoan): (string | number)[] {
    return loan.clientId ? [
          '/clients',
          loan.clientId,
          'loans-accounts',
          loan.id
        ] : [
          '/groups',
          loan.group?.id,
          'loans-accounts',
          loan.id
        ];
  }
  clientLink(loan: ApprovalLoan): (string | number)[] {
    return loan.clientId ? [
          '/clients',
          loan.clientId,
          'general'
        ] : [
          '/groups',
          loan.group?.id,
          'general'
        ];
  }
  exposure(loan: ApprovalLoan): ApprovalLoan[] {
    return loan.clientId == null ? [] : (this.exposures.get(loan.clientId) ?? []);
  }
  prepare(): void {
    if (
      !this.canApprove ||
      this.busy ||
      this.loading ||
      this.error ||
      this.total === null ||
      !this.selection.hasValue()
    )
      return;
    const version = this.selectionVersion;
    this.reviewChanged = false;
    this.busy = true;
    this.prepared = false;
    this.reviews = [];
    this.excluded = [];
    from(this.selectedLoans)
      .pipe(
        mergeMap(
          (loan) =>
            this.data.review(loan).pipe(
              timeout(30000),
              map(({ detail, template }) => ({ loan, review: reviewLoan(loan, detail, template) })),
              catchError(() => of({ loan, review: null }))
            ),
          4
        ),
        toArray(),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((items) => {
        if (version !== this.selectionVersion) return;
        this.reviews = items.flatMap((item) => (item.review ? [item.review] : []));
        this.excluded = items.filter((item) => !item.review).map((item) => item.loan);
        for (const loan of this.excluded) this.selection.deselect(loan.id);
        this.prepared = true;
        if (this.approval.controls.expectedDisbursementDate.pristine) {
          const common =
            this.reviews.length &&
            this.reviews.every((review) => day(review.expected) === day(this.reviews[0].expected))
              ? this.reviews[0].expected
              : null;
          this.approval.controls.expectedDisbursementDate.setValue(common);
        }
        this.approval.updateValueAndValidity();
      });
  }
  approve(): void {
    this.approval.updateValueAndValidity();
    if (this.approvalDisabled) return;
    const reviews = [...this.reviews];
    const version = this.selectionVersion;
    const { approvedOnDate, expectedDisbursementDate } = this.approval.getRawValue();
    const dateFormat = this.settings.dateFormat;
    const approved = this.dates.formatDate(approvedOnDate, dateFormat);
    const expected = this.dates.formatDate(expectedDisbursementDate, dateFormat);
    const locale = this.settings.language.code;
    const batches = reviews.map((review, index) => ({
      requestId: index + 1,
      relativeUrl: `loans/${review.loan.id}?command=approve`,
      method: 'POST',
      // Bulk approval preserves the backend principal; never send an amount override from a prior read.
      body: JSON.stringify({
        dateFormat,
        locale,
        approvedOnDate: approved,
        expectedDisbursementDate: expected
      })
    }));
    this.busy = true;
    this.filters.disable({ emitEvent: false });
    this.approval.disable({ emitEvent: false });
    this.dialog
      .open(LoanApprovalConfirmDialogComponent, {
        width: '640px',
        maxWidth: '96vw',
        disableClose: false,
        data: {
          loans: reviews.map((review) => review.loan),
          totals: this.selectedRequested,
          approved,
          expected,
          excluded: this.excluded
        }
      })
      .afterClosed()
      .pipe(
        switchMap((confirmed) => {
          if (
            confirmed !== true ||
            !this.canApprove ||
            version !== this.selectionVersion ||
            reviews.some((review) => this.data.locked(review.loan.id))
          ) {
            this.release();
            return EMPTY;
          }
          // This API exposes no client version/If-Match precondition. Revalidate all reads before any POST;
          // the remaining read-to-command race requires backend support for atomic snapshot enforcement.
          return from(reviews).pipe(
            mergeMap(
              (review) =>
                this.data.review(review.loan).pipe(
                  timeout(30000),
                  map(({ detail, template }) => {
                    const latest = reviewLoan(review.loan, detail, template);
                    return latest !== null && latest.fingerprint === review.fingerprint;
                  }),
                  catchError(() => of(false))
                ),
              4
            ),
            toArray(),
            map((matches) => matches.length === reviews.length && matches.every(Boolean))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((unchanged) => {
        if (
          !unchanged ||
          !this.canApprove ||
          version !== this.selectionVersion ||
          this.dateError() ||
          reviews.some((review) => this.data.locked(review.loan.id))
        ) {
          this.reviewChanged = true;
          this.release();
          this.load();
          return;
        }
        const locked: number[] = [];
        for (const review of reviews) {
          if (!this.data.lock(review.loan.id)) {
            // Nothing has been submitted: do not POST without a durable attempt marker.
            for (const id of locked) this.data.unlock(id);
            this.clearSelection();
            this.excluded = reviews.map((item) => item.loan);
            this.release();
            return;
          }
          locked.push(review.loan.id);
        }
        // Exactly one POST. Timeouts and transport failures become uncertain outcomes; never retry commands.
        this.tasks
          .submitBatchData(batches)
          .pipe(
            timeout(60000),
            catchError(() => of(null)),
            switchMap((response) =>
              from(reviews).pipe(
                mergeMap((review, index) => {
                  const outcome = commandOutcome(response, index + 1, review.loan.id);
                  return this.data.detail(review.loan.id).pipe(
                    timeout(30000),
                    map((detail) => {
                      const identity = detail.id === review.loan.id && detail.accountNo === review.loan.accountNo;
                      if (identity && pendingLoan(detail) && outcome === 'failed') this.data.unlock(review.loan.id);
                      const approvedState = identity && [
                          200,
                          300
                        ].includes(detail.status?.id) && !detail.status?.pendingApproval;
                      return {
                        loan: review.loan,
                        outcome: approvedState
                          ? 'approved'
                          : identity && pendingLoan(detail) && outcome === 'failed'
                            ? 'failed'
                            : identity && pendingLoan(detail) && outcome === 'review'
                              ? 'review'
                              : 'uncertain'
                      } as ApprovalResult;
                    }),
                    catchError(() =>
                      of({
                        loan: review.loan,
                        outcome: outcome === 'failed' || outcome === 'review' ? outcome : 'uncertain'
                      } as ApprovalResult)
                    )
                  );
                }, 4),
                toArray()
              )
            ),
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.release())
          )
          .subscribe((results) => {
            this.results = results;
            this.clearSelection();
            this.refreshError = false;
            const refreshVersion = ++this.loadVersion;
            this.loading = true;
            // Read only reconciliation refresh; locks prevent replay when a refresh fails or the queue is reopened.
            this.data
              .page(
                this.complete ? LOAN_AGGREGATE_LIMIT : this.pageSize,
                this.complete ? 0 : this.pageIndex * this.pageSize
              )
              .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => {
                  if (refreshVersion === this.loadVersion) {
                    this.loading = false;
                    this.cdr.markForCheck();
                  }
                })
              )
              .subscribe({
                next: (snapshot) => {
                  if (refreshVersion !== this.loadVersion) return;
                  if (
                    !this.complete &&
                    snapshot.total !== null &&
                    this.pageIndex > 0 &&
                    this.pageIndex * this.pageSize >= snapshot.total
                  ) {
                    this.pageIndex = Math.max(0, Math.ceil(snapshot.total / this.pageSize) - 1);
                    this.loadPage();
                    return;
                  }
                  if (this.complete && !snapshot.complete) this.pageIndex = 0;
                  this.loans =
                    !snapshot.complete && this.complete ? snapshot.rows.slice(0, this.pageSize) : snapshot.rows;
                  this.total = snapshot.total;
                  this.complete = snapshot.complete;
                  this.loanApprovalCountChange.emit(this.total);
                  this.updateOptions();
                  this.updateView();
                },
                error: () => {
                  if (refreshVersion !== this.loadVersion) return;
                  this.refreshError = true;
                  this.cdr.markForCheck();
                }
              });
          });
      });
  }
  private release(): void {
    this.busy = false;
    this.filters.enable({ emitEvent: false });
    this.approval.enable({ emitEvent: false });
    this.cdr.markForCheck();
  }
}
