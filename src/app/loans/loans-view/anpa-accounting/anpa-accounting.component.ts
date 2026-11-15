/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { anpaLabelKey } from './anpa-labels';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import {
  Observable,
  EMPTY,
  Subject,
  merge,
  defer,
  startWith,
  takeUntil,
  finalize,
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AnpaAccountingService } from '../../services/anpa-accounting.service';
import { AnpaAccessService } from '../../services/anpa-access.service';
import {
  Template,
  Eligibility,
  History,
  AccountBucket,
  Preview,
  PolicyResolution,
  CorrectionReview,
  ReclassificationEvidence,
  AssessmentSummary,
  Assessment,
  PolicyEvent,
  ControlRecord,
  AdjustmentProposal,
  PolicyDefinition,
  PolicyApproval
} from '../../models/anpa-accounting.model';
import {
  AnpaBlockersComponent,
  AnpaJournalsComponent,
  AnpaPolicyDefinitionComponent,
  AnpaChargeEvidenceComponent
} from './anpa-evidence.component';
import { AnpaCommandDialogComponent, CommandMode } from './anpa-command-dialog.component';
import { AnpaPolicyDialogComponent } from './anpa-policy-dialog.component';
import { AnpaMoneyPipe } from './anpa-money.pipe';
import { anpaErrorKey } from './anpa-error';

interface SectionError {
  section: string;
  key: string;
}
type HistoryKind = 'assessments' | 'policies' | 'reconciliations' | 'proposals';
interface RecordRow {
  sequence: number;
  id: string;
  actorId: number;
  recordedAt: string | null;
}

interface HistorySource {
  rows(): RecordRow[];
  load(after: number, append?: boolean): Observable<void>;
  open(id: string): Observable<void>;
  clearSelection(): void;
  reset(): void;
}

const commandRecords = {
  assessment: 'assessments',
  reconciliation: 'reconciliations',
  proposal: 'proposals',
  approval: 'policies'
} satisfies Record<CommandMode, HistoryKind>;

