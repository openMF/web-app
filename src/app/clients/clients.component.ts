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
import { MatProgressBar } from '@angular/material/progress-bar';

/** rxjs Imports */
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/** Custom Services */
import { environment } from '../../environments/environment';
import { ClientsService } from './clients.service';
import { AccountNumberComponent } from '../shared/account-number/account-number.component';
import { ExternalIdentifierComponent } from '../shared/external-identifier/external-identifier.component';
import { LegalFormId } from './models/legal-form.enum';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DateFormatPipe } from '../pipes/date-format.pipe';
import { nameInitials } from 'app/core/utils/name-initials';

export const DEBOUNCE_MS = 500;

type Severity = 'active' | 'pending' | 'closed' | 'rejected' | 'neutral';

@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBar,
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
  showClosedAccounts = false;

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

  toggleShowClosed() {
    this.showClosedAccounts = !this.showClosedAccounts;
  }

  search(value: string) {
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
    this.getClients();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0;
    this.getClients();
  }

  private getClients() {
    this.clientsRequestSub?.unsubscribe();
    this.isLoading = true;
    this.cdr.markForCheck();
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

  private resetPaginator() {
    this.currentPage = 0;
    this.getClients();
  }
}
