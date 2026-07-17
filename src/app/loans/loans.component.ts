/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBar } from '@angular/material/progress-bar';

/** rxjs Imports */
import { Subject, from, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';

/** Custom Services */
import { LoansService } from './loans.service';
import { AccountNumberComponent } from '../shared/account-number/account-number.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { nameInitials } from 'app/core/utils/name-initials';

type Severity = 'active' | 'arrears' | 'pending' | 'closed' | 'rejected' | 'neutral';
type SortColumn = '' | 'borrower' | 'status' | 'accountNo' | 'principal' | 'product';
type SortDirection = '' | 'asc' | 'desc';

/** First page is small for a fast first paint; the remaining pages are fetched in parallel behind it. */
const FIRST_CHUNK = 100;
const NEXT_CHUNK = 500;
/** Cap on concurrent /loans requests during the background load, to avoid overwhelming the backend. */
const MAX_PARALLEL_REQUESTS = 6;

/**
 * Loans list component.
 *
 * Loans are loaded progressively (first chunk fast, the rest in the background), and
 * search, status filtering, sorting, and pagination all run on the client, so they
 * cover every loan rather than just one server page.
 */
@Component({
  selector: 'mifosx-loans',
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBar,
    AccountNumberComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansComponent implements OnInit {
  private loansService = inject(LoansService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /**
   * Loaded pages keyed by their request offset. Chunks are fetched in parallel and can
   * arrive out of order, so the flat list is rebuilt in offset order to keep row order
   * deterministic run-to-run.
   */
  private chunks = new Map<number, any[]>();
  /** Full loan set loaded so far, flattened from `chunks` (all client-side operations run against this). */
  private allLoans: any[] = [];
  /** Result of the current filter + sort, cached so page navigation only re-slices. */
  private viewRows: any[] = [];
  /** Loans on the current page after filtering and sorting. */
  pagedLoans: any[] = [];

  /** Row count after the closed-accounts filter and search — drives the pager and badge. */
  totalRows = 0;

  /** True while loans are still streaming in from the server. */
  isLoading = false;

  pageSize = 50;
  pageSizeOptions = [
    25,
    50,
    100,
    200
  ];
  currentPage = 0;

  filterText = '';
  showClosedAccounts = false;
  sortColumn: SortColumn = '';
  sortDirection: SortDirection = '';

  /** Sortable list-header columns, rendered in order after the two unlabeled rail/avatar cells. */
  readonly sortColumns: { key: SortColumn; label: string }[] = [
    { key: 'borrower', label: 'labels.inputs.Borrower' },
    { key: 'status', label: 'labels.inputs.Status' },
    { key: 'accountNo', label: 'labels.inputs.Loan Account' },
    { key: 'principal', label: 'labels.inputs.Principal' },
    { key: 'product', label: 'labels.inputs.Loan Product' }
  ];

  /** Flat office list for the office filter (populated once, independent of loan loading). */
  offices: any[] = [];
  selectedOfficeId: number | null = null;

  /** Basic loan product list for the product filter (populated once, independent of loan loading). */
  loanProducts: any[] = [];
  selectedLoanProductId: number | null = null;

  private searchInput$ = new Subject<string>();

  constructor() {
    this.searchInput$
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((text: string) => {
        this.filterText = text;
        this.currentPage = 0;
        this.applyView();
      });
  }

  ngOnInit() {
    this.isLoading = true;
    this.loadAllLoans();
    this.loansService
      .getOffices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((offices) => {
        this.offices = offices ?? [];
        this.cdr.markForCheck();
      });
    this.loansService
      .getLoanProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loanProducts) => {
        this.loanProducts = loanProducts ?? [];
        this.cdr.markForCheck();
      });
  }

  get hasResults(): boolean {
    return this.totalRows > 0;
  }

  onSearchInput(value: string) {
    this.searchInput$.next(value.trim().toLowerCase());
  }

  clearSearch(searchInput: HTMLInputElement) {
    searchInput.value = '';
    this.onSearchInput('');
  }

  toggleShowClosed() {
    this.showClosedAccounts = !this.showClosedAccounts;
    this.currentPage = 0;
    this.applyView();
  }

  /** Sets the sort column/direction, cycling asc → desc → none on repeated clicks. */
  setSort(column: SortColumn) {
    if (this.sortColumn === column) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortColumn = '';
        this.sortDirection = '';
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 0;
    this.applyView();
  }

  goToPage(page: number) {
    const clamped = Math.min(Math.max(page, 0), this.totalPages() - 1);
    if (clamped === this.currentPage) return;
    this.currentPage = clamped;
    this.updatePage();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0;
    this.updatePage();
  }

  onOfficeChange(value: string) {
    this.selectedOfficeId = value ? Number(value) : null;
    this.currentPage = 0;
    this.applyView();
  }

  onLoanProductChange(value: string) {
    this.selectedLoanProductId = value ? Number(value) : null;
    this.currentPage = 0;
    this.applyView();
  }

  rangeStart(): number {
    return this.totalRows === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  rangeEnd(): number {
    const end = (this.currentPage + 1) * this.pageSize;
    return end > this.totalRows ? this.totalRows : end;
  }

  totalPages(): number {
    return this.pageSize > 0 ? Math.max(1, Math.ceil(this.totalRows / this.pageSize)) : 1;
  }

  /**
   * Loads all loans. The first (small) page is fetched on its own so the list paints
   * quickly and to learn the total; the remaining pages are then fetched in parallel
   * (capped at MAX_PARALLEL_REQUESTS) and rendered as each one arrives.
   */
  private loadAllLoans() {
    this.loansService
      .getLoansPage(0, FIRST_CHUNK)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page: any) => {
          const items: any[] = page?.pageItems ?? [];
          const total: number = page?.totalFilteredRecords ?? items.length;
          this.storeChunk(0, items);

          const offsets: number[] = [];
          for (let offset = FIRST_CHUNK; offset < total; offset += NEXT_CHUNK) {
            offsets.push(offset);
          }
          if (offsets.length === 0) {
            this.isLoading = false;
            this.applyView();
            return;
          }

          from(offsets)
            .pipe(
              mergeMap(
                (offset) =>
                  this.loansService.getLoansPage(offset, NEXT_CHUNK).pipe(
                    map((page: any) => ({ offset, page })),
                    // A failed chunk must not abort the merged stream; skip it and keep the rest loading.
                    catchError((error) => {
                      console.error(`Failed to load loans at offset ${offset}:`, error);
                      return of(null);
                    })
                  ),
                MAX_PARALLEL_REQUESTS
              ),
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
              next: (result: { offset: number; page: any } | null) => {
                if (result?.page?.pageItems) {
                  this.storeChunk(result.offset, result.page.pageItems);
                }
              },
              complete: () => {
                this.isLoading = false;
                this.applyView();
                if (this.allLoans.length < total) {
                  console.warn(`Loans list: loaded ${this.allLoans.length} of ${total} loans (failed or short pages).`);
                }
              }
            });
        },
        error: (error) => {
          console.error('Failed to load loans:', error);
          this.isLoading = false;
          this.applyView();
        }
      });
  }

  /** Decorates and stores a page of loans under its offset, then schedules a re-render. */
  private storeChunk(offset: number, items: any[]) {
    this.chunks.set(
      offset,
      items.map((loan) => this.decorate(loan))
    );
    this.allLoans = Array.from(this.chunks.keys())
      .sort((a, b) => a - b)
      .flatMap((key) => this.chunks.get(key));
    this.scheduleApplyView();
  }

  /**
   * Coalesces applyView calls to one per animation frame, so a burst of parallel chunk
   * arrivals re-filters/re-sorts the growing set once instead of once per response.
   */
  private applyViewScheduled = false;
  private scheduleApplyView() {
    if (this.applyViewScheduled) return;
    this.applyViewScheduled = true;
    requestAnimationFrame(() => {
      this.applyViewScheduled = false;
      this.applyView();
    });
  }

  /** Precomputes display and search fields so template bindings don't recompute each change-detection cycle. */
  private decorate(loan: any): any {
    const borrowerName = loan.clientName || loan.group?.name || loan.groupName || '';
    const severity = this.severity(loan);
    loan._borrowerName = borrowerName;
    loan._initials = nameInitials(borrowerName);
    loan._borrowerRoute = this.getBorrowerRoute(loan);
    loan._viewRoute = [
      loan.id,
      'general'
    ];
    loan._severity = severity;
    // Single source of truth for "dead account": drives both the closed-accounts filter and the faded styling.
    loan._isClosed = severity === 'closed' || severity === 'rejected';
    // Client loans carry office at the top level; group loans only have it nested.
    loan._officeId = loan.clientOfficeId ?? loan.group?.officeId ?? null;
    loan._search = [
      loan.id,
      loan.accountNo,
      borrowerName,
      loan.loanProductName,
      loan.status?.value
    ]
      .filter((value: any) => value !== undefined && value !== null)
      .join(' ')
      .toLowerCase();
    return loan;
  }

  /** Applies the closed-accounts filter, search, and sort to the loaded set, then repages. */
  private applyView() {
    const officeId = this.selectedOfficeId;
    const productId = this.selectedLoanProductId;
    const text = this.filterText;
    const rows = this.allLoans.filter(
      (loan) =>
        (this.showClosedAccounts || !loan._isClosed) &&
        (officeId === null || loan._officeId === officeId) &&
        (productId === null || loan.loanProductId === productId) &&
        (!text || loan._search.includes(text))
    );
    if (this.sortColumn && this.sortDirection) {
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a, b) => this.compareBy(a, b, this.sortColumn) * direction);
    }
    this.viewRows = rows;
    this.updatePage();
  }

  /** Re-slices the cached filtered/sorted rows for the current page — no re-filter or re-sort. */
  private updatePage() {
    this.totalRows = this.viewRows.length;
    const maxPage = this.totalPages() - 1;
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    const start = this.currentPage * this.pageSize;
    this.pagedLoans = this.viewRows.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  private compareBy(a: any, b: any, column: SortColumn): number {
    const keyA = this.sortKey(a, column);
    const keyB = this.sortKey(b, column);
    if (typeof keyA === 'number' && typeof keyB === 'number') {
      return keyA - keyB;
    }
    return String(keyA).localeCompare(String(keyB), undefined, { numeric: true, sensitivity: 'base' });
  }

  private sortKey(loan: any, column: SortColumn): string | number {
    switch (column) {
      case 'borrower':
        return loan._borrowerName || '';
      case 'status':
        return loan.status?.value || '';
      case 'accountNo':
        return loan.accountNo || '';
      case 'principal':
        return typeof loan.principal === 'number' ? loan.principal : Number(loan.principal) || 0;
      case 'product':
        return loan.loanProductName || '';
      default:
        return '';
    }
  }

  /** Borrower route for client or group loans, empty when neither is present. */
  private getBorrowerRoute(loan: any): any[] {
    if (loan.clientId) {
      return [
        '/clients',
        loan.clientId,
        'general'
      ];
    }
    if (loan.group?.id || loan.groupId) {
      return [
        '/groups',
        loan.group?.id || loan.groupId,
        'general'
      ];
    }
    return [];
  }

  /** UI severity class for a loan row, driven by the status Fineract returns. */
  private severity(loan: any): Severity {
    if (loan.status?.overpaid) return 'pending';
    // Active-but-overdue loans are flagged as 'arrears' (needs attention), not faded like dead accounts.
    if (loan.status?.active) return loan.inArrears ? 'arrears' : 'active';
    if (loan.status?.pendingApproval || loan.status?.waitingForDisbursal) return 'pending';
    const statusId = loan.status?.id;
    if (loan.status?.rejected || loan.status?.withdrawnByClient || statusId === 400 || statusId === 500) {
      return 'rejected';
    }
    if (loan.status?.closed || statusId === 600 || statusId === 601 || statusId === 602) return 'closed';
    return 'neutral';
  }
}
