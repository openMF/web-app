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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom, interval, merge, takeUntil, Subject } from 'rxjs';
import moment from 'moment';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SystemService } from '../system.service';
import { AuditTrailsDataSource } from './audit-trail.datasource';
import {
  AuditEvent,
  SafeCommand,
  auditEvent,
  auditPage,
  auditDay,
  auditTone,
  checkerState,
  safeCommand,
  auditId,
  canReadAudit,
  validAuditRange,
  auditCsv
} from './audit-presentation';

interface FilterState {
  mode: string;
  search: string;
  entityName: string;
  actionName: string;
  processingResult: string;
  makerId: string;
  checkerId: string;
  from: string;
  to: string;
  checkedFrom: string;
  checkedTo: string;
}
const EMPTY: FilterState = {
  mode: 'trail',
  search: '',
  entityName: '',
  actionName: '',
  processingResult: '',
  makerId: '',
  checkerId: '',
  from: '',
  to: '',
  checkedFrom: '',
  checkedTo: ''
};
interface Preset {
  name: string;
  filters: FilterState;
}

@Component({
  selector: 'mifosx-audit-trails',
  templateUrl: './audit-trails.component.html',
  styleUrls: ['./audit-trails.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatMenuModule,
    MatExpansionModule,
    MatProgressBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditTrailsComponent implements OnInit {
  private system = inject(SystemService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthenticationService);
  private settings = inject(SettingsService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private detailRequest?: Subscription;
  private exactRequest?: Subscription;
  private exportCancel = new Subject<void>();
  private exportRun = 0;
  private scope = '';
  private applied: FilterState = { ...EMPTY };
  private returnState?: { filters: FilterState; event: AuditEvent; pageIndex: number };
  private formBuilder = inject(FormBuilder);
  readonly filters = this.formBuilder.nonNullable.group({ ...EMPTY });
  readonly presetName = this.formBuilder.nonNullable.control('');
  readonly dataSource = new AuditTrailsDataSource(this.system, () => this.scopeValid());
  readonly tone = auditTone;
  readonly checkerState = checkerState;
  rows: AuditEvent[] = [];
  total = 0;
  loading = false;
  error = false;
  invalid = false;
  forbidden = false;
  template: any = { appUsers: [], actionNames: [], entityNames: [], processingResults: [] };
  selected?: AuditEvent;
  detail?: AuditEvent;
  command?: SafeCommand;
  detailLoading = false;
  detailError = false;
  showDates = false;
  showPresets = false;
  jsonOpen = false;
  pageIndex = 0;
  pageSize = 25;
  orderBy = 'id';
  direction = 'desc';
  exact = false;
  history?: { entityName: string; resourceId: string };
  presets: Preset[] = [];
  activePreset = '';
  exporting = false;
  exported = 0;
  feedback = '';

  get canRead(): boolean {
    return canReadAudit(this.auth.getCredentials()) && !this.forbidden;
  }
  private currentScope(): string {
    const credentials = this.auth.getCredentials();
    return JSON.stringify([
      this.settings.serverUrl,
      this.settings.tenantIdentifier,
      credentials?.userId,
      credentials?.username,
      credentials?.authenticated,
      credentials?.permissions
    ]);
  }
  private scopeValid(): boolean {
    return this.canRead && this.scope === this.currentScope();
  }
  ngOnInit(): void {
    this.scope = this.currentScope();
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      const source = data['auditTrailSearchTemplate'] ?? {};
      this.template = {
        appUsers: (source.appUsers ?? []).filter((user: any) => auditId(user.id) && typeof user.username === 'string'),
        actionNames: (source.actionNames ?? []).filter((value: any) => typeof value === 'string'),
        entityNames: (source.entityNames ?? []).filter((value: any) => typeof value === 'string'),
        processingResults: (source.processingResults ?? source.statuses ?? []).filter(
          (value: any) => auditId(value.id) && typeof value.processingResult === 'string'
        )
      };
    });
    this.dataSource.rows$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((rows) => {
      this.rows = rows;
      this.cdr.markForCheck();
    });
    this.dataSource.records$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((total) => {
      this.total = total;
      this.cdr.markForCheck();
    });
    this.dataSource.loading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.loading = value;
      this.cdr.markForCheck();
    });
    this.dataSource.error$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.error = value;
      this.cdr.markForCheck();
    });
    // In-memory named presets deliberately retain neither audit payloads nor browser-persistent preferences.
    merge(this.auth.isAuthenticated$, interval(500))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.scopeValid()) this.invalidateScope();
      });
    this.destroyRef.onDestroy(() => {
      this.dataSource.disconnect();
      this.detailRequest?.unsubscribe();
      this.exactRequest?.unsubscribe();
      this.exportCancel.next();
      this.exportCancel.complete();
      this.presets = [];
    });
    this.apply();
  }
  private invalidateScope(): void {
    this.forbidden = true;
    this.dataSource.clear();
    this.closeDetail();
    this.exactRequest?.unsubscribe();
    this.exportRun++;
    this.exportCancel.next();
    this.exporting = false;
    this.presets = [];
    this.template = {};
    this.filters.reset({ ...EMPTY });
    this.applied = { ...EMPTY };
    this.history = undefined;
    this.returnState = undefined;
    this.feedback = '';
    this.cdr.markForCheck();
  }
  private valid(state: FilterState): boolean {
    const member = (value: string, values: any[], key?: string) =>
      !value || values.some((item) => String(key ? item[key] : item) === value);
    return [
        'trail',
        'resource',
        'user'
      ].includes(
        state.mode
      ) && state.search.length <= 128 && (!state.search || (state.mode === 'user' ? this.template.appUsers.some((user: any) => user.username === state.search) : !!auditId(state.search))) && member(state.entityName, this.template.entityNames) && member(state.actionName, this.template.actionNames) && member(state.processingResult, this.template.processingResults, 'id') && member(state.makerId, this.template.appUsers, 'id') && member(state.checkerId, this.template.appUsers, 'id') && validAuditRange(state.from, state.to) && validAuditRange(state.checkedFrom, state.checkedTo);
  }
  query(state = this.applied): { type: string; value: string }[] {
    const result = [
      'entityName',
      'actionName',
      'makerId',
      'checkerId',
      'processingResult'
    ].map((key) => ({ type: key, value: state[key as keyof FilterState] }));
    // Current Fineract consumes status; older deployments consume processingResult. Both are verified DTO fields.
    result.push({ type: 'status', value: state.processingResult });
    if (state.search && state.mode === 'resource') result.push({ type: 'resourceId', value: state.search });
    if (state.search && state.mode === 'user') {
      result.find((filter) => filter.type === 'makerId').value = String(
        this.template.appUsers.find((user: any) => user.username === state.search).id
      );
    }
    for (const [
      key,
      type
    ] of [
      [
        'from',
        'makerDateTimeFrom'
      ],
      [
        'to',
        'makerDateTimeTo'
      ],
      [
        'checkedFrom',
        'checkerDateTimeFrom'
      ],
      [
        'checkedTo',
        'checkerDateTimeTo'
      ]
    ]) {
      result.push({
        type,
        value: state[key as keyof FilterState]
          ? moment(state[key as keyof FilterState]).format('YYYY-MM-DD HH:mm:ss')
          : ''
      });
    }
    result.push({ type: 'dateFormat', value: 'yyyy-MM-dd HH:mm:ss' }, { type: 'locale', value: 'en' });
    return result.filter((filter) => filter.value !== '');
  }
  apply(changed?: string): void {
    if (!this.scopeValid()) return;
    const state = this.filters.getRawValue();
    state.search = state.search.trim();
    if (changed === 'makerId' && state.mode === 'user') state.search = '';
    if (state.mode === 'user' && state.search) {
      const user = this.template.appUsers.find((item: any) => item.username === state.search);
      if (user) state.makerId = String(user.id);
    }
    this.invalid = !this.valid(state);
    if (this.invalid) return;
    this.cancelExport();
    this.exactRequest?.unsubscribe();
    this.closeDetail();
    this.filters.reset(state);
    this.applied = { ...state };
    this.pageIndex = 0;
    this.history = undefined;
    this.returnState = undefined;
    this.activePreset = '';
    this.exact = !!state.search && state.mode === 'trail';
    if (this.exact) {
      // Exact lookup has its own unambiguous scope. Clear unrelated controls before requesting it.
      this.applied = { ...EMPTY, mode: 'trail', search: state.search };
      this.filters.reset(this.applied);
      this.dataSource.clear();
      this.loading = true;
      this.exactRequest = this.system.getAuditTrail(state.search).subscribe({
        next: (response) => {
          if (!this.scopeValid()) {
            this.invalidateScope();
            return;
          }
          try {
            const event = auditEvent(response);
            if (event.id !== state.search) throw new Error('Mismatched audit');
            this.rows = [event];
            this.total = 1;
            this.loading = false;
            this.selected = event;
            this.setDetail(response, event);
            this.cdr.markForCheck();
          } catch {
            this.exactFailed();
          }
        },
        error: () => this.exactFailed()
      });
    } else this.load();
  }
  private exactFailed(): void {
    this.rows = [];
    this.total = 0;
    this.loading = false;
    this.error = true;
    this.cdr.markForCheck();
  }
  clear(): void {
    this.filters.reset({ ...EMPTY });
    this.apply();
  }
  load(): void {
    if (!this.scopeValid()) {
      this.invalidateScope();
      return;
    }
    this.dataSource.getAuditTrails(
      this.query(),
      this.orderBy,
      this.direction,
      this.pageIndex,
      this.pageSize,
      this.history
    );
  }
  page(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }
  sort(event: Sort): void {
    this.orderBy = event.direction ? event.active : 'id';
    this.direction = event.direction || 'desc';
    this.pageIndex = 0;
    this.load();
  }
  label(value: string, group: string): string {
    if (!value) return this.translate.instant('auditRedesign.notRecorded');
    const key = 'labels.auditTrail.' + group + '.' + value;
    const translated = this.translate.instant(key);
    return translated === key ? value : translated;
  }
  dayStart(index: number): boolean {
    return index === 0 || auditDay(this.rows[index]) !== auditDay(this.rows[index - 1]);
  }
  date(timestamp: number | null, timeOnly = false): string {
    if (timestamp === null) return this.translate.instant('auditRedesign.notRecorded');
    return new Intl.DateTimeFormat(
      this.settings.language.code,
      timeOnly ? { timeStyle: 'medium' } : { dateStyle: 'full' }
    ).format(timestamp);
  }
  timestamp(timestamp: number | null): string {
    return timestamp === null
      ? this.translate.instant('auditRedesign.notRecorded')
      : new Intl.DateTimeFormat(this.settings.language.code, { dateStyle: 'medium', timeStyle: 'medium' }).format(
          timestamp
        );
  }
  select(event: AuditEvent): void {
    if (!this.scopeValid()) return;
    this.closeDetail(false);
    this.selected = event;
    this.detailLoading = true;
    this.detailRequest = this.system.getAuditTrail(event.id).subscribe({
      next: (response) => {
        if (!this.scopeValid()) {
          this.invalidateScope();
          return;
        }
        try {
          this.setDetail(response, event);
        } catch {
          this.detailError = true;
        }
        this.detailLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.detailError = true;
        this.detailLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
  private setDetail(response: any, expected: AuditEvent): void {
    const event = auditEvent(response);
    if (
      event.id !== expected.id ||
      event.entityName !== expected.entityName ||
      event.resourceId !== expected.resourceId
    )
      throw new Error('Mismatched audit detail');
    this.detail = event;
    this.command = safeCommand(response.commandAsJson);
  }
  resourceLink(): string[] | null {
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return this.detail?.entityName === 'OFFICE' && this.detail.resourceId && [
        'READ_OFFICE',
        'ALL_FUNCTIONS_READ',
        'ALL_FUNCTIONS'
      ].some((permission) => permissions.includes(permission)) ? [
          '/organization/offices',
          this.detail.resourceId
        ] : null;
  }
  closeDetail(restoreFocus = true): void {
    if (restoreFocus && this.selected) document.getElementById('audit-trail-' + this.selected.id)?.focus();
    this.detailRequest?.unsubscribe();
    this.selected = undefined;
    this.detail = undefined;
    this.command = undefined;
    this.jsonOpen = false;
    this.detailLoading = false;
    this.detailError = false;
  }
  resourceHistory(): void {
    if (this.history || !this.detail?.entityName || !this.detail.resourceId || !this.scopeValid()) return;
    const event = this.detail;
    this.returnState = { filters: { ...this.applied }, event, pageIndex: this.pageIndex };
    this.applied = { ...EMPTY, mode: 'resource', search: event.resourceId, entityName: event.entityName };
    this.filters.reset(this.applied);
    this.history = { entityName: event.entityName, resourceId: event.resourceId };
    this.exact = false;
    this.pageIndex = 0;
    this.cancelExport();
    this.load();
  }
  backToEvent(): void {
    if (!this.returnState) return;
    const previous = this.returnState;
    this.returnState = undefined;
    this.history = undefined;
    this.filters.reset(previous.filters);
    this.applied = previous.filters;
    this.pageIndex = previous.pageIndex;
    this.exact = !!this.applied.search && this.applied.mode === 'trail';
    if (this.exact) this.apply();
    else this.load();
    this.select(previous.event);
  }
  savePreset(): void {
    const name = this.presetName.value.trim();
    if (!name || name.length > 64 || !this.valid(this.filters.getRawValue()) || this.presets.length >= 20) return;
    this.presets = [
      ...this.presets.filter((preset) => preset.name !== name),
      { name, filters: { ...this.filters.getRawValue() } }
    ];
    this.presetName.reset();
  }
  restore(preset: Preset): void {
    if (!this.scopeValid() || !this.valid(preset.filters)) return;
    this.filters.reset({ ...preset.filters });
    this.apply();
    this.activePreset = preset.name;
  }
  deletePreset(preset: Preset): void {
    this.presets = this.presets.filter((item) => item !== preset);
    if (this.activePreset === preset.name) this.activePreset = '';
  }
  failedOperations(): void {
    const status = this.template.processingResults.find((item: any) => /^failed$/i.test(item.processingResult));
    if (!status) return;
    this.filters.reset({ ...EMPTY, processingResult: String(status.id) });
    this.apply();
  }
  get hasFailedStatus(): boolean {
    return !!this.template.processingResults?.some((item: any) => /^failed$/i.test(item.processingResult));
  }
  today(): void {
    const entityName = this.template.entityNames.find((name: string) => name === 'OFFICE');
    if (!entityName) return;
    const day = moment().format('YYYY-MM-DD');
    this.filters.reset({ ...EMPTY, entityName, from: day + 'T00:00', to: day + 'T23:59:59' });
    this.apply();
  }
  mine(): void {
    const id = String(this.auth.getCredentials()?.userId);
    if (!this.template.appUsers.some((user: any) => String(user.id) === id)) return;
    this.filters.reset({ ...EMPTY, makerId: id });
    this.apply();
  }
  async copy(): Promise<void> {
    if (!this.detail || !this.scopeValid()) return;
    const event = this.detail;
    const scope = this.scope;
    const values = {
      id: event.id,
      action: event.actionName,
      entity: event.entityName,
      resourceId: event.resourceId,
      maker: event.maker,
      madeOn: this.timestamp(event.timestamp),
      checker: event.checker,
      status: event.processingResult
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(values, null, 2));
      if (scope === this.scope && this.scopeValid()) this.feedback = 'copied';
    } catch {
      if (this.scopeValid()) this.feedback = 'copyFailed';
    }
    this.cdr.markForCheck();
  }
  cancelExport(): void {
    this.exportRun++;
    this.exportCancel.next();
    this.exporting = false;
  }
  async downloadCSV(): Promise<void> {
    if (this.exporting || !this.scopeValid()) return;
    // Applying pending edits first makes the exported population match the displayed filter controls.
    if (JSON.stringify(this.filters.getRawValue()) !== JSON.stringify(this.applied)) this.apply();
    if (this.invalid || !this.scopeValid()) return;
    const run = ++this.exportRun;
    this.exporting = true;
    this.exported = 0;
    this.feedback = '';
    const snapshot = JSON.stringify(this.applied);
    const history = this.history;
    const query = this.query();
    const events: AuditEvent[] = [];
    const seen = new Set<string>();
    try {
      if (this.exact) {
        if (this.loading || this.error || this.rows.length !== 1) throw new Error('Exact lookup incomplete');
        events.push(this.rows[0]);
      } else {
        let offset = 0;
        let total: number | undefined;
        // Bounded complete export: never download a partial result or silently truncate at the cap.
        do {
          const response = await firstValueFrom(
            this.system.getAuditTrails(query, 'id', 'desc', offset, 200).pipe(takeUntil(this.exportCancel))
          );
          if (
            !this.scopeValid() ||
            snapshot !== JSON.stringify(this.applied) ||
            !this.exporting ||
            run !== this.exportRun
          )
            throw new Error('Scope changed');
          const page = auditPage(response, 200);
          if (total !== undefined && page.total !== total) throw new Error('Audit population changed');
          total = page.total;
          if (total > 10000 || (!page.events.length && offset < total) || offset + page.events.length > total)
            throw new Error('Incomplete export');
          for (const event of page.events) {
            if (seen.has(event.id)) throw new Error('Unstable pagination');
            seen.add(event.id);
            if (!history || (history.entityName === event.entityName && history.resourceId === event.resourceId))
              events.push(event);
          }
          offset += page.events.length;
          this.exported = offset;
          this.cdr.markForCheck();
        } while (offset < total);
      }
      if (!this.scopeValid() || !this.exporting || run !== this.exportRun) return;
      const headers = [
        'trailId',
        'action',
        'entity',
        'resourceId',
        'office',
        'madeBy',
        'madeOn',
        'checker',
        'checkedOn',
        'status'
      ].map((key) => this.translate.instant('auditRedesign.' + key));
      const url = URL.createObjectURL(new Blob([auditCsv(events, headers)], { type: 'text/csv;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'audit-trails.csv';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.feedback = 'exportDone';
    } catch {
      if (this.scopeValid() && this.exporting && run === this.exportRun) this.feedback = 'exportFailed';
    } finally {
      if (run === this.exportRun) this.exporting = false;
      this.cdr.markForCheck();
    }
  }
}
