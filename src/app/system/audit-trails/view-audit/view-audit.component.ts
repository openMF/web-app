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
import { ElementRef, Injector, ViewChild, afterNextRender } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject, interval, merge, takeUntil } from 'rxjs';
import moment from 'moment';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from '../../system.service';
import { AuditEvent, auditId, auditPage, auditTone, canReadAudit, checkerState } from '../audit-presentation';
import {
  AuditDetail,
  REQUEST_FORMAT,
  SubmittedDifference,
  auditDetail,
  compareSubmissions,
  creationInterval,
  jsonTokens,
  orderedHistory,
  safeAuditJson,
  sameResource
} from './audit-detail';
import { ResolvedAudit, auditScope } from './audit-trail.resolver';

@Component({
  selector: 'mifosx-view-audit',
  templateUrl: './view-audit.component.html',
  styleUrls: ['./view-audit.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAuditComponent implements OnInit {
  @ViewChild('auditHeading') auditHeading?: ElementRef<HTMLElement>;
  private injector = inject(Injector);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private system = inject(SystemService);
  private organization = inject(OrganizationService);
  private auth = inject(AuthenticationService);
  private settings = inject(SettingsService);
  private dates = inject(Dates);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private cancel = new Subject<void>();
  private scope = '';
  private offset = 0;
  private total = 0;
  private generation = 0;

  readonly tone = auditTone;
  readonly columns = [
    'field',
    'value',
    'parameter'
  ];
  readonly comparisonColumns = [
    'field',
    'previous',
    'current',
    'kind'
  ];
  state: ResolvedAudit['state'] | 'loading' = 'loading';
  detail?: AuditDetail;
  history: AuditEvent[] = [];
  loadingHistory = false;
  historyError = false;
  comparisonState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  comparison: SubmittedDifference[] = [];
  comparedId = '';
  parentName = '';
  feedback = '';
  tokens: { text: string; kind: string }[] = [];

  get event(): AuditEvent | undefined {
    return this.detail?.event;
  }
  get fields() {
    return this.detail?.command.fields.filter((field) => !REQUEST_FORMAT.has(field.key)) ?? [];
  }
  get formatFields() {
    return this.detail?.command.fields.filter((field) => REQUEST_FORMAT.has(field.key)) ?? [];
  }
  get hasMore(): boolean {
    return this.offset < this.total && this.offset < 500;
  }
  get atLimit(): boolean {
    return this.offset >= 500 && this.offset < this.total;
  }
  get previous(): AuditEvent | undefined {
    return this.history.find(
      (event) => event.timestamp !== null && this.event?.timestamp !== null && event.timestamp < this.event?.timestamp
    );
  }
  get next(): AuditEvent | undefined {
    return [...this.history]
      .reverse()
      .find(
        (event) => event.timestamp !== null && this.event?.timestamp !== null && event.timestamp > this.event?.timestamp
      );
  }
  get heading(): string {
    const name = this.event?.entityName === 'OFFICE' ? this.fields.find((field) => field.key === 'name') : undefined;
    if (name && name.value.startsWith('"')) return JSON.parse(name.value);
    return this.resourceLabel;
  }
  get resourceLabel(): string {
    return this.event ? this.entity(this.event) + (this.event.resourceId ? ' #' + this.event.resourceId : '') : '';
  }
  get resourceLink(): string[] | null {
    return this.event?.entityName === 'OFFICE' && auditId(this.event.resourceId) && this.hasPermission('READ_OFFICE')
      ? [
          '/organization/offices',
          this.event.resourceId
        ]
      : null;
  }
  get checkerStatus(): string {
    return this.event ? checkerState(this.event) : '';
  }
  get minutesAfterCreation(): number | null {
    return this.event ? creationInterval(this.event, this.history) : null;
  }

  ngOnInit(): void {
    this.scope = auditScope(this.auth, this.settings);
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.reset();
        this.state = 'loading';
        this.cdr.markForCheck();
      }
    });
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.reset();
      // Each resolver emission belongs to a new navigation, which may use a new authorized scope.
      this.scope = auditScope(this.auth, this.settings);
      this.state = 'loading';
      const resolved = data['auditTrail'] as ResolvedAudit;
      if (!this.authorized() || resolved?.scope !== this.scope) {
        this.deny();
        return;
      }
      this.state = resolved?.state ?? 'invalid';
      this.detail = resolved?.detail;
      this.tokens = jsonTokens(this.detail?.command.json ?? '');
      afterNextRender(() => this.auditHeading?.nativeElement.focus(), { injector: this.injector });
      if (this.state === 'ready' && this.detail) {
        this.loadHistory();
        this.resolveParent();
      }
      this.cdr.markForCheck();
    });
    merge(this.auth.isAuthenticated$, interval(500))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.authorized()) this.deny();
      });
    this.destroyRef.onDestroy(() => {
      this.reset();
      this.cancel.complete();
    });
  }
  private hasPermission(permission: string): boolean {
    return [
      permission,
      'ALL_FUNCTIONS',
      'ALL_FUNCTIONS_READ'
    ].some((item) => this.auth.getCredentials()?.permissions?.includes(item));
  }
  private authorized(): boolean {
    return (
      this.state !== 'forbidden' &&
      canReadAudit(this.auth.getCredentials()) &&
      this.scope === auditScope(this.auth, this.settings)
    );
  }
  private reset(): void {
    this.generation++;
    this.cancel.next();
    this.detail = undefined;
    this.tokens = [];
    this.history = [];
    this.comparison = [];
    this.comparisonState = 'idle';
    this.comparedId = '';
    this.offset = 0;
    this.total = 0;
    this.loadingHistory = false;
    this.historyError = false;
    this.parentName = '';
    this.feedback = '';
  }
  private deny(): void {
    this.reset();
    this.state = 'forbidden';
    this.cdr.markForCheck();
  }
  private failure(error: { status?: number }, action: () => void): void {
    if (!this.authorized() || error.status === 401 || error.status === 403) this.deny();
    else {
      action();
      this.cdr.markForCheck();
    }
  }
  loadHistory(): void {
    if (
      !this.authorized() ||
      !this.event?.resourceId ||
      !/^[A-Z][A-Z0-9_]*$/.test(this.event.entityName) ||
      this.loadingHistory ||
      this.atLimit
    )
      return;
    this.loadingHistory = true;
    this.historyError = false;
    const selected = this.event;
    this.system
      .getAuditTrails(
        [
          { type: 'entityName', value: selected.entityName },
          { type: 'resourceId', value: selected.resourceId }
        ],
        'id',
        'DESC',
        this.offset,
        25
      )
      .pipe(takeUntil(this.cancel), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: unknown) => {
          if (!this.authorized()) {
            this.deny();
            return;
          }
          try {
            const page = auditPage(response, 25);
            if (!page.events.length && this.offset < page.total) throw new Error('Incomplete page');
            this.offset += page.events.length;
            this.total = page.total;
            this.history = orderedHistory([
              ...this.history,
              ...page.events.filter((event) => sameResource(event, selected))
            ]);
            this.loadingHistory = false;
          } catch {
            this.loadingHistory = false;
            this.historyError = true;
          }
          this.cdr.markForCheck();
        },
        error: (error) =>
          this.failure(error, () => {
            this.loadingHistory = false;
            this.historyError = true;
          })
      });
  }
  private resolveParent(): void {
    if (this.event?.entityName !== 'OFFICE' || !this.hasPermission('READ_OFFICE')) return;
    const value = this.fields.find((field) => field.key === 'parentId')?.value;
    if (!value) return;
    const id = auditId(value.startsWith('"') ? JSON.parse(value) : value);
    if (!id) return;
    this.organization
      .getOffice(id)
      .pipe(takeUntil(this.cancel), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (office: unknown) => {
          if (!this.authorized()) {
            this.deny();
            return;
          }
          if (
            office &&
            typeof office === 'object' &&
            'id' in office &&
            'name' in office &&
            auditId(office.id) === id &&
            typeof office.name === 'string'
          )
            this.parentName = office.name;
          this.cdr.markForCheck();
        },
        // A denied current-office lookup does not revoke separately authorized audit access.
        error: () => {
          this.parentName = '';
          this.cdr.markForCheck();
        }
      });
  }
  compare(): void {
    const previous = this.previous;
    if (!previous || !this.detail || !this.authorized() || this.comparisonState === 'loading') return;
    this.comparison = [];
    this.comparisonState = 'loading';
    this.comparedId = previous.id;
    this.system
      .getAuditTrail(previous.id)
      .pipe(takeUntil(this.cancel), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: unknown) => {
          if (!this.authorized()) {
            this.deny();
            return;
          }
          try {
            this.comparison = compareSubmissions(auditDetail(response, previous.id), this.detail);
            this.comparisonState = 'ready';
          } catch {
            this.comparisonState = 'error';
          }
          this.cdr.markForCheck();
        },
        error: (error) =>
          this.failure(error, () => {
            this.comparisonState = 'error';
          })
      });
  }
  navigate(event?: AuditEvent): void {
    if (event && this.event && this.authorized() && sameResource(event, this.event))
      void this.router.navigate(
        [
          '../',
          event.id
        ],
        { relativeTo: this.route, queryParamsHandling: 'preserve' }
      );
  }
  entity(event: AuditEvent): string {
    return this.translated('labels.auditTrail.entities.' + event.entityName, event.entityName);
  }
  status(event: AuditEvent): string {
    if (checkerState(event) === 'pending') return this.translate.instant('auditDetails.pending');
    return this.translated(
      'labels.auditTrail.statuses.' + event.processingResult,
      event.processingResult || this.translate.instant('auditDetails.notRecorded')
    );
  }
  action(event: AuditEvent): string {
    return this.translated('labels.auditTrail.actions.' + event.actionName, event.actionName);
  }
  label(key: string): string {
    if (this.event?.entityName === 'OFFICE' && key === 'name')
      return this.translate.instant('labels.inputs.Office Name');
    if (this.event?.entityName === 'OFFICE' && key === 'parentId')
      return this.translate.instant('labels.inputs.Parent Office');
    return this.translated('labels.auditTrail.fields.' + key, key);
  }
  private translated(key: string, fallback: string): string {
    const value = this.translate.instant(key);
    return value === key ? fallback : value;
  }
  date(timestamp: number | null, weekday = false): string {
    if (timestamp === null) return this.translate.instant('auditDetails.notRecorded');
    return moment(timestamp)
      .locale(this.dates.getMomentLocale(this.settings.language))
      .format(weekday ? 'dddd' : 'LL, HH:mm:ss');
  }
  display(value?: string): string {
    if (value === undefined) return this.translate.instant('auditDetails.notSupplied');
    if (value === 'null') return this.translate.instant('auditDetails.nullValue');
    return value.startsWith('"') ? JSON.parse(value) : value;
  }
  displayField(key: string, value: string): string {
    if (key === 'openingDate' && this.event?.entityName === 'OFFICE' && value.startsWith('"')) {
      const format = this.formatFields.find((field) => field.key === 'dateFormat')?.value;
      const locale = this.formatFields.find((field) => field.key === 'locale')?.value;
      if (format?.startsWith('"')) {
        const date = moment(
          JSON.parse(value),
          this.dates.angularToMomentFormat(JSON.parse(format)),
          locale?.startsWith('"') ? JSON.parse(locale) : 'en',
          true
        );
        if (date.isValid()) return date.locale(this.dates.getMomentLocale(this.settings.language)).format('LL');
      }
    }
    return this.display(value);
  }
  async copy(jsonOnly = false): Promise<void> {
    if (!this.detail || !this.authorized()) return;
    const generation = this.generation;
    try {
      await navigator.clipboard.writeText(jsonOnly ? this.detail.command.json : safeAuditJson(this.detail));
      if (generation === this.generation && this.authorized()) this.feedback = 'copied';
    } catch {
      if (generation === this.generation && this.authorized()) this.feedback = 'copyFailed';
    }
    this.cdr.markForCheck();
  }
  exportJson(): void {
    if (!this.detail || !this.authorized()) return;
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([safeAuditJson(this.detail)], { type: 'application/json;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-trail-${this.event.id}.json`;
      link.click();
      this.feedback = 'exported';
    } catch {
      this.feedback = 'exportFailed';
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  }
}
