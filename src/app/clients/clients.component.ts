/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableDataSource } from '@angular/material/table';

/** rxjs Imports */
import { Subject, Subscription, from, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, mergeMap, map, catchError } from 'rxjs/operators';

/** Custom Services */
import { environment } from '../../environments/environment';
import { ClientsService } from './clients.service';
import { AccountNumberComponent } from '../shared/account-number/account-number.component';
import { ExternalIdentifierComponent } from '../shared/external-identifier/external-identifier.component';
import { LegalFormId } from './models/legal-form.enum';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DateFormatPipe } from '../pipes/date-format.pipe';
import { nameInitials } from 'app/core/utils/name-initials';
import { PageLoaderComponent } from '../shared/page-loader/page-loader.component';

export const DEBOUNCE_MS = 500;

/** Chunk size used to page through the full search result set when a status filter is active. */
const FILTER_PAGE_SIZE = 100;
/** How many pages of the full result set are fetched concurrently. */
const MAX_PARALLEL_REQUESTS = 6;

type Severity = 'active' | 'pending' | 'closed' | 'rejected' | 'neutral';

/** Status buckets offered by the list's status filter, aligned with the row severity classes. */
export type StatusFilterKey = 'active' | 'pending' | 'closed' | 'rejected';

@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PageLoaderComponent,
    AccountNumberComponent,
    ExternalIdentifierComponent,
    DateFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent implements OnInit, OnDestroy {
  private clientService = inject(ClientsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  private searchInput$ = new Subject<string>();
  private clientsRequestSub: Subscription | null = null;
  private isComposing = false;

  readonly LegalFormId = LegalFormId;

  get hideClientData(): boolean {
    return environment.complianceHideClientData;
  }

  maskName(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => (part.length > 1 ? part[0] + '*'.repeat(part.length - 1) : part))
      .join(' ');
  }

  /** Name as shown in the list, masked when client data must be hidden. */
  displayedName(row: any): string {
    const name: string = row?.displayName ?? '';
    return this.hideClientData ? this.maskName(name) : name;
  }

  /** Two-letter uppercase initials from a display name. */
  initials(name: string): string {
    return nameInitials(name);
  }

  /** UI severity class for a row from its status.code. */
  severity(row: any): Severity {
    const code: string = row?.status?.code ?? '';
    if (code === 'clientStatusType.active' || code === 'clientStatusType.approved') return 'active';
    if (
      code === 'clientStatusType.pending' ||
      code === 'clientStatusType.submitted.and.pending.approval' ||
      code.includes('transfer')
    ) {
      return 'pending';
    }
    if (code === 'clientStatusType.closed' || code === 'clientStatusType.withdraw') return 'closed';
    if (code === 'clientStatusType.rejected') return 'rejected';
    return 'neutral';
  }

  /** Person/Entity label. Falls back to Person when legalForm is absent. */
  legalFormLabel(row: any): string {
    const id = row?.legalForm?.id;
    return id === LegalFormId.ENTITY ? 'labels.inputs.Entity' : 'labels.inputs.Person';
  }

  /** Picks the most relevant date for the meta line. */
  metaDate(row: any): Date | string | null {
    return row?.activationDate ?? row?.submittedOnDate ?? row?.timeline?.closedOnDate ?? null;
  }

  /** Translation key for the action verb preceding the meta date. */
  metaDateLabel(row: any): string {
    const sev = this.severity(row);
    if (sev === 'closed' || sev === 'rejected') return 'labels.text.Closed';
    if (row?.activationDate) return 'labels.text.Activated';
    return 'labels.text.Submitted';
  }

  /** Showing range, e.g. "1–50". */
  rangeStart(): number {
    if (this.totalRows === 0) return 0;
    return this.currentPage * this.pageSize + 1;
  }

  rangeEnd(): number {
    const end = (this.currentPage + 1) * this.pageSize;
    return end > this.totalRows ? this.totalRows : end;
  }

  totalPages(): number {
    return this.pageSize > 0 ? Math.max(1, Math.ceil(this.totalRows / this.pageSize)) : 1;
  }

  displayedColumns = [
    'displayName',
    'accountNumber',
    'externalId',
    'status',
    'officeName'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  existsClientsToFilter = false;
  notExistsClientsToFilter = false;

  totalRows = 0;
  isLoading = false;

  pageSize = 50;
  pageSizeOptions = [
    25,
    50,
    100
  ];
  currentPage = 0;
  filterText = '';

  sortAttribute = '';
  sortDirection = '';

  /** Status filter options, reusing the same status labels the rows already translate. */
  readonly statusFilterOptions: { key: StatusFilterKey; labelKey: string }[] = [
    { key: 'active', labelKey: 'labels.status.Active' },
    { key: 'pending', labelKey: 'labels.status.Pending' },
    { key: 'closed', labelKey: 'labels.status.Closed' },
    { key: 'rejected', labelKey: 'labels.status.Rejected' }
  ];

  /** Status buckets currently selected; empty means no status filter. */
  selectedStatuses: StatusFilterKey[] = [];

  /** Complete result set for the current search while a status filter is active. */
  private allRows: any[] = [];

  /** True when the last full-set load completed with every page (no failed or short pages). */
  private allRowsComplete = false;

  /** The search/sort key the cached allRows was loaded with. */
  private allRowsQuery: { filterText: string; sortAttribute: string; sortDirection: string } | null = null;

  ngOnInit() {
    this.searchInput$
      .pipe(debounceTime(DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value !== this.filterText) {
          this.search(value);
        }
      });

    if (environment.preloadClients) {
      this.getClients();
    }
  }

  ngOnDestroy() {
    this.clientsRequestSub?.unsubscribe();
  }

  onSearchInput(value: string) {
    if (this.isComposing) return;
    this.searchInput$.next(value);
  }

  onCompositionStart(): void {
    this.isComposing = true;
  }

  onCompositionEnd(value: string): void {
    this.isComposing = false;
    this.searchInput$.next(value);
  }

  clearSearch(searchInput: HTMLInputElement) {
    searchInput.value = '';
    this.search('');
  }

  search(value: string) {
    this.invalidateAllRows();
    this.filterText = value;
    if (this.currentPage !== 0) {
      this.resetPaginator();
      return;
    }
    this.getClients();
  }

  /**
   * Sets the sort attribute/direction and reloads from the server.
   * Called from the new list-header click handlers.
   */
  setSort(attribute: string) {
    this.invalidateAllRows();
    if (this.sortAttribute === attribute) {
      // Cycle: asc → desc → none
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortAttribute = '';
        this.sortDirection = '';
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortAttribute = attribute;
      this.sortDirection = 'asc';
    }
    this.resetPaginator();
  }

  goToPage(page: number) {
    const max = this.totalPages() - 1;
    const clamped = Math.min(Math.max(page, 0), max);
    if (clamped === this.currentPage) return;
    this.currentPage = clamped;
    this.updateView();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0;
    this.updateView();
  }

  /**
   * Updates the selected status buckets. Reuses the cached full result set when
   * the search text and sort order are unchanged, otherwise refetches from the
   * server.
   */
  onStatusFilterChange(selected: StatusFilterKey[]) {
    this.selectedStatuses = selected;
    this.currentPage = 0;
    if (this.selectedStatuses.length > 0 && this.hasCurrentCompleteRows()) {
      this.applyStatusFilter();
      return;
    }
    this.getClients();
  }

  /** Clears the status filter and restores the unfiltered list. */
  clearStatusFilter() {
    if (this.selectedStatuses.length > 0) {
      this.onStatusFilterChange([]);
    }
  }

  /**
   * Repaints the current page without refetching when a status filter is
   * active (the full result set is already loaded), and refetches the page
   * from the server otherwise.
   */
  private updateView() {
    if (this.selectedStatuses.length > 0) {
      this.applyStatusFilter();
    } else {
      this.getClients();
    }
  }

  private getClients() {
    this.clientsRequestSub?.unsubscribe();
    this.isLoading = true;
    this.cdr.markForCheck();
    if (this.selectedStatuses.length > 0) {
      this.loadAllClients();
    } else {
      this.loadClientsPage();
    }
  }

  /**
   * Loads the current server-side page, used when no status filter is active.
   */
  private loadClientsPage() {
    this.clientsRequestSub = this.clientService
      .searchByText(this.filterText, this.currentPage, this.pageSize, this.sortAttribute, this.sortDirection)
      .subscribe(
        (data: any) => {
          this.dataSource.data = data.content;
          this.totalRows = data.totalElements;
          this.existsClientsToFilter = data.numberOfElements > 0;
          this.notExistsClientsToFilter = !this.existsClientsToFilter;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        (error) => {
          console.error('Failed to load clients:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      );
  }

  /**
   * Fetches every client matching the current search text and sort order, so
   * the status filter runs over the complete result set instead of a single
   * page. Pages are fetched in concurrency-limited chunks, mirroring the loans
   * list loader. Results stay consistent across pagination because filtering
   * always happens after the whole set has arrived.
   */
  private loadAllClients() {
    this.allRows = [];
    this.allRowsComplete = false;
    this.allRowsQuery = null;
    this.clientsRequestSub = this.clientService
      .searchByText(this.filterText, 0, FILTER_PAGE_SIZE, this.sortAttribute, this.sortDirection)
      .subscribe({
        next: (firstPage: any) => {
          const chunks = new Map<number, any[]>([[
              0,
              firstPage?.content ?? []
            ]]);
          const total = firstPage?.totalElements ?? firstPage?.content?.length ?? 0;
          const lastPage = Math.max(0, Math.ceil(total / FILTER_PAGE_SIZE) - 1);

          if (lastPage === 0) {
            this.allRows = chunks.get(0) ?? [];
            this.isLoading = false;
            this.setAllRowsState(total);
            this.applyStatusFilter();
            return;
          }

          const pages: number[] = [];
          for (let page = 1; page <= lastPage; page++) {
            pages.push(page);
          }
          this.clientsRequestSub = from(pages)
            .pipe(
              mergeMap(
                (page) =>
                  this.clientService
                    .searchByText(this.filterText, page, FILTER_PAGE_SIZE, this.sortAttribute, this.sortDirection)
                    .pipe(
                      map((data: any) => ({ page, rows: data?.content ?? [] })),
                      // A failed page must not abort the merged stream; skip it and keep the rest loading.
                      catchError((error) => {
                        console.error(`Failed to load clients on page ${page}:`, error);
                        return of(null);
                      })
                    ),
                MAX_PARALLEL_REQUESTS
              )
            )
            .subscribe({
              next: (result) => {
                if (result) {
                  chunks.set(result.page, result.rows);
                }
              },
              complete: () => {
                this.allRows = Array.from(chunks.keys())
                  .sort((a, b) => a - b)
                  .flatMap((page) => chunks.get(page) ?? []);
                this.isLoading = false;
                this.setAllRowsState(total);
                this.applyStatusFilter();
              }
            });
        },
        error: (error) => {
          console.error('Failed to load clients:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Filters the complete result set down to the selected status buckets and
   * re-paginates the result client-side.
   */
  private applyStatusFilter() {
    const filtered = this.allRows.filter((row) => {
      const sev = this.severity(row);
      return sev !== 'neutral' && this.selectedStatuses.includes(sev);
    });
    const maxPage = Math.max(0, Math.ceil(filtered.length / this.pageSize) - 1);
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    this.totalRows = filtered.length;
    this.existsClientsToFilter = filtered.length > 0;
    this.notExistsClientsToFilter = !this.existsClientsToFilter;
    this.dataSource.data = filtered.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
    this.cdr.markForCheck();
  }

  /**
   * Records whether the assembled full-set load covers every server page and
   * the query key it was loaded with. An incomplete load is never cached, so a
   * later status change refetches instead of silently filtering partial data.
   */
  private setAllRowsState(total: number) {
    this.allRowsComplete = this.allRows.length >= total;
    if (this.allRowsComplete) {
      this.allRowsQuery = {
        filterText: this.filterText,
        sortAttribute: this.sortAttribute,
        sortDirection: this.sortDirection
      };
    } else {
      this.allRowsQuery = null;
      this.warnIncompleteLoad(total);
    }
  }

  /**
   * Whether the cached full-set load is complete and still matches the current
   * search text and sort order, so it can be reused without another fetch.
   */
  private hasCurrentCompleteRows(): boolean {
    return (
      this.allRowsComplete &&
      this.allRowsQuery !== null &&
      this.allRowsQuery.filterText === this.filterText &&
      this.allRowsQuery.sortAttribute === this.sortAttribute &&
      this.allRowsQuery.sortDirection === this.sortDirection
    );
  }

  /**
   * Drops the cached full-set load after a search or sort change so the next
   * status change refetches from the server.
   */
  private invalidateAllRows() {
    this.allRows = [];
    this.allRowsComplete = false;
    this.allRowsQuery = null;
  }

  /**
   * Reports a partial full-set load so a failed page is never silently
   * dropped from the filtered result, mirroring the loans list loader.
   */
  private warnIncompleteLoad(total: number) {
    console.warn(`Clients list: loaded ${this.allRows.length} of ${total} clients (failed or short pages).`);
  }

  private resetPaginator() {
    this.currentPage = 0;
    this.getClients();
  }
}
