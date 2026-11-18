/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateService, _ as extract } from '@ngx-translate/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { DatetimeFormatPipe } from 'app/pipes/datetime-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SystemService } from 'app/system/system.service';
import {
  OFFICE_AUDIT_MAX_LOADED,
  OFFICE_AUDIT_PAGE_SIZE,
  OfficeAuditEvent,
  OfficeAuditGroup,
  SubmittedOfficeField,
  auditId,
  canReadOfficeAudit,
  groupOfficeAudits,
  isDirectOfficeAudit,
  mergeOfficeAudits,
  officeAuditCsv,
  readOfficeAuditPage,
  submittedOfficeFields,
  validAuditRange
} from './office-audit';

interface AuditDetail {
  expanded: boolean;
  state: 'loading' | 'ready' | 'error';
  fields: SubmittedOfficeField[];
}

@Component({
  selector: 'mifosx-office-change-history-tab',
  templateUrl: './change-history-tab.component.html',
  styleUrls: ['./change-history-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    DatetimeFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeHistoryTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private system = inject(SystemService);
  private authentication = inject(AuthenticationService);
  private dates = inject(Dates);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private request?: Subscription;
  private templateRequest?: Subscription;
  private scopeChanged = new Subject<void>();
  private offset = 0;
  private serverTotal = 0;
  private query = '';

  readonly messages = {
    title: extract('branchHistory.title'),
    search: extract('branchHistory.search'),
    section: extract('branchHistory.section'),
    allHistory: extract('branchHistory.allHistory'),
    dateRange: extract('branchHistory.dateRange'),
    export: extract('branchHistory.export'),
    clearDates: extract('branchHistory.clearDates'),
    timezone: extract('branchHistory.timezone'),
    coverage: extract('branchHistory.coverage'),
    searchScope: extract('branchHistory.searchScope'),
    usersUnavailable: extract('branchHistory.usersUnavailable'),
    invalidRange: extract('branchHistory.invalidRange'),
    exportError: extract('branchHistory.exportError'),
    loading: extract('branchHistory.loading'),
    invalidResponse: extract('branchHistory.invalidResponse'),
    loadError: extract('branchHistory.loadError'),
    noMatches: extract('branchHistory.noMatches'),
    empty: extract('branchHistory.empty'),
    timestampUnavailable: extract('branchHistory.timestampUnavailable'),
    unidentifiedActor: extract('branchHistory.unidentifiedActor'),
    submittedFields: extract('branchHistory.submittedFields'),
    viewAudit: extract('branchHistory.viewAudit'),
    detailError: extract('branchHistory.detailError'),
    noBeforeValues: extract('branchHistory.noBeforeValues'),
    noSafeFields: extract('branchHistory.noSafeFields'),
    submittedValue: extract('branchHistory.submittedValue'),
    noValue: extract('branchHistory.noValue'),
    pageError: extract('branchHistory.pageError'),
    loadMore: extract('branchHistory.loadMore'),
    limitReached: extract('branchHistory.limitReached'),
    endLoaded: extract('branchHistory.endLoaded'),
    loadedScope: extract('branchHistory.loadedScope'),
    records: extract('branchHistory.records'),
    actors: extract('branchHistory.actors'),
    latestLoaded: extract('branchHistory.latestLoaded'),
    bySection: extract('branchHistory.bySection'),
    notice: extract('branchHistory.notice'),
    permission: extract('branchHistory.permission'),
    unknownAction: extract('branchHistory.unknownAction')
  };

  readonly pageSize = OFFICE_AUDIT_PAGE_SIZE;
  readonly maxLoaded = OFFICE_AUDIT_MAX_LOADED;
  readonly filters;
  officeId = '';
  events: OfficeAuditEvent[] = [];
  visibleEvents: OfficeAuditEvent[] = [];
  groups: OfficeAuditGroup[] = [];
  details = new Map<string, AuditDetail>();
  users: { id: string; username: string }[] = [];
  state: 'loading' | 'ready' | 'error' | 'invalid' | 'forbidden' = 'loading';
  loadingMore = false;
  pageError = false;
  templateError = false;
  exportError = false;
  showDates = false;
  rangeInvalid = false;

  constructor() {
    const formBuilder = inject(FormBuilder);
    this.filters = formBuilder.nonNullable.group({ search: '', section: 'all', makerId: '', from: '', to: '' });
  }

  get canRead(): boolean {
    return canReadOfficeAudit(this.authentication.getCredentials()) && this.state !== 'forbidden';
  }

  get hasMore(): boolean {
    return this.offset < this.serverTotal && this.offset < this.maxLoaded;
  }

  get atLimit(): boolean {
    return this.offset >= this.maxLoaded && this.offset < this.serverTotal;
  }

  get actorCount(): number {
    // The API records maker usernames, not maker IDs. Missing actors are never counted or called "System".
    return new Set(this.visibleEvents.map((event) => event.maker).filter(Boolean)).size;
  }

  get latest(): OfficeAuditEvent | undefined {
    return this.visibleEvents.find((event) => event.timestamp !== null);
  }

  get queryActive(): boolean {
    const { makerId, from, to } = this.filters.getRawValue();
    return !!(this.query || makerId || from || to);
  }

  actionLabel(event: OfficeAuditEvent): string {
    if (!event.actionName) return this.translate.instant('branchHistory.unknownAction');
    const key = `labels.auditTrail.actions.${event.actionName}`;
    const value = this.translate.instant(key);
    return value === key ? event.actionName : value;
  }

  isoTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(
        map((params) => params.get('officeId')),
        distinctUntilChanged(),
        // Recreate debounce and comparison state for each office; cancel its pending search on navigation.
        switchMap((officeId) => {
          this.scopeChanged.next();
          this.request?.unsubscribe();
          this.templateRequest?.unsubscribe();
          this.officeId = auditId(officeId) ?? '';
          this.filters.reset({ search: '', section: 'all', makerId: '', from: '', to: '' }, { emitEvent: false });
          this.query = '';
          this.users = [];
          this.showDates = false;
          this.state = 'loading';
          this.loadUsers();
          this.reload();
          return this.filters.controls.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged());
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.query = value.trim().toLocaleLowerCase();
        this.updateVisible();
      });
    this.filters.controls.section.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateVisible());
    this.filters.controls.makerId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    for (const control of [
      this.filters.controls.from,
      this.filters.controls.to
    ]) {
      // Silent date resets must not suppress a later selection of the same date.
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    }
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateVisible());
    this.destroyRef.onDestroy(() => {
      this.scopeChanged.next();
      this.scopeChanged.complete();
    });
  }

  private loadUsers(): void {
    this.templateError = false;
    this.filters.controls.makerId.disable({ emitEvent: false });
    if (!this.canRead || !this.officeId) return;
    this.templateRequest = this.system
      .getAuditTrailSearchTemplate()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (template) => {
          if (!Array.isArray(template?.appUsers)) {
            this.templateError = true;
          } else {
            this.users = template.appUsers.flatMap((user: any) =>
              auditId(user?.id) && typeof user.username === 'string'
                ? [{ id: auditId(user.id), username: user.username }]
                : []
            );
            this.filters.controls.makerId.enable({ emitEvent: false });
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          if (error.status === 401 || error.status === 403) this.deny();
          else this.templateError = true;
          this.cdr.markForCheck();
        }
      });
  }

  reload(): void {
    this.request?.unsubscribe();
    this.scopeChanged.next();
    this.details.clear();
    this.events = [];
    this.offset = 0;
    this.serverTotal = 0;
    this.pageError = false;
    this.exportError = false;
    this.loadingMore = false;
    const { from, to } = this.filters.getRawValue();
    this.rangeInvalid =
      !validAuditRange(from, to) || this.filters.controls.from.invalid || this.filters.controls.to.invalid;
    this.state = this.canRead ? 'ready' : 'forbidden';
    this.updateVisible();
    if (!this.officeId) {
      this.state = 'invalid';
      return;
    }
    if (!this.canRead || this.rangeInvalid) return;
    this.state = 'loading';
    this.loadPage();
  }

  loadMore(): void {
    if (this.state !== 'ready' || this.loadingMore || !this.hasMore || this.rangeInvalid || !this.canRead) return;
    this.loadingMore = true;
    this.loadPage();
  }

  private loadPage(): void {
    const limit = Math.min(this.pageSize, this.maxLoaded - this.offset);
    const { makerId, from, to } = this.filters.getRawValue();
    const filters = [
      { type: 'entityName', value: 'OFFICE' },
      { type: 'resourceId', value: this.officeId },
      { type: 'makerId', value: makerId }
    ];
    if (from || to) {
      filters.push({ type: 'dateFormat', value: 'yyyy-MM-dd HH:mm:ss' });
      if (from)
        filters.push({
          type: 'makerDateTimeFrom',
          value: this.dates.formatDate(new Date(from), 'yyyy-MM-dd HH:mm:ss')
        });
      if (to)
        filters.push({ type: 'makerDateTimeTo', value: this.dates.formatDate(new Date(to), 'yyyy-MM-dd HH:mm:ss') });
    }
    this.pageError = false;
    this.request = this.system
      .getAuditTrails(filters, 'madeOnDate', 'DESC', this.offset, limit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          try {
            const page = readOfficeAuditPage(response, this.officeId, limit);
            if (page.received === 0 && this.offset < page.total) throw new Error('Incomplete audit page');
            this.events = mergeOfficeAudits(this.events, page.events);
            // Advance by raw page size, including prefix matches excluded by exact entity verification.
            this.offset += page.received;
            this.serverTotal = page.total;
            this.state = 'ready';
            this.loadingMore = false;
            this.updateVisible();
          } catch {
            this.failedPage('invalid');
          }
        },
        error: (error) => {
          if (error.status === 401 || error.status === 403) this.deny();
          else this.failedPage('error');
        }
      });
  }

  private failedPage(state: 'error' | 'invalid'): void {
    this.pageError = this.events.length > 0;
    this.state = this.pageError ? 'ready' : state;
    this.loadingMore = false;
    this.cdr.markForCheck();
  }

  private deny(): void {
    this.request?.unsubscribe();
    this.templateRequest?.unsubscribe();
    this.scopeChanged.next();
    this.state = 'forbidden';
    this.events = [];
    this.users = [];
    this.details.clear();
    this.loadingMore = false;
    this.updateVisible();
  }

  private updateVisible(): void {
    const { from, to, section } = this.filters.getRawValue();
    const start = from ? new Date(from).getTime() : -Infinity;
    const end = to ? new Date(to).getTime() : Infinity;
    this.visibleEvents = this.events.filter((event) => {
      if (section !== 'all' && section !== 'general') return false;
      if ((from || to) && (event.timestamp === null || event.timestamp < start || event.timestamp > end)) return false;
      const fields = this.details.get(event.id)?.fields ?? [];
      const searchable = [
        event.id,
        event.maker,
        event.actionName,
        event.entityName,
        event.processingResult,
        this.translate.instant('labels.heading.General'),
        ...fields.flatMap((field) => [
          field.key,
          this.translate.instant(field.label),
          field.value ?? ''
        ])
      ];
      return !this.query || searchable.some((value) => value.toLocaleLowerCase().includes(this.query));
    });
    this.groups = groupOfficeAudits(this.visibleEvents);
    this.cdr.markForCheck();
  }

  toggleDetail(event: OfficeAuditEvent): void {
    if (!this.canRead || !this.events.includes(event) || !isDirectOfficeAudit(event, this.officeId)) return;
    const cached = this.details.get(event.id);
    if (cached && cached.state !== 'error') {
      cached.expanded = !cached.expanded;
      return;
    }
    const detail: AuditDetail = { expanded: true, state: 'loading', fields: [] };
    this.details.set(event.id, detail);
    this.system
      .getAuditTrail(event.id)
      .pipe(takeUntil(this.scopeChanged), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!isDirectOfficeAudit(response, this.officeId) || auditId(response.id) !== event.id) {
            detail.state = 'error';
          } else {
            const fields = submittedOfficeFields(response.commandAsJson);
            detail.state = fields === null ? 'error' : 'ready';
            detail.fields = fields ?? [];
          }
          this.updateVisible();
        },
        error: (error) => {
          if (error.status === 401 || error.status === 403) this.deny();
          else {
            detail.state = 'error';
            this.cdr.markForCheck();
          }
        }
      });
  }

  clearDates(): void {
    this.filters.patchValue({ from: '', to: '' }, { emitEvent: false });
    this.reload();
  }

  exportCsv(): void {
    if (
      !this.canRead ||
      this.state !== 'ready' ||
      this.loadingMore ||
      this.pageError ||
      this.rangeInvalid ||
      !this.visibleEvents.length
    )
      return;
    this.exportError = false;
    let url: string | undefined;
    try {
      const headers = [
        'labels.inputs.Trail ID',
        'labels.inputs.Resource ID',
        'labels.inputs.Entity',
        'labels.inputs.Action',
        'labels.inputs.Made By',
        'labels.inputs.Made Date',
        'labels.inputs.Status',
        'labels.inputs.Checker',
        'labels.inputs.Checked Date'
      ].map((key) => this.translate.instant(key));
      const csv = officeAuditCsv(this.visibleEvents, this.officeId, headers);
      url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `office-${this.officeId}-loaded-audit.csv`;
      link.click();
    } catch {
      this.exportError = true;
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  }
}
