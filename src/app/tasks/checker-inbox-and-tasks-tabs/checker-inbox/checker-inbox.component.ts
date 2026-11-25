/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  DestroyRef,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  afterNextRender,
  Injector
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ClientsService } from 'app/clients/clients.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  from,
  map,
  mergeMap,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
  timer,
  timeout,
  toArray
} from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { CheckerInboxCountService } from '../../checker-inbox-count.service';
import { SettingsService } from 'app/settings/settings.service';
import { CheckerSearchTemplate, TasksService } from '../../tasks.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslateService, _ as extract } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { serializeMakerCheckerDate } from './maker-checker-date-serializer';
import {
  AuditPresentation,
  MakerCheckerRecord,
  canReviewRequest,
  checkerPermission,
  isOwnRequest,
  isPendingAudit,
  presentAudit
} from './checker-inbox-audit';

interface BulkActionResult {
  action: string;
  succeeded: number;
  failed: { id: number; error?: string }[];
  unknown?: number[];
}
type Decision = 'approve' | 'reject' | 'delete';
type Outcome = { id: number; state: 'succeeded' | 'failed' | 'unknown' };

@Component({
  selector: 'mifosx-checker-inbox',
  templateUrl: './checker-inbox.component.html',
  styleUrls: ['./checker-inbox.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTableModule,
    MatIcon,
    MatMenuModule,
    MatButtonModule,
    MatTooltip,
    MatAutocompleteModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckerInboxComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private tasksService = inject(TasksService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private clientsService = inject(ClientsService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private authenticationService = inject(AuthenticationService);
  private injector = inject(Injector);
  private settings = inject(SettingsService);
  @ViewChild('detailPanel', { read: ElementRef }) private detailElement?: ElementRef<HTMLElement>;
  get timestampFormat(): string {
    return this.settings.datetimeFormat || 'dd MMM yyyy HH:mm';
  }
  private counts = inject(CheckerInboxCountService);
  readonly checkerInboxWorkspace = true;
  searchData: MakerCheckerRecord[] = [];
  makerCheckerTemplate: CheckerSearchTemplate = {};
  private loadedScope = '';
  private routeRequest: number | undefined;
  private detailOpener?: HTMLElement;
  datesOpen = false;
  @ViewChild('dateStart') private dateStart?: ElementRef<HTMLInputElement>;
  @ViewChild('inboxSearch') private inboxSearch?: ElementRef<HTMLInputElement>;
  @ViewChild('dateTrigger', { read: ElementRef }) private dateTrigger?: ElementRef<HTMLButtonElement>;
  noSearchedData = false;
  checkerData = false;
  loading = false;
  searchError = false;
  processing = false;
  confirming = false;
  processingCount = 0;
  actionResult: BulkActionResult | null = null;
  private searchRequestId = 0;
  private filterRevision = 0;
  private searchSubscription?: Subscription;
  private detailSubscription?: Subscription;
  private customerWasSelected = false;
  makerCheckerSearchForm: FormGroup;
  rejectionForm = this.formBuilder.group({ comment: [{ value: '', disabled: true }] });
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2100, 0, 1);
  dataSource = new MatTableDataSource<MakerCheckerRecord>([]);
  selection = new SelectionModel<MakerCheckerRecord>(true, [], true, (a, b) => a.id === b.id);
  customerControl = new FormControl<string | any>('');
  customers: any[] = [];
  trackRow = (_index: number, row: MakerCheckerRecord) => row.id;
  displayedColumns = [
    'select',
    'action',
    'resource',
    'user',
    'id'
  ];
  newestFirst = true;
  selectedId: number | null = null;
  detail: MakerCheckerRecord | null = null;
  detailLoading = false;
  detailError = false;
  jsonOpen = false;
  presentation: AuditPresentation = presentAudit(null);

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (data: {
          makerCheckerResource: { scope: string; rows: MakerCheckerRecord[] };
          makerCheckerTemplate: CheckerSearchTemplate;
        }) => {
          this.makerCheckerTemplate = data.makerCheckerTemplate || {};
          const resolved = data.makerCheckerResource;
          this.loadedScope = resolved?.scope ?? '';
          this.setRecords(this.loadedScope === this.counts.scope() ? (resolved?.rows ?? []) : []);
        }
      );
    this.destroyRef.onDestroy(() => {
      this.searchSubscription?.unsubscribe();
      this.detailSubscription?.unsubscribe();
    });
  }

  ngOnInit() {
    this.createMakerCheckerSearchForm();
    this.authenticationService.isAuthenticated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((authenticated) => {
      if (!authenticated) {
        this.invalidateSearch();
        this.setRecords([]);
        this.customers = [];
        this.customerWasSelected = false;
        this.customerControl.setValue('', { emitEvent: false });
        this.actionResult = null;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('request')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((request) => {
        this.clearDetail();
        const id = Number(request);
        this.routeRequest = Number.isSafeInteger(id) && id > 0 ? id : undefined;
        this.openRouteRequest();
        this.changeDetectorRef.markForCheck();
      });
    this.makerCheckerSearchForm.valueChanges
      .pipe(
        map(() => ++this.filterRevision),
        tap(() => this.invalidateSearch()),
        debounceTime(250),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((revision) => {
        if (revision === this.filterRevision) this.loadMakerCheckers();
      });
    this.customerControl.valueChanges
      .pipe(
        tap((value) => {
          if (typeof value === 'string') this.applyFilter(value);
          const selected = typeof value === 'object' && !!value?.id;
          if (selected || this.customerWasSelected) {
            this.customerWasSelected = selected;
            this.invalidateSearch();
            this.loadMakerCheckers();
          }
        }),
        distinctUntilChanged(),
        switchMap((value) => timer(300).pipe(switchMap(() => this.searchCustomers(value)))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((customers) => {
        this.customers = this.customerControl.value ? customers : [];
        this.changeDetectorRef.markForCheck();
      });
  }

  createMakerCheckerSearchForm() {
    this.makerCheckerSearchForm = this.formBuilder.group(
      {
        makerDateTimeFrom: [''],
        makerDateTimeTo: [''],
        makerId: [''],
        actionName: [''],
        entityName: [''],
        resourceId: ['']
      },
      {
        validators: (group) => {
          const from = group.get('makerDateTimeFrom')?.value,
            to = group.get('makerDateTimeTo')?.value;
          for (const date of [
            from,
            to
          ]) {
            if (
              date &&
              (!(date instanceof Date) ||
                !serializeMakerCheckerDate(date) ||
                date < this.minDate ||
                date > this.maxDate)
            )
              return { date: true };
          }
          return from && to && from > to ? { dateOrder: true } : null;
        }
      }
    );
  }

  get canLeave(): boolean {
    return !this.busy || !this.authenticationService.getCredentials();
  }

  get busy(): boolean {
    return this.processing || this.confirming;
  }

  search() {
    this.loadMakerCheckers();
  }

  resetFilters() {
    if (this.busy) return;
    this.makerCheckerSearchForm.reset({}, { emitEvent: false });
    this.customerWasSelected = false;
    this.customerControl.setValue('');
    this.customers = [];
    this.invalidateSearch();
    this.loadMakerCheckers();
  }

  private invalidateSearch(): void {
    ++this.searchRequestId;
    this.searchSubscription?.unsubscribe();
    this.selection.clear();
    this.clearDetail();
    this.loading = true;
  }

  private searchParams(): any {
    const value = this.makerCheckerSearchForm.value;
    const selected = this.customerControl.value;
    return {
      ...value,
      makerDateTimeFrom: serializeMakerCheckerDate(value.makerDateTimeFrom),
      makerDateTimeTo: serializeMakerCheckerDate(value.makerDateTimeTo),
      clientId: typeof selected === 'object' ? selected?.id : undefined
    };
  }

  private loadMakerCheckers(): void {
    if (this.processing) return;
    ++this.filterRevision;
    this.invalidateSearch();
    if (this.makerCheckerSearchForm.invalid) {
      this.loading = false;
      return;
    }
    const requestId = this.searchRequestId;
    const scope = this.counts.scope();
    this.searchError = false;
    this.searchSubscription = this.tasksService
      .getMakerCheckerData(this.searchParams())
      .pipe(
        finalize(() => {
          if (requestId === this.searchRequestId) {
            this.loading = false;
            this.openRouteRequest();
          }
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (response: MakerCheckerRecord[]) => {
          if (requestId !== this.searchRequestId) return;
          if (scope !== this.counts.scope()) {
            this.setRecords([]);
            this.searchError = true;
            return;
          }
          if (!Array.isArray(response)) {
            this.searchError = true;
            return;
          }
          this.loadedScope = scope;
          this.setRecords(response);
          this.noSearchedData = response.length === 0;
        },
        error: () => {
          if (requestId === this.searchRequestId) this.searchError = true;
        }
      });
  }

  private setRecords(records: MakerCheckerRecord[]): void {
    this.searchData = records;
    this.checkerData = records.length > 0;
    this.dataSource.data = [...records].sort((a, b) => (this.newestFirst ? b.id - a.id : a.id - b.id));
    this.dataSource.filterPredicate = (row, filter) =>
      [
        row.id,
        row.resourceId,
        row.clientName,
        row.clientId,
        row.loanAccountNo,
        row.savingsAccountNo,
        row.maker,
        row.actionName,
        row.entityName
      ].some((value) =>
        String(value ?? '')
          .toLocaleLowerCase()
          .includes(filter)
      );
    this.dataSource.filter =
      typeof this.customerControl.value === 'string' ? this.customerControl.value.trim().toLocaleLowerCase() : '';
    this.selection.clear();
  }

  private searchCustomers(value: string | any) {
    if (typeof value !== 'string' || value.trim().length < 2) return of([]);
    const scope = this.counts.scope();
    return this.clientsService.searchByText(value.trim(), 0, 20).pipe(
      map((response: any) => (scope === this.counts.scope() ? response?.content || [] : [])),
      catchError(() => of([]))
    );
  }

  displayCustomer(customer: any): string {
    return typeof customer === 'string' ? customer : customer?.displayName || customer?.accountNumber || '';
  }

  detailEligible(): boolean {
    return (
      !!this.detail &&
      this.canAction(this.detail) &&
      isPendingAudit(this.detail) &&
      this.dataSource.filteredData.some((row) => row.id === this.detail.id)
    );
  }
  isPending = isPendingAudit;
  checkerPermission = checkerPermission;
  ownRequest(row: MakerCheckerRecord): boolean {
    return isOwnRequest(row, this.authenticationService.getCredentials());
  }
  canAction(row: MakerCheckerRecord): boolean {
    return canReviewRequest(row, this.authenticationService.getCredentials());
  }
  hasActionableRows(): boolean {
    return this.dataSource.filteredData.some((row) => this.canAction(row));
  }
  isAllSelected(): boolean {
    const eligible = this.dataSource.filteredData.filter((row) => this.canAction(row));
    return eligible.length > 0 && eligible.every((row) => this.selection.isSelected(row));
  }
  masterToggle() {
    if (this.busy || this.loading || this.searchError || this.makerCheckerSearchForm.invalid) return;
    if (this.isAllSelected()) this.selection.clear();
    else this.dataSource.filteredData.filter((row) => this.canAction(row)).forEach((row) => this.selection.select(row));
  }
  toggleRow(row: MakerCheckerRecord): void {
    if (!this.busy && !this.loading && !this.searchError && !this.makerCheckerSearchForm.invalid && this.canAction(row))
      this.selection.toggle(row);
  }
  checkboxLabel(row?: MakerCheckerRecord): string {
    return this.translateService.instant(
      row
        ? this.selection.isSelected(row)
          ? extract('checkerInbox.review.deselect')
          : extract('checkerInbox.review.select')
        : this.isAllSelected()
          ? extract('checkerInbox.review.deselectAll')
          : extract('checkerInbox.review.selectAll'),
      { id: row?.id }
    );
  }

  resourceTitle(row: MakerCheckerRecord): string {
    return (
      row.loanAccountNo ||
      row.savingsAccountNo ||
      row.clientName ||
      `${row.entityName} ${row.resourceId ?? '#' + row.id}`
    );
  }

  resourceLink(row: MakerCheckerRecord): string[] | null {
    if (Number.isSafeInteger(row.clientId) && row.clientId > 0) return [
        '/clients',
        String(row.clientId),
        'general'
      ];
    if (row.entityName === 'CLIENT' && Number.isSafeInteger(row.resourceId) && row.resourceId > 0) return [
        '/clients',
        String(row.resourceId),
        'general'
      ];
    return null;
  }

  actionClass(row: MakerCheckerRecord): string {
    return (
      ({ CREATE: 'create', DELETE: 'delete', DISBURSE: 'disburse', ACTIVATE: 'activate' } as Record<string, string>)[
        row.actionName
      ] || 'update'
    );
  }

  toggleDateFilter(): void {
    if (this.datesOpen) {
      this.closeDateFilter();
      return;
    }
    this.datesOpen = true;
    afterNextRender(() => this.dateStart?.nativeElement.focus(), { injector: this.injector });
  }

  closeDateFilter(): void {
    this.datesOpen = false;
    this.dateTrigger?.nativeElement.focus();
  }

  private openRouteRequest(): void {
    if (!this.routeRequest || this.busy || this.loading || this.searchError || this.makerCheckerSearchForm.invalid)
      return;
    const id = this.routeRequest;
    this.routeRequest = undefined;
    this.openDetail(this.searchData.find((row) => row.id === id) || { id, actionName: '', entityName: '' });
  }

  openDetail(row: MakerCheckerRecord, opener?: HTMLElement): void {
    if (this.busy || this.loading || this.searchError || this.makerCheckerSearchForm.invalid) return;
    this.clearDetail();
    const scope = this.counts.scope();
    if (!scope || scope !== this.loadedScope) return;
    this.detailOpener = opener;
    this.selectedId = row.id;
    this.detailLoading = true;
    afterNextRender(() => this.detailElement?.nativeElement.focus(), { injector: this.injector });
    const permissions = this.authenticationService.getCredentials()?.permissions ?? [];
    const hasAuditRead = permissions.some((permission) => [
        'ALL_FUNCTIONS',
        'ALL_FUNCTIONS_READ',
        'READ_AUDIT'
      ].includes(permission));
    const detailRequest = hasAuditRead
      ? this.tasksService.getCheckerInboxDetail(row.id)
      : row.actionName && row.entityName
        ? this.tasksService.getPendingCheckerRecord(row, true)
        : of(undefined);
    this.detailSubscription = detailRequest
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.selectedId === row.id) this.detailLoading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (detail: MakerCheckerRecord) => {
          if (this.selectedId !== row.id) return;
          if (scope !== this.counts.scope()) {
            this.clearDetail();
            return;
          }
          if (!detail || detail.id !== row.id) {
            this.detailError = true;
            return;
          }
          this.detail = detail;
          this.presentation = presentAudit(detail.commandAsJson);
        },
        error: () => {
          if (this.selectedId === row.id) this.detailError = true;
        }
      });
  }

  closeDetail(): void {
    const opener = this.detailOpener;
    this.clearDetail();
    afterNextRender(
      () => {
        if (this.selectedId !== null) return;
        if (opener?.isConnected && opener.getClientRects().length && !opener.matches(':disabled')) opener.focus();
        else this.inboxSearch?.nativeElement.focus();
      },
      { injector: this.injector }
    );
  }

  private clearDetail(): void {
    this.detailOpener = undefined;
    this.detailSubscription?.unsubscribe();
    this.selectedId = null;
    this.detail = null;
    this.presentation = presentAudit(null);
    this.detailError = false;
    this.detailLoading = false;
    this.jsonOpen = false;
    this.rejectionForm.reset();
  }

  approveChecker() {
    this.confirmDecision('approve');
  }
  rejectChecker() {
    this.confirmDecision('reject');
  }
  deleteChecker() {
    this.confirmDecision('delete');
  }
  decideDetail(action: Decision): void {
    if (this.detail && isPendingAudit(this.detail)) this.confirmDecision(action, [this.detail]);
  }

  private confirmDecision(action: Decision, records = this.selection.selected): void {
    if (this.busy || this.loading || this.searchError || this.makerCheckerSearchForm.invalid) return;
    const snapshot = records.filter(
      (row) => this.canAction(row) && this.dataSource.filteredData.some((item) => item.id === row.id)
    );
    const scope = this.counts.scope();
    if (!snapshot.length || !scope || scope !== this.loadedScope) return;
    this.confirming = true;
    this.makerCheckerSearchForm.disable({ emitEvent: false });
    const heading =
      action === 'approve'
        ? extract('labels.heading.Approve Checker')
        : action === 'reject'
          ? extract('labels.heading.Reject Checker')
          : extract('labels.heading.Delete Checker');
    const context =
      action === 'approve'
        ? extract('checkerInbox.review.confirmApprove')
        : action === 'reject'
          ? extract('checkerInbox.review.confirmReject')
          : extract('checkerInbox.review.confirmDelete');
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          heading: this.translateService.instant(heading),
          dialogContext: this.translateService.instant(context, {
            count: snapshot.length,
            ids: snapshot.map((row) => '#' + row.id).join(', ')
          })
        }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.confirming = false;
        this.makerCheckerSearchForm.enable({ emitEvent: false });
        if (response?.confirm && scope === this.counts.scope()) this.processRecords(action, snapshot, scope);
        this.openRouteRequest();
        this.changeDetectorRef.markForCheck();
      });
  }

  private processRecords(action: Decision, records: MakerCheckerRecord[], scope: string): void {
    const selected = records.filter(
      (row) => this.canAction(row) && this.dataSource.filteredData.some((item) => item.id === row.id)
    );
    if (!selected.length || this.processing || this.loading || this.searchError || this.makerCheckerSearchForm.invalid)
      return;
    this.processing = true;
    this.makerCheckerSearchForm.disable({ emitEvent: false });
    this.actionResult = null;
    this.processingCount = selected.length;
    this.selection.clear();
    this.clearDetail();
    from(selected)
      .pipe(
        mergeMap((item) => this.processOne(action, item, scope), 4),
        toArray()
      )
      .subscribe((results) => {
        if (scope !== this.counts.scope()) {
          this.processing = false;
          this.processingCount = 0;
          this.makerCheckerSearchForm.enable({ emitEvent: false });
          this.changeDetectorRef.markForCheck();
          return;
        }
        this.actionResult = {
          action,
          succeeded: results.filter((result) => result.state === 'succeeded').length,
          failed: results.filter((result) => result.state === 'failed').map((result) => ({ id: result.id })),
          unknown: results.filter((result) => result.state === 'unknown').map((result) => result.id)
        };
        this.processing = false;
        this.makerCheckerSearchForm.enable({ emitEvent: false });
        this.processingCount = 0;
        this.reload();
        this.changeDetectorRef.markForCheck();
      });
  }

  private processOne(action: Decision, item: MakerCheckerRecord, scope: string): Observable<Outcome> {
    if (scope !== this.counts.scope() || scope !== this.loadedScope) return of({ id: item.id, state: 'failed' });
    // Recheck pending membership with the checker-scoped endpoint immediately before writing.
    return this.tasksService.getPendingCheckerRecord(item).pipe(
      timeout(30000),
      switchMap((fresh: MakerCheckerRecord) => {
        if (
          scope !== this.counts.scope() ||
          !fresh ||
          fresh.id !== item.id ||
          fresh.actionName !== item.actionName ||
          fresh.entityName !== item.entityName ||
          !isPendingAudit(fresh) ||
          !this.canAction(fresh)
        )
          return of<Outcome>({ id: item.id, state: 'failed' });
        const request =
          action === 'delete'
            ? this.tasksService.deleteMakerChecker(item.id)
            : this.tasksService.executeMakerCheckerAction(item.id, action);
        return request.pipe(
          timeout(30000),
          map((result: any): Outcome => ({
            id: item.id,
            state:
              result?.errors?.length || result?.rollbackTransaction || result?.transactionNotCommitted || result?.error
                ? 'failed'
                : result &&
                    (result.commandId === item.id ||
                      (!result.commandId && Number.isSafeInteger(result.resourceId) && result.resourceId > 0))
                  ? 'succeeded'
                  : 'unknown'
          })),
          catchError((error: any) =>
            of<Outcome>({ id: item.id, state: error?.status >= 400 && error.status < 500 ? 'failed' : 'unknown' })
          )
        );
      }),
      catchError(() => of<Outcome>({ id: item.id, state: 'failed' }))
    );
  }

  applyFilter(filterValue = '') {
    this.dataSource.filter = filterValue.trim().toLocaleLowerCase();
    this.selection.clear();
    this.clearDetail();
  }

  setOrder(newest: boolean): void {
    this.newestFirst = newest;
    this.selection.clear();
    this.setRecords(this.searchData);
  }

  reload() {
    this.loadMakerCheckers();
    // A filtered list cannot establish the global pending total. Only an explicit
    // refresh/decision needs this extra read; editing filters never duplicates it.
    if (Object.values(this.searchParams()).some((value) => value !== '' && value !== null && value !== undefined))
      this.tasksService
        .getMakerCheckerData()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ error: () => undefined });
  }
}
