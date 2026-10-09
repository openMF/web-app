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
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableDataSource } from '@angular/material/table';

/** rxjs Imports */
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/** Custom Services */
import { GroupsService } from './groups.service';
import { AccountNumberComponent } from '../shared/account-number/account-number.component';
import { ExternalIdentifierComponent } from '../shared/external-identifier/external-identifier.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { nameInitials } from 'app/core/utils/name-initials';
import { PageLoaderComponent } from '../shared/page-loader/page-loader.component';

export const DEBOUNCE_MS = 500;

type Severity = 'active' | 'pending' | 'closed' | 'rejected' | 'neutral';

/**
 * Groups component.
 */
@Component({
  selector: 'mifosx-app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PageLoaderComponent,
    AccountNumberComponent,
    ExternalIdentifierComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsComponent implements OnInit, OnDestroy {
  private groupsService = inject(GroupsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  private searchInput$ = new Subject<string>();
  private groupsRequestSub: Subscription | null = null;
  private isComposing = false;

  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  existsGroupsToFilter = false;
  notExistsGroupsToFilter = false;

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
  showClosedGroups = false;

  ngOnInit() {
    this.searchInput$.pipe(debounceTime(DEBOUNCE_MS), takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value !== this.filterText) {
        this.search(value);
      }
    });

    this.getGroups();
  }

  ngOnDestroy() {
    this.groupsRequestSub?.unsubscribe();
  }

  /** Two-letter uppercase initials from the group name. */
  initials(name: string): string {
    return nameInitials(name);
  }

  /**
   * UI severity class for a row from its status.code.
   * The list endpoint reports group statuses under the clientStatusType.*
   * family while the detail endpoint uses groupingStatusType.*, so match on
   * the status name rather than the enum family.
   */
  severity(row: any): Severity {
    const code: string = row?.status?.code ?? '';
    const status = code.replace(/^[a-zA-Z]+\./, '');
    if (status === 'active' || status === 'approved') return 'active';
    if (status === 'pending' || status === 'submitted.and.pending.approval') return 'pending';
    if (status === 'closed') return 'closed';
    if (status === 'rejected') return 'rejected';
    return 'neutral';
  }

  /** Whether the group is closed (only these rows are hidden by default). */
  private isClosed(row: any): boolean {
    return (row?.status?.code ?? '').endsWith('.closed');
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

  toggleShowClosed() {
    this.showClosedGroups = !this.showClosedGroups;
    this.resetPaginator();
  }

  search(value: string) {
    this.filterText = value;
    if (this.currentPage !== 0) {
      this.resetPaginator();
      return;
    }
    this.getGroups();
  }

  /**
   * Sets the sort attribute/direction and reloads from the server.
   */
  setSort(attribute: string) {
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
    this.getGroups();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0;
    this.getGroups();
  }

  private getGroups() {
    this.groupsRequestSub?.unsubscribe();
    this.isLoading = true;
    this.cdr.markForCheck();
    const filterBy = [
      {
        type: 'name',
        value: this.filterText
      }
    ];
    this.groupsRequestSub = this.groupsService
      .getGroups(filterBy, this.sortAttribute, this.sortDirection, this.currentPage * this.pageSize, this.pageSize)
      .subscribe(
        (data: any) => {
          // Hide only closed groups by default; pending/approved rows stay visible.
          const pageItems = this.showClosedGroups
            ? data.pageItems
            : data.pageItems.filter((group: any) => !this.isClosed(group));
          this.dataSource.data = pageItems;
          this.totalRows = data.totalFilteredRecords;
          this.existsGroupsToFilter = pageItems.length > 0;
          this.notExistsGroupsToFilter = !this.existsGroupsToFilter;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        (error) => {
          console.error('Failed to load groups:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      );
  }

  private resetPaginator() {
    this.currentPage = 0;
    this.getGroups();
  }
}
