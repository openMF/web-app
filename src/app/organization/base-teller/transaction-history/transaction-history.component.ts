/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { finalize, Subscription } from 'rxjs';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import {
  TransactionHistoryContext,
  TransactionHistoryDenominationLine,
  TransactionHistoryDenominations,
  TransactionHistoryDetail,
  TransactionHistoryFilters,
  TransactionHistoryItem,
  TransactionHistoryOption,
  TransactionHistoryReceipt,
  TransactionHistoryReport,
  TransactionHistorySort,
  TransactionHistoryTotals
} from './transaction-history.models';
import { TransactionHistoryService } from './transaction-history.service';

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const fromDate = control.get('fromDate')?.value as Date | null;
  const toDate = control.get('toDate')?.value as Date | null;
  return fromDate && toDate && fromDate > toDate ? { dateRange: true } : null;
};

@Component({
  selector: 'mifosx-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDividerModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistoryComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(TransactionHistoryService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private searchSubscription?: Subscription;
  private detailSubscription?: Subscription;
  private denominationSubscription?: Subscription;
  private receiptSubscription?: Subscription;

  readonly filtersForm = this.formBuilder.group(
    {
      fromDate: this.formBuilder.control<Date | null>(null),
      toDate: this.formBuilder.control<Date | null>(null),
      tellerId: this.formBuilder.control<number | null>(null),
      currencyCode: this.formBuilder.control('', { nonNullable: true }),
      status: this.formBuilder.control('', { nonNullable: true }),
      type: this.formBuilder.control('', { nonNullable: true }),
      operation: this.formBuilder.control('', { nonNullable: true }),
      concept: this.formBuilder.control('', { nonNullable: true }),
      reference: this.formBuilder.control('', { nonNullable: true, validators: [Validators.maxLength(200)] })
    },
    { validators: dateRangeValidator }
  );
  readonly displayedColumns = [
    'transactionDate',
    'operation',
    'inflow',
    'outflow',
    'currencyCode',
    'concept',
    'status',
    'reference',
    'teller',
    'actions'
  ];
  readonly denominationColumns = [
    'currency',
    'type',
    'denomination',
    'quantity',
    'amount'
  ];
  readonly reportColumns = [
    'transactionDate',
    'operation',
    'inflow',
    'outflow',
    'currencyCode',
    'concept',
    'status',
    'reference'
  ];
  readonly pageSizeOptions = [
    10,
    25,
    50,
    100
  ];

  context?: TransactionHistoryContext;
  items: TransactionHistoryItem[] = [];
  totals: TransactionHistoryTotals[] = [];
  detail?: TransactionHistoryDetail;
  denominations?: TransactionHistoryDenominations;
  receipt?: TransactionHistoryReceipt;
  report?: TransactionHistoryReport;
  printMode?: 'receipt' | 'report';
  totalFilteredRecords = 0;
  pageIndex = 0;
  pageSize = 25;
  sort: TransactionHistorySort = 'transactionDate';
  order: 'ASC' | 'DESC' = 'DESC';
  contextLoading = false;
  searchLoading = false;
  detailLoading = false;
  denominationLoading = false;
  receiptLoading = false;
  reportLoading = false;
  contextError = '';
  searchError = '';
  detailError = '';
  denominationError = '';
  receiptError = '';
  reportError = '';
  hasSearched = false;

  ngOnInit(): void {
    this.loadContext();
    this.search();
  }

  loadContext(): void {
    this.contextLoading = true;
    this.contextError = '';
    this.service
      .getContext()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.contextLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (context) => (this.context = context),
        error: () => (this.contextError = 'transactionHistory.errors.context')
      });
  }

  applyFilters(): void {
    this.filtersForm.markAllAsTouched();
    if (this.filtersForm.invalid) {
      return;
    }
    this.pageIndex = 0;
    this.search();
  }

  clearFilters(): void {
    this.filtersForm.reset({
      fromDate: null,
      toDate: null,
      tellerId: null,
      currencyCode: '',
      status: '',
      type: '',
      operation: '',
      concept: '',
      reference: ''
    });
    this.pageIndex = 0;
    this.sort = 'transactionDate';
    this.order = 'DESC';
    this.search();
  }

  search(): void {
    this.searchSubscription?.unsubscribe();
    this.searchLoading = true;
    this.searchError = '';
    this.searchSubscription = this.service
      .search(this.activeFilters(true))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.searchLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.items = result.items ?? [];
          this.totalFilteredRecords = result.totalFilteredRecords ?? 0;
          this.totals = result.totalsByCurrency ?? [];
          this.hasSearched = true;
        },
        error: () => {
          this.items = [];
          this.totals = [];
          this.totalFilteredRecords = 0;
          this.hasSearched = true;
          this.searchError = 'transactionHistory.errors.search';
        }
      });
  }

  changePage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.search();
  }

  changeSort(event: Sort): void {
    if (!event.active || !event.direction) {
      this.sort = 'transactionDate';
      this.order = 'DESC';
    } else {
      this.sort = event.active as TransactionHistorySort;
      this.order = event.direction === 'asc' ? 'ASC' : 'DESC';
    }
    this.pageIndex = 0;
    this.search();
  }

  openDetail(item: TransactionHistoryItem): void {
    this.detailSubscription?.unsubscribe();
    this.denominationSubscription?.unsubscribe();
    this.receiptSubscription?.unsubscribe();
    this.detailLoading = true;
    this.detailError = '';
    this.detail = undefined;
    this.denominations = undefined;
    this.denominationError = '';
    this.receipt = undefined;
    this.receiptError = '';
    this.detailSubscription = this.service
      .getDetail(item.historyId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.detailLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (detail) => (this.detail = detail),
        error: () => (this.detailError = 'transactionHistory.errors.detail')
      });
  }

  loadDenominations(): void {
    if (!this.detail) {
      return;
    }
    const historyId = this.detail.historyId;
    this.denominationSubscription?.unsubscribe();
    this.denominationLoading = true;
    this.denominationError = '';
    this.denominationSubscription = this.service
      .getDenominations(historyId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.denominationLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (denominations) => {
          if (denominations.historyId === historyId && this.detail?.historyId === historyId) {
            this.denominations = denominations;
          }
        },
        error: () => {
          if (this.detail?.historyId === historyId) {
            this.denominationError = 'transactionHistory.errors.denominations';
          }
        }
      });
  }

  reprintReceipt(): void {
    if (!this.detail) {
      return;
    }
    const historyId = this.detail.historyId;
    this.receiptSubscription?.unsubscribe();
    this.receiptLoading = true;
    this.receiptError = '';
    this.receiptSubscription = this.service
      .getReceipt(historyId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.receiptLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          if (receipt.historyId !== historyId || this.detail?.historyId !== historyId) {
            return;
          }
          this.receipt = receipt;
          this.printMode = 'receipt';
          this.cdr.detectChanges();
          setTimeout(() => {
            if (this.receipt?.historyId === historyId && this.detail?.historyId === historyId) {
              window.print();
            }
          });
        },
        error: () => {
          if (this.detail?.historyId === historyId) {
            this.receiptError = 'transactionHistory.errors.receiptUnavailable';
          }
        }
      });
  }

  printResults(): void {
    this.reportLoading = true;
    this.reportError = '';
    this.service
      .getReport(this.activeFilters(false))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.reportLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (report) => {
          this.report = report;
          this.printMode = 'report';
          this.cdr.detectChanges();
          setTimeout(() => window.print());
        },
        error: () => (this.reportError = 'transactionHistory.errors.report')
      });
  }

  digitsInfo(decimalPlaces: number | null | undefined): string {
    const places = decimalPlaces ?? 2;
    return `1.${places}-${places}`;
  }

  optionLabel(options: TransactionHistoryOption[] | undefined, code: string): string {
    return options?.find((option) => option.code === code)?.label ?? code;
  }

  tellerLabel(id: number | null): string {
    const teller = this.context?.tellers.find((candidate) => candidate.id === id);
    return teller ? `${teller.code} - ${teller.name}` : '';
  }

  denominationCurrencies(kind: 'operation' | 'change'): string[] {
    return [
      ...new Set(this.denominationLines(kind).map((line) => line.currencyCode))
    ];
  }

  denominationLines(kind: 'operation' | 'change', currencyCode?: string): TransactionHistoryDenominationLine[] {
    const lines =
      kind === 'operation'
        ? (this.denominations?.operationDenominations ?? [])
        : (this.denominations?.changeDenominations ?? []);
    return currencyCode ? lines.filter((line) => line.currencyCode === currencyCode) : lines;
  }

  private activeFilters(paged: boolean): TransactionHistoryFilters {
    const value = this.filtersForm.getRawValue();
    return {
      fromDate: this.formatDate(value.fromDate),
      toDate: this.formatDate(value.toDate),
      tellerId: value.tellerId ?? undefined,
      currencyCode: value.currencyCode || undefined,
      status: value.status || undefined,
      type: value.type || undefined,
      operation: value.operation || undefined,
      concept: value.concept || undefined,
      reference: value.reference.trim() || undefined,
      offset: paged ? this.pageIndex * this.pageSize : undefined,
      limit: paged ? this.pageSize : undefined,
      sort: this.sort,
      order: this.order
    };
  }

  private formatDate(value: Date | null): string | undefined {
    if (!value) {
      return undefined;
    }
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
