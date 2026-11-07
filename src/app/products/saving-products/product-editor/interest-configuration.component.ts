/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, finalize, switchMap } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ProductPolicyService } from './product-policy.service';
import { InterestMatrixService } from './interest-matrix.service';
import { ReferenceRateService } from './reference-rate.service';
import { PolicyConfiguration, PolicyCoreContext } from './product-policy.model';
import {
  BracketSelection,
  InterestMatrix,
  MatrixIssue,
  RatePreview,
  ReferenceDefinition,
  ReferenceFormula,
  decimal,
  isoDate,
  validateMatrix
} from './interest-rate.model';
import { policyError, serverErrors } from './policy-workflow.component';
import { BenchmarkManagementComponent } from './benchmark-management.component';
import { RatePropagationComponent } from './rate-propagation.component';

@Component({
  selector: 'mifosx-interest-configuration',
  templateUrl: './interest-configuration.component.html',
  styleUrls: ['./interest-management.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule,
    MatProgressBarModule,
    BenchmarkManagementComponent,
    RatePropagationComponent
  ]
})
export class InterestConfigurationComponent implements OnChanges {
  @Input() configuration: PolicyConfiguration | null = null;
  @Input() context: PolicyCoreContext;
  @Input() blocked = true;
  @Input() mode: string;
  @Output() saved = new EventEmitter<PolicyConfiguration>();
  @Output() conflicted = new EventEmitter<void>();
  @Output() stateChanged = new EventEmitter<void>();
  @ViewChild(BenchmarkManagementComponent) benchmarks?: BenchmarkManagementComponent;
  private builder = inject(FormBuilder);
  private matrices = inject(InterestMatrixService);
  private rates = inject(ReferenceRateService);
  private policies = inject(ProductPolicyService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  rows = this.builder.array<ReturnType<InterestConfigurationComponent['row']>>([]);
  matrixForm = this.builder.group({ brackets: this.rows });
  formulaForm = this.builder.group({
    referenceId: [
      '',
      Validators.required
    ],
    formulaMode: [
      'ADDITIVE_SPREAD',
      Validators.required
    ],
    spreadPercentagePoints: [''],
    multiplier: [''],
    reviewFrequency: [
      'DAILY',
      Validators.required
    ]
  });
  reviewForm = this.builder.group({ businessDate: [
      '',
      Validators.required
    ], balance: [''] });
  definitions: ReferenceDefinition[] = [];
  issues: MatrixIssue[] = [];
  private savedConfiguration: PolicyConfiguration | null = null;
  busy = false;
  loadedRevision: number | null = null;
  conflict = false;
  error = '';
  details: string[] = [];
  notice = '';
  preview: RatePreview | null = null;
  selection: BracketSelection | null = null;
  financialOperational: boolean | null = null;
  blockers: string[] = [];
  get dirty() {
    return this.matrixForm.dirty || this.formulaForm.dirty || !!this.benchmarks?.dirty;
  }
  get saving() {
    return this.busy || !!this.benchmarks?.busy;
  }
  get editable() {
    return (
      !this.blocked &&
      !this.busy &&
      !this.conflict &&
      !!this.configuration?.revision &&
      this.configuration.revision === this.loadedRevision &&
      this.configuration.policy?.interestMode === this.mode
    );
  }
  row(lowerBalance = '', upperBalance: string | null = '', annualRatePercent = '') {
    return this.builder.group({
      lowerBalance: [lowerBalance],
      upperBalance: [upperBalance],
      annualRatePercent: [annualRatePercent]
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!changes['configuration'] && !changes['mode']) return;
    if (
      changes['configuration']?.currentValue === this.savedConfiguration &&
      this.savedConfiguration &&
      !changes['mode']
    ) {
      this.savedConfiguration = null;
      return;
    }
    const revision = this.configuration?.revision ?? null;
    // Parent only replaces the aggregate after a confirmed reload or a successful save/readback.
    if (changes['configuration'] || changes['mode']) {
      this.reset();
      if (revision && [
          'TIERED',
          'REFERENCE_RATE'
        ].includes(this.mode)) this.load(false);
    }
  }
  reset() {
    this.rows.clear();
    for (const b of this.configuration?.policy?.interestMatrix?.brackets || [])
      this.rows.push(this.row(b.lowerBalance, b.upperBalance, b.annualRatePercent));
    this.matrixForm.markAsPristine();
    const f = this.configuration?.policy?.referenceRate;
    this.formulaForm.reset({
      referenceId: f?.referenceId || '',
      formulaMode: f?.formulaMode || 'ADDITIVE_SPREAD',
      spreadPercentagePoints: f?.spreadPercentagePoints || '',
      multiplier: f?.multiplier || '',
      reviewFrequency: f?.reviewFrequency || 'DAILY'
    });
    this.loadedRevision = null;
    this.conflict = false;
    this.error = '';
    this.notice = '';
    this.issues = [];
    this.preview = null;
    this.selection = null;
    this.stateChanged.emit();
  }
  load(confirm = true) {
    if (this.busy || !this.configuration?.revision || ![
        'TIERED',
        'REFERENCE_RATE'
      ].includes(this.mode)) return;
    if (confirm && this.dirty && !window.confirm(this.translate.instant('SavingsEditor.Discard'))) return;
    const id = this.configuration.savingsProductId;
    const revision = this.configuration.revision;
    const request: Observable<{ revision: number; financialOperational: boolean; blockers: string[] }> =
      this.mode === 'TIERED' ? this.matrices.configuration(id) : this.rates.configuration(id);
    this.run(request, (c) => {
      if (c.revision !== revision) {
        this.fail(new HttpErrorResponse({ status: 409 }));
        return;
      }
      this.reset();
      this.loadedRevision = revision;
      this.financialOperational = c.financialOperational;
      this.blockers = c.blockers || [];
    });
  }
  add() {
    if (!this.editable || this.rows.length >= 50) return;
    this.rows.push(this.row());
    this.matrixForm.markAsDirty();
    this.issues = [];
    this.stateChanged.emit();
  }
  remove(index: number) {
    if (!this.editable) return;
    this.rows.removeAt(index);
    this.matrixForm.markAsDirty();
    this.issues = [];
    this.stateChanged.emit();
  }
  matrix(): InterestMatrix {
    return {
      calculationMethod: 'UNAPPROVED',
      brackets: this.rows.getRawValue().map((b) => ({
        lowerBalance: b.lowerBalance,
        upperBalance: b.upperBalance === '' ? null : b.upperBalance,
        annualRatePercent: b.annualRatePercent
      }))
    };
  }
  matrixIssues(index: number, field: string) {
    return this.issues.filter((e) => e.row === index && e.field === field);
  }
  validate(save = false) {
    if (!this.editable || (save && !this.matrixForm.dirty)) return;
    const matrix = this.matrix();
    this.issues = validateMatrix(matrix, this.context.digits, this.configuration.policy.maximumBalance);
    this.matrixForm.markAllAsTouched();
    if (this.issues.length) return;
    const id = this.configuration.savingsProductId,
      revision = this.loadedRevision;
    if (save)
      this.persist(
        this.matrices.write(id, revision, matrix, true).pipe(switchMap(() => this.matrices.write(id, revision, matrix)))
      );
    else
      this.run(this.matrices.write(id, revision, matrix, true), () => {
        this.notice = 'InterestManagement.Validated';
      });
  }
  formulaModeChanged() {
    if (this.formulaForm.controls.formulaMode.value === 'ADDITIVE_SPREAD')
      this.formulaForm.controls.multiplier.setValue('');
    else this.formulaForm.controls.spreadPercentagePoints.setValue('');
    this.formulaForm.markAsDirty();
    this.stateChanged.emit();
  }
  get formulaValid() {
    const f = this.formulaForm.getRawValue();
    return !!this.definitions.find((d) => d.referenceId === f.referenceId) && [
        'DAILY',
        'END_OF_MONTH'
      ].includes(
        f.reviewFrequency
      ) && (f.formulaMode === 'ADDITIVE_SPREAD' ? decimal(f.spreadPercentagePoints, 12, true) : f.formulaMode === 'MULTIPLICATIVE_FACTOR' && decimal(f.multiplier) && !/^0*(?:\.0*)?$/.test(f.multiplier));
  }
  saveFormula() {
    if (!this.editable || !this.formulaForm.dirty || !this.formulaValid) return;
    const f = this.formulaForm.getRawValue(),
      definition = this.definitions.find((d) => d.referenceId === f.referenceId);
    const formula: ReferenceFormula = {
      referenceId: definition.referenceId,
      referenceType: definition.referenceType,
      tenor: definition.tenor,
      formulaMode: f.formulaMode as ReferenceFormula['formulaMode'],
      spreadPercentagePoints: f.formulaMode === 'ADDITIVE_SPREAD' ? f.spreadPercentagePoints : null,
      multiplier: f.formulaMode === 'MULTIPLICATIVE_FACTOR' ? f.multiplier : null,
      reviewFrequency: f.reviewFrequency as ReferenceFormula['reviewFrequency']
    };
    this.persist(this.rates.saveFormula(this.configuration.savingsProductId, this.loadedRevision, formula));
  }
  private persist(request: Observable<unknown>) {
    // Do not unlock another write until authoritative aggregate readback has completed.
    this.run(
      request.pipe(switchMap(() => this.policies.configuration(this.configuration.savingsProductId))),
      (config) => {
        this.configuration = config;
        this.reset();
        this.loadedRevision = config.revision;
        this.notice = 'SavingsEditor.DraftSaved';
        this.savedConfiguration = config;
        this.saved.emit(config);
      }
    );
  }
  review() {
    const date = this.reviewForm.controls.businessDate.value;
    if (this.busy || !this.configuration || !isoDate(date)) return;
    this.preview = null;
    this.selection = null;
    if (this.mode === 'TIERED') {
      const balance = this.reviewForm.controls.balance.value;
      if (!decimal(balance, this.context.digits, false, true)) {
        this.error = 'InterestManagement.BalanceInvalid';
        return;
      }
      this.run(
        this.matrices.selection(this.configuration.savingsProductId, balance, date),
        (data) => (this.selection = data)
      );
    } else this.run(this.rates.preview(this.configuration.savingsProductId, date), (data) => (this.preview = data));
  }
  private run<T>(request: Observable<T>, next: (data: T) => void) {
    this.busy = true;
    this.error = '';
    this.details = [];
    this.notice = '';
    this.stateChanged.emit();
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
          this.stateChanged.emit();
        })
      )
      .subscribe({ next, error: (error) => this.fail(error) });
  }
  private fail(error: unknown) {
    this.error = error instanceof HttpErrorResponse && [
        404,
        405,
        501
      ].includes(error.status) ? 'InterestManagement.Incompatible' : policyError(error);
    this.details = serverErrors(error);
    if (this.error === 'SavingsEditor.Conflict') {
      this.conflict = true;
      this.conflicted.emit();
    }
    if (this.details.some((d) => d.startsWith('benchmarkFixing:'))) this.error = 'InterestManagement.MissingFixing';
  }
}
