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
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  EMPTY,
  Observable,
  throwError,
  Subject,
  catchError,
  finalize,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  timer,
  toArray,
  timeout
} from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ClientsService } from 'app/clients/clients.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { _ as extract } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TasksService } from '../../tasks.service';
import { ClientApprovalDataService } from './client-approval-data.service';
import { ClientApprovalConfirmDialogComponent } from './client-approval-confirm-dialog.component';
import {
  ClientApprovalOutcome,
  ClientScope,
  ClientSnapshot,
  PendingClient,
  batchOutcome,
  calendarDay,
  nameWarning,
  pendingClient,
  staffState,
  submissionDate,
  waitingDays
} from './client-approval.models';

interface OfficeGroup {
  key: string;
  name?: string;
  clients: PendingClient[];
}
interface Option {
  id: number;
  name?: string;
  displayName?: string;
}

@Component({
  selector: 'mifosx-client-approval',
  templateUrl: './client-approval.component.html',
  styleUrls: ['./client-approval.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatDatepickerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientApprovalComponent implements OnInit {
  private dialog = inject(MatDialog);
  private dates = inject(Dates);
  private settings = inject(SettingsService);
  private tasks = inject(TasksService);
  private data = inject(ClientApprovalDataService);
  private clients = inject(ClientsService);
  private organization = inject(OrganizationService);
  private auth = inject(AuthenticationService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private loadRequests = new Subject<{ debounce: boolean; pageOnly: boolean }>();
  private officeRequests = new Subject<number | null>();
  private countRequests = new Subject<void>();
  private snapshot: ClientSnapshot | null = null;
  private scopeVersion = 0;
  readonly clientApprovalCountChange = output<number | null>();
  readonly maxDate = Number.isFinite(this.settings.businessDate?.getTime()) ? this.settings.businessDate : new Date();
  readonly filters = this.fb.group({
    search: [''],
    officeId: this.fb.control<number | null>(null),
    staffId: this.fb.control<number | null>(null),
    submittedFrom: this.fb.control<Date | null>(null),
    submittedTo: this.fb.control<Date | null>(null)
  });
  readonly activation = this.fb.group({
    date: [
      this.maxDate,
      [
        Validators.required,
        (control: { value: Date }) =>
          !Number.isFinite(control.value?.getTime()) || calendarDay(control.value) > calendarDay(this.maxDate)
            ? { activationDate: true }
            : null
      ]
    ],
    staffId: this.fb.control<number | null>(null)
  });
  readonly displayedColumns = [
    'select',
    'client',
    'account',
    'staff',
    'submitted',
    'actions'
  ];
  readonly selection = new Set<number>();
  readonly collapsed = new Set<string>();
  readonly labels = {
    metricsUnavailable: extract('clientApproval.metricsUnavailable'),
    aggregateLimit: extract('clientApproval.aggregateLimit'),
    unknownOffice: extract('clientApproval.unknownOffice'),
    processing: extract('clientApproval.processing'),
    reviewing: extract('clientApproval.reviewing'),
    selectPage: extract('clientApproval.selectPage'),
    unassigned: extract('clientApproval.unassigned')
  };
  readonly outcomeLabels = {
    succeeded: extract('clientApproval.succeeded'),
    failed: extract('clientApproval.failed'),
    uncertain: extract('clientApproval.uncertain')
  };
  readonly staffState = staffState;
  readonly submissionDate = submissionDate;
  readonly nameWarning = nameWarning;
  submittedOpen = false;
  get summaryTotal(): number | null {
    return this.snapshot?.total ?? null;
  }
  groups: OfficeGroup[] = [];
  rows: PendingClient[] = [];
  offices: Option[] = [];
  staff: Option[] = [];
  total: number | null = null;
  queueCount: number | null = null;
  metrics: { unassigned: number | null; overdue: number | null; offices: number | null; officeName?: string } = {
    unassigned: null,
    overdue: null,
    offices: null
  };
  complete = false;
  aggregationFailed = false;
  loading = false;
  loadingStaff = false;
  optionsFailed = false;
  staffFailed = false;
  error = '';
  confirming = false;
  processing = false;
  pageIndex = 0;
  pageSize = 10;
  quickFilter: 'all' | 'unassigned' | 'overdue' = 'all';
  outcomes: ClientApprovalOutcome[] = [];

  get busy(): boolean {
    return this.confirming || this.processing;
  }
  get hasLocalFilter(): boolean {
    return this.quickFilter !== 'all' || !!this.filters.value.submittedFrom || !!this.filters.value.submittedTo;
  }
  get invalidRange(): boolean {
    const { submittedFrom: fromDate, submittedTo: toDate } = this.filters.getRawValue();
    return (
      this.filters.controls.submittedFrom.invalid ||
      this.filters.controls.submittedTo.invalid ||
      !!(fromDate && toDate && calendarDay(fromDate) > calendarDay(toDate))
    );
  }
  get selectedClients(): PendingClient[] {
    return this.rows.filter((row) => this.selection.has(row.id));
  }
  get minimumDate(): Date | null {
    return (
      this.selectedClients
        .map(submissionDate)
        .filter((date): date is Date => !!date)
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
    );
  }
  get canApprove(): boolean {
    return (
      !this.busy &&
      !this.loading &&
      !this.error &&
      !this.invalidRange &&
      this.selectedClients.length > 0 &&
      this.selectedClients.length === this.selection.size &&
      this.validActivation(this.selectedClients)
    );
  }
  get outcomeCounts() {
    return {
      succeeded: this.outcomes.filter((item) => item.activation === 'succeeded').length,
      failed: this.outcomes.filter((item) => item.activation === 'failed').length,
      uncertain: this.outcomes.filter((item) => item.activation === 'uncertain').length
    };
  }

  ngOnInit(): void {
    this.loadRequests
      .pipe(
        switchMap(({ debounce, pageOnly }) => {
          this.loading = true;
          return (debounce ? timer(300) : of(0)).pipe(
            switchMap(() => {
              const scope = this.serverScope();
              if (pageOnly && !this.complete) {
                return this.loadClientPage(scope);
              }
              const term = this.filters.controls.search.value?.trim() ?? '';
              const scopeRequest = () =>
                this.data.snapshot(scope).pipe(
                  catchError(() => {
                    this.aggregationFailed = true;
                    return this.tasks.getPendingClients({ ...scope, offset: 0, limit: this.pageSize }).pipe(
                      map((response) => {
                        if (
                          !Array.isArray(response?.pageItems) ||
                          !Number.isSafeInteger(response.totalFilteredRecords) ||
                          response.totalFilteredRecords < 0
                        )
                          throw new Error('Invalid fallback page');
                        return {
                          rows: response.pageItems,
                          total: response.totalFilteredRecords,
                          complete: false
                        } as ClientSnapshot;
                      })
                    );
                  })
                );
              const snapshotRequest = term
                ? this.data.account(term, scope).pipe(
                    catchError((error) => (/^\d+$/.test(term) ? throwError(() => error) : of(null))),
                    switchMap((snapshot) =>
                      snapshot && (snapshot.total > 0 || /^\d+$/.test(term)) ? of(snapshot) : scopeRequest()
                    )
                  )
                : scopeRequest();
              return snapshotRequest.pipe(map((snapshot) => this.acceptSnapshot(snapshot)));
            }),
            catchError(() => {
              this.error = extract('clientApproval.loadError');
              this.total = null;
              this.setRows([]);
              return EMPTY;
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.cdr.markForCheck());
    this.filters.controls.search.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload(true, false));
    this.filters.controls.officeId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((officeId) => {
      this.filters.controls.staffId.setValue(null, { emitEvent: false });
      this.activation.controls.staffId.setValue(null);
      this.officeRequests.next(officeId);
      this.reload(false, false);
    });
    this.filters.controls.staffId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload(false, false));
    for (const control of [
      this.filters.controls.submittedFrom,
      this.filters.controls.submittedTo
    ]) {
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyLocalFilters());
    }
    this.officeRequests
      .pipe(
        switchMap((id) => {
          this.staff = [];
          this.staffFailed = false;
          this.loadingStaff = !!id;
          if (!id) return of([] as Option[]);
          return this.organization.getStaff(id).pipe(
            catchError(() => {
              this.staffFailed = true;
              return of([]);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((staff: Option[]) => {
        this.staffFailed = this.staffFailed || !Array.isArray(staff);
        this.staff = Array.isArray(staff) ? staff : [];
        this.loadingStaff = false;
        this.cdr.markForCheck();
      });
    this.countRequests
      .pipe(
        switchMap(() =>
          this.tasks.getPendingClients({ limit: 1, offset: 0 }).pipe(
            map((response) =>
              Number.isSafeInteger(response?.totalFilteredRecords) && response.totalFilteredRecords >= 0
                ? response.totalFilteredRecords
                : null
            ),
            catchError(() => of(null))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((count) => {
        this.queueCount = count;
        this.clientApprovalCountChange.emit(count);
        this.cdr.markForCheck();
      });
    this.loadOffices();
    this.reload();
  }

  loadOffices(): void {
    this.optionsFailed = false;
    this.organization
      .getOffices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (offices: Option[]) => {
          this.optionsFailed = !Array.isArray(offices);
          this.offices = Array.isArray(offices) ? offices : [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.optionsFailed = true;
          this.cdr.markForCheck();
        }
      });
  }

  hasPermission(permission: string): boolean {
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes(permission) ||
      (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ'))
    );
  }
  eligible(row: PendingClient): boolean {
    return this.hasPermission('ACTIVATE_CLIENT') && pendingClient(row) && !this.data.isActivationLocked(row.id);
  }
  waiting(row: PendingClient): number | null {
    return waitingDays(row, this.maxDate);
  }
  initials(name: string): string {
    return (name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => Array.from(part)[0])
      .join('')
      .toLocaleUpperCase();
  }

  /** Publish a corrected page only after its records have arrived. Each correction moves earlier. */
  private loadClientPage(scope: ClientScope, pageIndex = this.pageIndex): Observable<void> {
    return this.tasks.getPendingClients({ ...scope, offset: pageIndex * this.pageSize, limit: this.pageSize }).pipe(
      switchMap((response) => {
        if (
          !Array.isArray(response?.pageItems) ||
          !Number.isSafeInteger(response.totalFilteredRecords) ||
          response.totalFilteredRecords < 0
        ) {
          throw new Error('Invalid client page');
        }
        const total = response.totalFilteredRecords;
        const lastPage = Math.max(0, Math.ceil(total / this.pageSize) - 1);
        if (total > 0 && pageIndex > lastPage) return this.loadClientPage(scope, lastPage);
        this.pageIndex = total === 0 ? 0 : pageIndex;
        this.total = total;
        this.setRows(response.pageItems.filter(pendingClient));
        return of(undefined);
      })
    );
  }

  private serverScope(): ClientScope {
    const { officeId, staffId, search } = this.filters.getRawValue();
    const term = search?.trim() ?? '';
    return {
      officeId: officeId ?? undefined,
      staffId: staffId ?? undefined,
      displayName: term && !/^\d+$/.test(term) ? term : undefined
    };
  }
  reload(debounce = false, refreshCount = true): void {
    if (this.busy) return;
    if (refreshCount) this.countRequests.next();
    this.scopeVersion++;
    this.selection.clear();
    this.collapsed.clear();
    this.pageIndex = 0;
    this.snapshot = null;
    this.aggregationFailed = false;
    this.complete = false;
    this.total = null;
    this.metrics = { unassigned: null, overdue: null, offices: null };
    this.error = '';
    this.setRows([]);
    // switchMap cancels both a pending debounce and an in-flight read immediately.
    this.loadRequests.next({ debounce, pageOnly: false });
    this.cdr.markForCheck();
  }
  private acceptSnapshot(snapshot: ClientSnapshot): void {
    this.snapshot = snapshot;
    this.complete = snapshot.complete;
    if (!snapshot.complete) {
      this.quickFilter = 'all';
      this.filters.patchValue({ submittedFrom: null, submittedTo: null }, { emitEvent: false });
    }
    const rows = snapshot.rows;
    const officeIds = new Set(rows.map((row) => row.officeId).filter((id) => Number.isSafeInteger(id)));
    this.metrics = {
      unassigned:
        snapshot.complete && rows.every((row) => staffState(row) !== 'unknown')
          ? rows.filter((row) => staffState(row) === 'unassigned').length
          : null,
      overdue:
        snapshot.complete && rows.every((row) => this.waiting(row) !== null)
          ? rows.filter((row) => this.waiting(row) > 7).length
          : null,
      offices: snapshot.complete && rows.every((row) => Number.isSafeInteger(row.officeId)) ? officeIds.size : null,
      officeName: officeIds.size === 1 ? rows[0]?.officeName : undefined
    };
    if (snapshot.complete) this.applyLocalFilters();
    else {
      this.total = snapshot.total;
      this.setRows(rows.filter(pendingClient).slice(0, this.pageSize));
    }
  }
  applyLocalFilters(): void {
    if (!this.complete || !this.snapshot || this.busy) return;
    this.selection.clear();
    this.pageIndex = 0;
    this.scopeVersion++;
    this.renderLocalPage();
    this.cdr.markForCheck();
  }
  private renderLocalPage(): void {
    const { submittedFrom: fromDate, submittedTo: toDate } = this.filters.getRawValue();
    const filtered = this.invalidRange
      ? []
      : this.snapshot.rows.filter((row) => {
          const date = submissionDate(row);
          return (
            (this.quickFilter !== 'unassigned' || staffState(row) === 'unassigned') &&
            (this.quickFilter !== 'overdue' || (this.waiting(row) !== null && this.waiting(row) > 7)) &&
            (!fromDate || (date && calendarDay(date) >= calendarDay(fromDate))) &&
            (!toDate || (date && calendarDay(date) <= calendarDay(toDate)))
          );
        });
    this.total = filtered.length;
    this.setRows(filtered.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize));
  }
  private setRows(rows: PendingClient[]): void {
    this.rows = rows;
    const groups = new Map<string, OfficeGroup>();
    for (const row of rows) {
      const key = row.officeId != null ? `office-${row.officeId}` : `unknown-${row.officeName ?? ''}`;
      if (!groups.has(key)) groups.set(key, { key, name: row.officeName, clients: [] });
      groups.get(key).clients.push(row);
    }
    this.groups = [...groups.values()];
  }
  filterCard(filter: 'all' | 'unassigned' | 'overdue'): void {
    if (this.busy || this.loading || (filter !== 'all' && !this.complete)) return;
    this.quickFilter = filter;
    this.applyLocalFilters();
  }
  clearDates(): void {
    this.filters.patchValue({ submittedFrom: null, submittedTo: null }, { emitEvent: false });
    this.applyLocalFilters();
  }
  retryOptions(): void {
    if (this.busy) return;
    this.loadOffices();
    this.officeRequests.next(this.filters.controls.officeId.value);
  }
  reset(): void {
    if (this.busy) return;
    this.filters.reset(
      { search: '', officeId: null, staffId: null, submittedFrom: null, submittedTo: null },
      { emitEvent: false }
    );
    this.activation.controls.staffId.setValue(null);
    this.quickFilter = 'all';
    this.officeRequests.next(null);
    this.reload(false, false);
  }
  page(event: PageEvent): void {
    if (this.busy || this.loading) return;
    this.selection.clear();
    this.collapsed.clear();
    this.scopeVersion++;
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.complete) this.renderLocalPage();
    else {
      this.error = '';
      this.loadRequests.next({ debounce: false, pageOnly: true });
    }
  }
  toggleGroup(group: OfficeGroup): void {
    if (this.busy) return;
    if (this.collapsed.has(group.key)) this.collapsed.delete(group.key);
    else {
      this.collapsed.add(group.key);
      group.clients.forEach((row) => this.selection.delete(row.id));
    }
  }
  toggle(row: PendingClient): void {
    if (this.busy || this.loading || !this.eligible(row)) return;
    if (this.selection.has(row.id)) this.selection.delete(row.id);
    else this.selection.add(row.id);
  }
  allSelected(group: OfficeGroup): boolean {
    const eligible = group.clients.filter((row) => this.eligible(row));
    return eligible.length > 0 && eligible.every((row) => this.selection.has(row.id));
  }
  someSelected(group: OfficeGroup): boolean {
    return group.clients.some((row) => this.selection.has(row.id));
  }
  selectGroup(group: OfficeGroup): void {
    if (this.busy || this.loading || this.collapsed.has(group.key)) return;
    const all = this.allSelected(group);
    group.clients
      .filter((row) => this.eligible(row))
      .forEach((row) => (all ? this.selection.delete(row.id) : this.selection.add(row.id)));
  }
  clearSelection(): void {
    if (!this.busy) this.selection.clear();
  }

  canApproveRow(row: PendingClient): boolean {
    return !this.busy && !this.loading && !this.error && !this.invalidRange && this.validActivation([row], null);
  }

  private validActivation(rows: PendingClient[], staffId = this.activation.getRawValue().staffId): boolean {
    const { date } = this.activation.getRawValue();
    if (
      !this.hasPermission('ACTIVATE_CLIENT') ||
      !this.settings.dateFormat ||
      !this.settings.language?.code ||
      !Number.isFinite(date?.getTime()) ||
      calendarDay(date) > calendarDay(this.maxDate) ||
      rows.some(
        (row) => !this.eligible(row) || (submissionDate(row) && calendarDay(date) < calendarDay(submissionDate(row)))
      )
    )
      return false;
    if (
      staffId &&
      (!this.hasPermission('ASSIGNSTAFF_CLIENT') ||
        !this.filters.getRawValue().officeId ||
        this.loadingStaff ||
        this.staffFailed ||
        !this.staff.some((staff) => staff.id === staffId) ||
        rows.some((row) => row.officeId !== this.filters.getRawValue().officeId))
    )
      return false;
    return true;
  }

  approveClients(single?: PendingClient): void {
    const { date } = this.activation.getRawValue();
    const staffId = single ? null : this.activation.getRawValue().staffId;
    const selected = single ? [single] : this.selectedClients;
    if (
      this.busy ||
      this.loading ||
      this.error ||
      this.invalidRange ||
      !selected.length ||
      selected.length > 100 ||
      !this.validActivation(selected, staffId)
    )
      return;
    const version = this.scopeVersion;
    const dateFormat = this.settings.dateFormat;
    const payload = {
      activationDate: this.dates.formatDate(date, dateFormat),
      dateFormat,
      locale: this.settings.language.code
    };
    const staffName = staffId ? this.staff.find((staff) => staff.id === staffId)?.displayName : undefined;
    this.confirming = true;
    this.filters.disable({ emitEvent: false });
    this.activation.disable({ emitEvent: false });
    // Re-read only the bounded selected IDs before confirmation. Never activate stale/already-active rows.
    from(selected)
      .pipe(
        mergeMap((row) => this.clients.getClientData(String(row.id)), 4),
        toArray(),
        timeout(60000),
        switchMap((current: PendingClient[]) => {
          if (
            current.length !== selected.length ||
            new Set(current.map((row) => row.id)).size !== selected.length ||
            current.some((row) => !selected.some((item) => item.id === row.id)) ||
            !this.validActivation(current, staffId) ||
            version !== this.scopeVersion
          ) {
            this.error = extract('clientApproval.staleSelection');
            return EMPTY;
          }
          return this.dialog
            .open(ClientApprovalConfirmDialogComponent, {
              width: '560px',
              maxWidth: 'calc(100vw - 32px)',
              disableClose: true,
              data: { clients: current, activationDate: payload.activationDate, staffName }
            })
            .afterClosed()
            .pipe(
              switchMap((confirmed) => {
                if (confirmed !== true || !this.validActivation(current, staffId)) return EMPTY;
                this.confirming = false;
                this.processing = true;
                this.outcomes = [];
                const requests = current.map((row, index) => ({
                  requestId: index + 1,
                  relativeUrl: `clients/${row.id}?command=activate`,
                  method: 'POST',
                  body: JSON.stringify(payload)
                }));
                return this.tasks.submitBatchData(requests).pipe(
                  timeout(60000),
                  catchError(() => of(null)),
                  switchMap((responses) => {
                    this.outcomes = current.map((client, index) => ({
                      client,
                      activation: batchOutcome(responses, index + 1)
                    }));
                    this.outcomes
                      .filter((item) => item.activation !== 'failed')
                      .forEach((item) => this.data.lockActivation(item.client.id));
                    const activated = this.outcomes.filter((item) => item.activation === 'succeeded');
                    if (!staffId || !activated.length) return of(null);
                    // Assign only after confirmed activation success; these operations are deliberately non-atomic.
                    return from(activated).pipe(
                      mergeMap(
                        (item) =>
                          this.clients.executeClientCommand(String(item.client.id), 'assignStaff', { staffId }).pipe(
                            timeout(60000),
                            map((response: any) => {
                              item.assignment =
                                response?.commandId && !response?.resourceId ? 'uncertain' : 'succeeded';
                            }),
                            catchError((error) => {
                              item.assignment =
                                error.status >= 400 && error.status < 500 && error.status !== 408
                                  ? 'failed'
                                  : 'uncertain';
                              return of(null);
                            })
                          ),
                        4
                      ),
                      toArray()
                    );
                  })
                );
              })
            );
        }),
        catchError(() => {
          this.error = extract('clientApproval.preflightError');
          return EMPTY;
        }),
        finalize(() => {
          const processed = this.processing;
          this.confirming = false;
          this.processing = false;
          this.filters.enable({ emitEvent: false });
          this.activation.enable({ emitEvent: false });
          this.selection.clear();
          if (processed) {
            this.activation.controls.staffId.setValue(null);
            this.reload();
          }
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.cdr.markForCheck());
  }
}
