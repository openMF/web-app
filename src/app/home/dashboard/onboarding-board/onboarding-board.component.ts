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
  DoCheck,
  Input,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { OnboardingTasksComponent } from './onboarding-tasks/onboarding-tasks.component';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { _ as extract } from '@ngx-translate/core';
import { Subject, catchError, map, merge, of, startWith, switchMap, tap, timeout, timer } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { EnrollmentCasesResponse, TasksService } from 'app/tasks/tasks.service';
import { environment } from 'environments/environment';
import {
  ONBOARDING_STAGES,
  EnrollmentRow,
  PipelineStage,
  agingBand,
  attentionRows,
  uniqueEnrollmentRows,
  validEnrollmentId
} from './onboarding-pipeline.model';

@Component({
  selector: 'mifosx-onboarding-board',
  standalone: true,
  templateUrl: './onboarding-board.component.html',
  styleUrls: ['./onboarding-board.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatPaginator,
    MatProgressSpinner,
    MatTableModule,
    MatExpansionModule,
    OnboardingTasksComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingBoardComponent implements OnInit, DoCheck {
  private readonly auth = inject(AuthenticationService);
  private readonly tasks = inject(TasksService);
  private readonly settings = inject(SettingsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly reload = new Subject<void>();
  private readonly selection = new Subject<EnrollmentRow | null>();
  private scope = '';
  private initialized = false;

  readonly pipelineEnabled = environment.enableEnrollmentPipeline;
  pipelineOpened = false;

  @Input() offices: { id: number | string; name: string }[] = [];
  readonly search = this.formBuilder.nonNullable.control('');
  readonly office = this.formBuilder.nonNullable.control<number | string>('');
  readonly stages = ONBOARDING_STAGES;
  readonly stageLabels = {
    kyc: extract('onboardingPipeline.stages.kyc'),
    pld: extract('onboardingPipeline.stages.pld'),
    biometric: extract('onboardingPipeline.stages.biometric'),
    accountLevel: extract('onboardingPipeline.stages.accountLevel'),
    card: extract('onboardingPipeline.stages.card'),
    internalControl: extract('onboardingPipeline.stages.internalControl')
  };
  readonly stageDescriptions = {
    kyc: extract('onboardingPipeline.descriptions.kyc'),
    pld: extract('onboardingPipeline.descriptions.pld'),
    biometric: extract('onboardingPipeline.descriptions.biometric'),
    accountLevel: extract('onboardingPipeline.descriptions.accountLevel'),
    card: extract('onboardingPipeline.descriptions.card'),
    internalControl: extract('onboardingPipeline.descriptions.internalControl')
  };
  readonly stateLabels = {
    completed: extract('onboardingPipeline.states.completed'),
    inProgress: extract('onboardingPipeline.states.inProgress'),
    pending: extract('onboardingPipeline.states.pending'),
    review: extract('onboardingPipeline.states.review'),
    blocked: extract('onboardingPipeline.states.blocked'),
    failed: extract('onboardingPipeline.states.failed'),
    notApplicable: extract('onboardingPipeline.states.notApplicable'),
    unknown: extract('onboardingPipeline.states.unknown')
  };
  readonly detailLabels = {
    decision: extract('onboardingPipeline.evidence.decision'),
    approvedEvidence: extract('onboardingPipeline.evidence.approvedEvidence'),
    notApprovedEvidence: extract('onboardingPipeline.evidence.notApprovedEvidence'),
    noEvidence: extract('onboardingPipeline.evidence.noEvidence'),
    missingContract: extract('onboardingPipeline.evidence.missingContract')
  };
  readonly columns = [
    'client',
    ...ONBOARDING_STAGES,
    'current'
  ];
  rows: EnrollmentRow[] = [];
  filteredRows: EnrollmentRow[] = [];
  attention: EnrollmentRow[] = [];
  selected: EnrollmentRow | null = null;
  detail: EnrollmentRow | null = null;
  loading = false;
  detailLoading = false;
  error = '';
  detailError = '';
  canRead = false;
  pageIndex = 0;
  pageSize = 10;
  total: number | null = null;
  loaded = false;

  ngOnInit(): void {
    this.scope = this.currentScope();
    this.canRead =
      this.pipelineEnabled && this.hasPermission('READ_CLIENT') && this.hasPermission('READ_ENROLLMENT_STATUS');
    this.initialized = true;

    this.selection
      .pipe(
        tap((row) => {
          this.selected = row;
          this.detail = null;
          this.detailError = '';
          this.detailLoading = !!row;
        }),
        switchMap((row) => {
          const scope = this.scope;
          if (!row || !this.canRead) return of(null);
          return this.tasks
            .getEnrollmentCases({ view: 'enrollment', clientId: row.clientId, offset: 0, limit: 1 })
            .pipe(
              timeout(30000),
              map((response) => {
                if (scope !== this.currentScope()) return null;
                if (!Array.isArray(response?.pageItems) || response.pageItems.length !== 1)
                  throw new Error('Invalid detail');
                const detail = uniqueEnrollmentRows(response.pageItems)[0];
                if (String(detail.clientId) !== String(row.clientId)) throw new Error('Mismatched client');
                return detail;
              }),
              catchError((error) => {
                if (scope === this.currentScope()) this.detailError = this.errorKey(error?.status);
                return of(null);
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((detail) => {
        this.detail = detail;
        this.detailLoading = false;
        this.cdr.markForCheck();
      });

    // Search and branch filtering apply only to the loaded page: the API accepts neither q nor officeId.
    merge(this.search.valueChanges.pipe(map(() => 'search')), this.office.valueChanges.pipe(map(() => 'office')))
      .pipe(
        tap(() => this.selection.next(null)),
        switchMap((cause) => timer(cause === 'search' ? 300 : 0)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.applyFilters());

    this.reload
      .pipe(
        startWith(undefined),
        tap(() => {
          this.clearResults();
          this.loading = this.canRead && this.pipelineOpened;
          this.error = '';
          this.cdr.markForCheck();
        }),
        switchMap(() => {
          const scope = this.scope;
          if (!this.canRead || !this.pipelineOpened) return of(null);
          return this.tasks
            .getEnrollmentCases({ view: 'enrollment', offset: this.pageIndex * this.pageSize, limit: this.pageSize })
            .pipe(
              timeout(30000),
              map((response) => (scope === this.currentScope() ? response : null)),
              catchError((error) => {
                if (scope === this.currentScope()) this.error = this.errorKey(error?.status);
                return of(null);
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (response) {
          if (!this.acceptPage(response)) return;
        } else if (this.canRead && this.pipelineOpened && !this.error) {
          this.error = extract('onboardingPipeline.error');
        }
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  ngDoCheck(): void {
    if (!this.initialized || this.scope === this.currentScope()) return;
    // Settings are not all reactive. Discard old tenant/user results before the next view check.
    this.scope = this.currentScope();
    this.canRead =
      this.pipelineEnabled && this.hasPermission('READ_CLIENT') && this.hasPermission('READ_ENROLLMENT_STATUS');
    this.pageIndex = 0;
    this.search.setValue('', { emitEvent: false });
    this.office.setValue('', { emitEvent: false });
    this.reload.next();
  }

  get taskScope(): string {
    return this.scope;
  }

  openPipeline(): void {
    if (!this.pipelineEnabled || this.pipelineOpened) return;
    this.pipelineOpened = true;
    this.refresh();
  }

  refresh(): void {
    this.reload.next();
  }

  changePage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.refresh();
  }

  select(row: EnrollmentRow): void {
    if (this.filteredRows.includes(row)) this.selection.next(row);
  }

  retryDetail(): void {
    if (this.selected) this.selection.next(this.selected);
  }

  stageIcon(stage: PipelineStage): string {
    if (stage.state === 'completed') return 'check';
    if (stage.state === 'blocked') return 'block';
    if (stage.state === 'failed') return 'close';
    if (stage.state === 'review') return 'policy';
    if (stage.state === 'inProgress') return 'schedule';
    if (stage.state === 'pending') return 'radio_button_unchecked';
    if (stage.state === 'notApplicable') return 'remove';
    return 'help_outline';
  }

  stageClass(stage: PipelineStage): string {
    return `${stage.state === 'inProgress' ? 'in-progress' : stage.state} ${agingBand(stage.days)}`;
  }

  clientRoute(row: EnrollmentRow, notes = false): (string | number)[] | null {
    if (this.scope !== this.currentScope() || !this.hasPermission('READ_CLIENT')) return null;
    if (notes && (!this.hasPermission('READ_CLIENTNOTE') || !this.hasPermission('CREATE_CLIENTNOTE'))) return null;
    return [
      '/clients',
      row.clientId,
      notes ? 'notes' : 'enrollment-status'
    ];
  }

  hasPermission(permission: string): boolean {
    if (!environment.productionModeEnableRBAC) return true;
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes(permission) ||
      (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ'))
    );
  }

  private acceptPage(response: EnrollmentCasesResponse): boolean {
    const items = response.pageItems;
    const total = response.totalFilteredRecords;
    if (
      !Array.isArray(items) ||
      items.length > this.pageSize ||
      total == null ||
      !Number.isSafeInteger(total) ||
      total < 0
    ) {
      this.error = extract('onboardingPipeline.error');
      return true;
    }
    if (items.length === 0 && total != null && this.pageIndex > 0 && this.pageIndex * this.pageSize >= total) {
      this.pageIndex = Math.max(0, Math.ceil(total / this.pageSize) - 1);
      this.refresh();
      return false;
    }
    if (
      (items.length === 0 && total != null && total > this.pageIndex * this.pageSize) ||
      (total != null && total < this.pageIndex * this.pageSize + items.length)
    ) {
      this.error = extract('onboardingPipeline.error');
      return true;
    }
    try {
      this.rows = uniqueEnrollmentRows(items);
      this.total = total ?? null;
      this.loaded = true;
      this.applyFilters();
    } catch {
      this.clearResults();
      this.error = extract('onboardingPipeline.error');
    }
    return true;
  }

  private applyFilters(): void {
    const query = this.search.value.trim().toLocaleLowerCase();
    const office = this.office.value;
    const validOffice =
      !office || this.offices.some((item) => validEnrollmentId(item.id) && String(item.id) === String(office));
    this.filteredRows = validOffice
      ? this.rows.filter(
          (row) =>
            (!office || String(row.officeId) === String(office)) &&
            `${row.clientName} ${row.clientId}`.toLocaleLowerCase().includes(query)
        )
      : [];
    this.attention = attentionRows(this.filteredRows);
    if (!this.selected || !this.filteredRows.includes(this.selected)) {
      this.selection.next(this.filteredRows[0] ?? null);
    }
    this.cdr.markForCheck();
  }

  private clearResults(): void {
    this.rows = [];
    this.filteredRows = [];
    this.attention = [];
    this.total = null;
    this.loaded = false;
    this.selection.next(null);
  }

  private currentScope(): string {
    const credentials = this.auth.getCredentials();
    return JSON.stringify([
      this.settings.server,
      this.settings.tenantIdentifier,
      credentials?.userId,
      credentials?.permissions
    ]);
  }

  private errorKey(status?: number): string {
    if (status === 401 || status === 403) return extract('onboardingPipeline.forbidden');
    if (status === 404) return extract('onboardingPipeline.notSupported');
    return extract('onboardingPipeline.error');
  }
}
