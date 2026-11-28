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

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
  effect
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatRadioButton } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { _ as extract } from '@ngx-translate/core';
import {
  Subject,
  distinctUntilChanged,
  filter,
  forkJoin,
  fromEvent,
  map,
  merge,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { OperationsDataService } from './operations-data.service';
import {
  AuditEvent,
  OperationsArea,
  OperationsTask,
  Queue,
  QueuePage,
  matchesTask,
  sortTasks,
  validTaskKey
} from './operations-task.model';

@Component({
  selector: 'mifosx-operations-dashboard',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatSlideToggle,
    MatRadioButton,
    MatTableModule,
    MatProgressSpinner
  ],
  templateUrl: './operations-dashboard.component.html',
  styleUrls: ['./operations-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationsDashboardComponent implements OnInit {
  readonly data = inject(OperationsDataService);
  private readonly auth = inject(AuthenticationService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly reload = new Subject<void>();
  private readonly requestedTaskRequest = new Subject<string>();
  private requestedLookupKey = '';
  lookupLoading = false;
  private readonly historyRequest = new Subject<OperationsTask | null>();
  readonly search = this.formBuilder.nonNullable.control('');
  readonly mine = this.formBuilder.nonNullable.control({ value: false, disabled: true });
  readonly queues: Queue[] = [
    'registrations',
    'enrollment',
    'approval',
    'disbursement'
  ];
  readonly pageIndex: Record<Queue, number> = { registrations: 0, enrollment: 0, approval: 0, disbursement: 0 };
  readonly columns = [
    'select',
    'age',
    'task',
    'owner',
    'area',
    'flags'
  ];
  readonly filters = [
    { id: 'all', label: extract('operations.all') },
    { id: 'on-time', label: extract('operations.onTime') },
    { id: 'at-risk', label: extract('operations.atRisk') },
    { id: 'overdue', label: extract('operations.overdue') },
    { id: 'unknown', label: extract('operations.unknownAge') }
  ];
  readonly cards = [
    { area: 'prospect' as const, icon: 'person_outline', title: extract('operations.prospects') },
    { area: 'loan' as const, icon: 'account_balance_wallet', title: extract('operations.loans') },
    { area: 'collection' as const, icon: 'south', title: extract('operations.collections') }
  ];
  pages: QueuePage[] = [];
  tasks: OperationsTask[] = [];
  visible: OperationsTask[] = [];
  selected: OperationsTask | null = null;
  activity: AuditEvent[] | null = null;
  history: AuditEvent[] | null = null;
  historyLoading = false;
  loading = true;
  area: OperationsArea | '' = '';
  age = 'all';
  requestedKey = '';
  requestedMissing = false;
  private selectionKey = '';
  private currentScope = '';
  private currentIdentity = '';

  constructor() {
    // SettingsService exposes a signal-backed business date. Refresh ages on changes.
    effect(() => {
      const scope = this.data.scope();
      if (this.currentScope && scope !== this.currentScope) this.reload.next();
    });
  }

  ngOnInit(): void {
    this.requestedTaskRequest
      .pipe(
        tap(() => {
          this.lookupLoading = true;
        }),
        switchMap((key) => {
          const scope = this.data.scope();
          return (key ? this.data.lookupTask(key) : of(null)).pipe(map((task) => ({ key, scope, task })));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ key, scope, task }) => {
        this.lookupLoading = false;
        if (key && key === this.requestedKey && scope === this.data.scope()) {
          if (task && !this.tasks.some((row) => row.key === task.key))
            this.tasks = sortTasks([
              ...this.tasks,
              task
            ]);
          this.applyFilters();
        }
      });
    this.historyRequest
      .pipe(
        tap(() => {
          this.history = null;
          this.historyLoading = true;
        }),
        switchMap((task) => (task?.source === 'loan' ? this.data.audits(task.sourceId) : of(null))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((events) => {
        this.history = events;
        this.historyLoading = false;
        this.cdr.markForCheck();
      });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.requestedTaskRequest.next('');
      this.requestedLookupKey = '';
      this.tasks = sortTasks(this.pages.flatMap((page) => page.tasks));
      const key = params.get('operationsTask') ?? '';
      this.requestedKey = validTaskKey(key) ? key : '';
      if (this.requestedKey) {
        this.area = '';
        this.age = 'all';
        this.search.setValue('', { emitEvent: false });
        this.mine.setValue(false, { emitEvent: false });
      }
      this.applyFilters();
    });
    merge(this.search.valueChanges, this.mine.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
    const scopeChanges = merge(
      this.auth.isAuthenticated$,
      fromEvent<StorageEvent>(window, 'storage').pipe(
        filter((event) => [
            'mifosXTenantIdentifier',
            'mifosXServerURL',
            'mifosXCredentials',
            'mifosXServerDate'
          ].includes(event.key ?? ''))
      )
    ).pipe(
      startWith(null),
      map(() => this.data.scope()),
      distinctUntilChanged(),
      tap((scope) => {
        const identity = this.data.identity();
        if (this.currentIdentity && this.currentIdentity !== identity) {
          this.selectionKey = '';
          this.requestedKey = '';
          this.requestedTaskRequest.next('');
          this.area = '';
          this.age = 'all';
          this.queues.forEach((queue) => (this.pageIndex[queue] = 0));
        }
        this.currentScope = scope;
        this.currentIdentity = identity;
      })
    );
    merge(scopeChanges, this.reload)
      .pipe(
        tap(() => {
          // A business-date-only change reloads ages but keeps the requested task and page positions.
          const identity = this.data.identity();
          if (identity !== this.currentIdentity) {
            this.selectionKey = '';
            this.requestedKey = '';
            this.requestedTaskRequest.next('');
            this.queues.forEach((queue) => (this.pageIndex[queue] = 0));
            this.currentIdentity = identity;
          }
          this.currentScope = this.data.scope();
          this.requestedTaskRequest.next('');
          this.requestedLookupKey = '';
          this.loading = true;
          this.pages = [];
          this.tasks = [];
          this.visible = [];
          this.selected = null;
          this.activity = null;
          this.historyRequest.next(null);
          this.cdr.markForCheck();
        }),
        switchMap(() =>
          forkJoin({
            pages: forkJoin(this.queues.map((queue) => this.data.load(queue, this.pageIndex[queue]))),
            activity: this.data.audits()
          })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        // Never render an old tenant/user response, even when a host changed without a storage event.
        if (this.data.scope() !== this.currentScope) {
          this.refresh();
          return;
        }
        const removed = result.pages.filter(
          (page) =>
            page.state === 'ready' &&
            page.count === 0 &&
            this.pageIndex[page.queue] > 0 &&
            page.total <= this.pageIndex[page.queue] * this.data.pageSize
        );
        if (removed.length) {
          removed.forEach(
            (page) => (this.pageIndex[page.queue] = Math.max(0, Math.ceil(page.total / this.data.pageSize) - 1))
          );
          this.refresh();
          return;
        }
        this.pages = result.pages;
        this.tasks = sortTasks(result.pages.flatMap((page) => page.tasks));
        this.activity = result.activity;
        this.loading = false;
        this.applyFilters();
        this.cdr.markForCheck();
      });
  }
  refresh(): void {
    this.reload.next();
  }
  page(queue: Queue, delta: number): void {
    if (this.loading || this.pageIndex[queue] + delta < 0) return;
    this.pageIndex[queue] += delta;
    this.selectionKey = '';
    this.requestedKey = '';
    this.requestedTaskRequest.next('');
    this.refresh();
  }
  applyFilters(): void {
    if (
      !this.loading &&
      this.requestedKey &&
      !this.tasks.some((task) => task.key === this.requestedKey) &&
      this.requestedLookupKey !== this.requestedKey
    ) {
      this.requestedLookupKey = this.requestedKey;
      this.requestedTaskRequest.next(this.requestedKey);
    }
    this.visible = this.tasks.filter((task) =>
      matchesTask(task, this.search.value, this.area, this.age, this.mine.value, this.auth.getCredentials()?.staffId)
    );
    const key = this.requestedKey || this.selectionKey;
    const next = this.visible.find((task) => task.key === key) ?? (!key ? this.visible[0] : null) ?? null;
    this.requestedMissing = !!this.requestedKey && !this.loading && !this.lookupLoading && !next;
    if (this.selected?.key !== next?.key) {
      this.selected = next;
      this.historyRequest.next(next);
    }
    this.selectionKey = next?.key ?? '';
    this.cdr.markForCheck();
  }
  select(task: OperationsTask): void {
    this.requestedKey = '';
    this.requestedTaskRequest.next('');
    this.requestedMissing = false;
    this.selectionKey = task.key;
    this.selected = task;
    this.historyRequest.next(task);
  }
  setArea(area: OperationsArea | ''): void {
    this.area = this.area === area ? '' : area;
    this.requestedKey = '';
    this.requestedTaskRequest.next('');
    this.applyFilters();
  }
  setAge(age: string): void {
    this.age = age;
    this.requestedKey = '';
    this.requestedTaskRequest.next('');
    this.applyFilters();
  }
  countAge(age: string): number {
    return this.tasks.filter((task) =>
      matchesTask(task, this.search.value, this.area, age, this.mine.value, this.auth.getCredentials()?.staffId)
    ).length;
  }
  areaCount(area: OperationsArea): number | null {
    if (
      this.loading ||
      area === 'collection' ||
      !this.pages.some(
        (page) => page.state === 'ready' && (area === 'loan' ? [
                'approval',
                'disbursement'
              ].includes(page.queue) : [
                'registrations',
                'enrollment'
              ].includes(page.queue))
      )
    )
      return null;
    return this.areaTasks(area).length;
  }
  areaTasks(area: OperationsArea): OperationsTask[] {
    return this.tasks.filter((task) => task.source === area);
  }
  countQueue(queue: Queue): number | null {
    return this.pages.find((page) => page.queue === queue && page.state === 'ready')?.tasks.length ?? null;
  }
  get approvals(): number | null {
    return this.pages.find((page) => page.queue === 'approval' && page.state === 'ready')?.total ?? null;
  }
  get partialError(): boolean {
    return this.pages.some((page) => page.state === 'error');
  }
  get denied(): boolean {
    return this.pages.length > 0 && this.pages.every((page) => page.state === 'denied');
  }
  distribution(area: OperationsArea, category: string): number {
    const tasks = this.areaTasks(area);
    return tasks.length ? (tasks.filter((task) => task.agingCategory === category).length * 100) / tasks.length : 0;
  }
  fileRoute(task: OperationsTask): (string | number)[] | null {
    return task.route &&
      this.data.hasPermission('READ_CLIENT') &&
      (task.source !== 'loan' || this.data.hasPermission('READ_LOAN'))
      ? task.route
      : null;
  }
}