@Component({
  selector: 'mifosx-anpa-accounting',
  templateUrl: './anpa-accounting.component.html',
  styleUrls: ['./anpa-accounting.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    AnpaMoneyPipe,
    AnpaBlockersComponent,
    AnpaJournalsComponent,
    AnpaPolicyDefinitionComponent,
    AnpaChargeEvidenceComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnpaAccountingComponent implements OnInit {
  readonly labelKey = anpaLabelKey;
  readonly access = inject(AnpaAccessService);
  private readonly api = inject(AnpaAccountingService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly refresh = new Subject<void>();
  private readonly cancelReads = new Subject<void>();
  private readonly cancelReconciliation = new Subject<void>();
  readonly form;
  readonly template = signal<Template | null>(null);
  readonly eligibility = signal<Eligibility | null>(null);
  readonly history = signal<History | null>(null);
  readonly receivables = signal<AccountBucket[]>([]);
  readonly preview = signal<Preview | null>(null);
  readonly policy = signal<PolicyResolution | null>(null);
  readonly review = signal<CorrectionReview | null>(null);
  readonly reclassification = signal<ReclassificationEvidence | null>(null);
  readonly errors = signal<SectionError[]>([]);
  readonly loading = signal(true);
  readonly previewLoading = signal(false);
  readonly detailLoading = signal(false);
  readonly notice = signal('');
  readonly assessments = signal<AssessmentSummary[]>([]);
  readonly policies = signal<PolicyEvent[]>([]);
  readonly reconciliations = signal<ControlRecord<CorrectionReview>[]>([]);
  readonly proposals = signal<ControlRecord<AdjustmentProposal>[]>([]);
  readonly selectedAssessment = signal<Assessment | null>(null);
  readonly selectedPolicy = signal<PolicyEvent | null>(null);
  readonly selectedReconciliation = signal<ControlRecord<CorrectionReview> | null>(null);
  readonly selectedProposal = signal<ControlRecord<AdjustmentProposal> | null>(null);
  private readonly sources: Record<HistoryKind, HistorySource> = {
    assessments: this.historySource(
      'assessments',
      this.assessments,
      this.selectedAssessment,
      (after) => this.api.getAssessments(this.loanId, after, 20),
      (id) => this.api.getAssessment(this.loanId, id)
    ),
    policies: this.historySource(
      'policies',
      this.policies,
      this.selectedPolicy,
      (after) => this.api.getAccountingPolicies(this.loanId, after, 20),
      (id) => this.api.getAccountingPolicyEvent(this.loanId, id)
    ),
    reconciliations: this.historySource(
      'reconciliations',
      this.reconciliations,
      this.selectedReconciliation,
      (after) => this.api.getReconciliationAssessments(this.loanId, after, 20),
      (id) => this.api.getReconciliationAssessment(this.loanId, id)
    ),
    proposals: this.historySource(
      'proposals',
      this.proposals,
      this.selectedProposal,
      (after) => this.api.getAdjustments(this.loanId, after, 20),
      (id) => this.api.getAdjustment(this.loanId, id)
    )
  };
  readonly pageBusy = signal<HistoryKind[]>([]);
  readonly more = signal<Record<HistoryKind, boolean>>({
    assessments: true,
    policies: true,
    reconciliations: true,
    proposals: true
  });
  readonly kinds: HistoryKind[] = [
    'assessments',
    'policies',
    'reconciliations',
    'proposals'
  ];
  readonly bucketColumns = [
    'category',
    'currentClassification',
    'historicalOrigin',
    'mappingStatus',
    'netGlReceivable',
    'expenseEligible',
    'references'
  ];
  readonly nativeStatuses: Record<number, string> = {
    100: 'labels.status.Submitted and pending approval',
    200: 'labels.status.Approved',
    300: 'labels.status.Active',
    303: 'labels.status.Transfer in progress',
    304: 'labels.status.Transfer on hold',
    400: 'labels.status.Withdrawn by applicant',
    500: 'labels.status.Rejected',
    600: 'labels.status.Closed (obligations met)',
    601: 'labels.status.Closed (written off)',
    602: 'labels.status.Closed (rescheduled)',
    700: 'labels.status.Overpaid'
  };
  readonly recordColumns = [
    'id',
    'actorId',
    'recordedAt',
    'details'
  ];
  readonly comparisonColumns = [
    'category',
    'accountId',
    'expected',
    'actual',
    'difference'
  ];
  loanId = 0;

  // eslint-disable-next-line @angular-eslint/prefer-inject -- skills/SKILL.md requires FormBuilder constructor injection.
  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.nonNullable.group({ asOf: [
        '',
        Validators.required
      ], assessmentId: [''], policyEventId: [''] });
  }

  ngOnInit(): void {
    combineLatest([
      this.route.parent!.paramMap,
      this.route.queryParamMap
    ])
      .pipe(
        map(
          ([
            params,
            query
          ]) => ({ id: Number(params.get('loanId')), standard: query.get('productType') !== 'working-capital' })
        ),
        distinctUntilChanged((a, b) => a.id === b.id && a.standard === b.standard),
        switchMap(({ id, standard }) => {
          this.loanId = id;
          if (!standard || !this.access.canRead || !Number.isSafeInteger(id) || id <= 0) {
            this.reset();
            this.loading.set(false);
            return EMPTY;
          }
          return this.refresh.pipe(
            startWith(undefined),
            tap(() => this.reset()),
            switchMap(() => this.load())
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private historySource<T extends RecordRow, D>(
    kind: HistoryKind,
    items: WritableSignal<T[]>,
    selected: WritableSignal<D | null>,
    list: (after: number) => Observable<T[]>,
    detail: (id: string) => Observable<D>
  ): HistorySource {
    return {
      rows: items,
      load: (after, append = false) =>
        defer(() => {
          this.pageBusy.update((current) => current.concat(kind));
          return this.read(kind, list(after), (values) => {
            items.update((current) => (append ? current.concat(values) : values));
            this.setMore(kind, values.length);
          });
        }).pipe(finalize(() => this.pageBusy.update((current) => current.filter((item) => item !== kind)))),
      open: (id) => this.read(kind, detail(id), (value) => selected.set(value)),
      clearSelection: () => selected.set(null),
      reset: () => {
        items.set([]);
        selected.set(null);
      }
    };
  }

  private reset(): void {
    this.cancelReads.next();
    this.cancelReconciliation.next();
    this.template.set(null);
    this.eligibility.set(null);
    this.history.set(null);
    this.receivables.set([]);
    this.preview.set(null);
    this.policy.set(null);
    this.review.set(null);
    this.reclassification.set(null);
    Object.values(this.sources).forEach((source) => source.reset());
    this.errors.set([]);
    this.notice.set('');
    this.loading.set(true);
    this.previewLoading.set(false);
    this.detailLoading.set(false);
    this.pageBusy.set([]);
    this.form.reset();
    this.more.set({ assessments: true, policies: true, reconciliations: true, proposals: true });
    this.dialog.closeAll();
  }

  private read<T>(section: string, source: Observable<T>, apply: (value: T) => void): Observable<void> {
    return source.pipe(
      map((value) => {
        apply(value);
        this.errors.update((items) => items.filter((item) => item.section !== section));
      }),
      catchError((error) => {
        this.errors.update((list) => [
          ...list.filter((e) => e.section !== section),
          { section, key: anpaErrorKey(error) }
        ]);
        return EMPTY;
      })
    );
  }

  private load(): Observable<void> {
    return this.api.getCapabilities().pipe(
      tap((value) => {
        this.template.set(value);
        this.loading.set(false);
      }),
      switchMap((value) => {
        const calls: Observable<void>[] = [];
        const cap = value.capabilities;
        if (cap.eligibilityDiagnostics)
          calls.push(
            this.read('overview', this.api.getEligibility(this.loanId), (v) => {
              this.eligibility.set(v);
              this.form.controls.asOf.setValue(v.loan.businessDate ?? '');
            })
          );
        calls.push(this.read('history', this.api.getHistory(this.loanId), (v) => this.history.set(v)));
        if (cap.receivableClassification)
          calls.push(this.read('receivables', this.api.getReceivables(this.loanId), (v) => this.receivables.set(v)));
        if (cap.correctionControls) {
          calls.push(this.read('policies', this.api.getAccountingPolicy(this.loanId), (v) => this.policy.set(v)));
          calls.push(
            this.read('reclassification', this.api.getReclassificationHistory(this.loanId), (v) =>
              this.reclassification.set(v)
            )
          );
        }
        if (cap.accountingReconciliation && this.access.allows('READ_ANPA_RECONCILIATION'))
          calls.push(this.readReconciliation());
        if (cap.historicalAssessments && this.access.allows('READ_ANPA_AUDIT'))
          calls.push(this.sources.assessments.load(0));
        if (cap.correctionControls && this.access.allows('READ_ANPA_AUDIT')) calls.push(this.sources.policies.load(0));
        if (cap.accountingReconciliation && this.access.allows('READ_ANPA_AUDIT', 'READ_ANPA_RECONCILIATION')) {
          calls.push(this.sources.reconciliations.load(0));
          if (cap.correctionControls?.adjustmentProposalSupport) calls.push(this.sources.proposals.load(0));
        }
        return merge(...calls);
      }),
      catchError((error) => {
        this.loading.set(false);
        this.errors.set([{ section: 'connection', key: anpaErrorKey(error) }]);
        return EMPTY;
      })
    );
  }

  reload(): void {
    this.refresh.next();
  }
  private scoped<T>(source: Observable<T>): Observable<T> {
    return source.pipe(takeUntil(this.cancelReads), takeUntilDestroyed(this.destroyRef));
  }
  previewNow(): void {
    if (!this.canPreview || this.previewLoading() || !this.validDate) return;
    this.preview.set(null);
    this.previewLoading.set(true);
    this.scoped(
      this.read('preview', this.api.getPreview(this.loanId, this.form.controls.asOf.value), (v) => this.preview.set(v))
    )
      .pipe(finalize(() => this.previewLoading.set(false)))
      .subscribe();
  }
  get validDate(): boolean {
    const date = this.form.controls.asOf.value;
    const max = this.eligibility()?.loan.businessDate;
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      date >= '1900-01-01' &&
      !!max &&
      date <= max &&
      !Number.isNaN(Date.parse(date)) &&
      new Date(date).toISOString().slice(0, 10) === date
    );
  }
  get canPreview(): boolean {
    return !!this.template()?.capabilities.writeOffPreview && this.access.allows('PREVIEW_ANPA_WRITEOFF');
  }
  get canSaveAssessment(): boolean {
    return (
      this.canPreview &&
      !!this.template()?.capabilities.historicalAssessments &&
      this.access.allows('CREATE_ANPA_ASSESSMENT')
    );
  }
  get canReconcile(): boolean {
    return (
      !!this.template()?.capabilities.accountingReconciliation &&
      this.access.allows('CREATE_ANPA_ASSESSMENT', 'READ_ANPA_RECONCILIATION')
    );
  }
  get canPropose(): boolean {
    return (
      !!this.template()?.capabilities.correctionControls?.adjustmentProposalSupport &&
      this.access.allows('CREATE_ANPA_ADJUSTMENT_PROPOSAL', 'READ_ANPA_RECONCILIATION', 'READ_ANPA_AUDIT')
    );
  }
  get canManagePolicy(): boolean {
    return !!this.template()?.capabilities.correctionControls && this.access.allows('MANAGE_ANPA_ACCOUNTING_POLICY');
  }
  get canApprove(): boolean {
    const draft = this.selectedPolicy();
    return (
      !!this.template()?.capabilities.correctionControls &&
      draft?.kind === 'POLICY_DRAFT' &&
      draft.id !== this.policy()?.policyId &&
      draft.actorId !== this.access.actorId &&
      this.access.allows('APPROVE_ANPA_ACCOUNTING_POLICY')
    );
  }
  get policyApproval(): PolicyApproval | null {
    const event = this.selectedPolicy();
    return event?.kind === 'POLICY_APPROVAL' ? (event.result as PolicyApproval) : null;
  }
  get draftDefinition(): PolicyDefinition | null {
    const p = this.selectedPolicy();
    return p?.kind === 'POLICY_DRAFT' ? (p.result as PolicyDefinition) : null;
  }
  rows(kind: HistoryKind): RecordRow[] {
    return this.sources[kind].rows();
  }
  private setMore(kind: HistoryKind, count: number): void {
    this.more.update((v) => ({ ...v, [kind]: count === 20 }));
  }
  loadMore(kind: HistoryKind): void {
    if (this.pageBusy().includes(kind)) return;
    const after = this.rows(kind).at(-1)?.sequence ?? 0;
    this.scoped(this.sources[kind].load(after, true)).subscribe();
  }
  openRecord(kind: HistoryKind, id: string): void {
    Object.values(this.sources).forEach((source) => source.clearSelection());
    this.detailLoading.set(true);
    this.scoped(this.sources[kind].open(id))
      .pipe(finalize(() => this.detailLoading.set(false)))
      .subscribe();
  }
  private readReconciliation(assessmentId?: string): Observable<void> {
    return defer(() => {
      this.cancelReconciliation.next();
      this.review.set(null);
      return this.read('reconciliation', this.api.getWriteOffReconciliation(this.loanId, assessmentId), (v) =>
        this.review.set(v)
      ).pipe(takeUntil(this.cancelReconciliation));
    });
  }
  reconcile(): void {
    this.scoped(this.readReconciliation(this.form.controls.assessmentId.value.trim() || undefined)).subscribe();
  }
  command(mode: CommandMode): void {
    if (
      (mode === 'assessment' && (!this.canSaveAssessment || !this.validDate)) ||
      (mode === 'reconciliation' && !this.canReconcile) ||
      (mode === 'proposal' && !this.canPropose) ||
      (mode === 'approval' && !this.canApprove)
    )
      return;
    this.dialog
      .open(AnpaCommandDialogComponent, {
        width: '640px',
        maxWidth: '96vw',
        disableClose: true,
        data: {
          mode,
          loanId: this.loanId,
          asOf: this.form.controls.asOf.value,
          assessmentId: this.form.controls.assessmentId.value.trim() || this.selectedAssessment()?.id,
          recordId: mode === 'approval' ? this.selectedPolicy()?.id : this.selectedReconciliation()?.id
        }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved: { id: string } | false) => this.recorded(commandRecords[mode], saved));
  }
  createPolicy(): void {
    if (!this.canManagePolicy || !this.eligibility()) return;
    this.dialog
      .open(AnpaPolicyDialogComponent, {
        width: '960px',
        maxWidth: '96vw',
        disableClose: true,
        data: { loanId: this.loanId, loan: this.eligibility()!.loan }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved: { id: string } | false) => this.recorded('policies', saved));
  }
  private recorded(kind: HistoryKind, saved: { id: string } | false): void {
    if (!saved) return;
    this.reload();
    this.notice.set('labels.anpa.recorded');
    if (saved.id) this.openRecord(kind, saved.id);
  }
}
