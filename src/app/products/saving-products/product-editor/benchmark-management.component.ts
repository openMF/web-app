/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, catchError, defer, finalize, forkJoin, of, switchMap, tap } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ReferenceRateService } from './reference-rate.service';
import { ProductPolicyService } from './product-policy.service';
import {
  BenchmarkAudit,
  BenchmarkFixing,
  ReferenceDefinition,
  ReferenceTemplate,
  decimal,
  identifier,
  isoDate
} from './interest-rate.model';
import { policyPermission, policyError, serverErrors } from './policy-workflow.component';

/** Match ReferenceRateValidation.text(): optional empty values are omitted; controls are never accepted. */
function benchmarkTextError(value: unknown, max: number, optional = false): ValidationErrors | null {
  if (value == null || value === '') return optional ? null : { required: true };
  if (typeof value !== 'string') return { required: true };
  if (/[\x00-\x1f\x7f-\x9f]/.test(value)) return { controlCharacters: true };
  if (!value.trim()) return { required: true };
  return value.length > max ? { maxlength: { requiredLength: max, actualLength: value.length } } : null;
}
function benchmarkTextValidator(max: number, optional = false): ValidatorFn {
  return (control) => benchmarkTextError(control.value, max, optional);
}

@Component({
  selector: 'mifosx-benchmark-management',
  templateUrl: './benchmark-management.component.html',
  styleUrls: ['./interest-management.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule,
    MatProgressBarModule
  ]
})
export class BenchmarkManagementComponent implements OnInit {
  @Output() definitionsChanged = new EventEmitter<ReferenceDefinition[]>();
  @Output() stateChanged = new EventEmitter<void>();
  private builder = inject(FormBuilder);
  private api = inject(ReferenceRateService);
  private policies = inject(ProductPolicyService);
  private auth = inject(AuthenticationService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  definitions: ReferenceDefinition[] = [];
  selected: ReferenceDefinition | null = null;
  template: ReferenceTemplate | null = null;
  history: BenchmarkFixing[] = [];
  audit: BenchmarkAudit[] = [];
  effective: BenchmarkFixing | null = null;
  businessDate: string | null = null;
  businessDateError = '';
  busy = false;
  loaded = false;
  selectedLoaded = false;
  conflict = false;
  error = '';
  operation = '';
  details: string[] = [];
  notice = '';
  refreshFailed = false;
  selection = this.builder.group({ referenceId: [''], businessDate: [''] });
  definition = this.builder.group({ referenceId: [
      '',
      Validators.required
    ], tenor: [
      '',
      Validators.required
    ], sourceDescription: [
      '',
      benchmarkTextValidator(500)
    ] });
  capture = this.builder.group({ annualRatePercent: [
      '',
      Validators.required
    ], publicationDate: [
      '',
      Validators.required
    ], effectiveDate: [
      '',
      Validators.required
    ], sourceReference: [
      '',
      benchmarkTextValidator(500)
    ], note: [
      '',
      benchmarkTextValidator(1000, true)
    ] });
  decision = this.builder.group({ reason: [
      '',
      benchmarkTextValidator(1000, true)
    ] });
  get dirty() {
    return this.definition.dirty || this.capture.dirty || this.decision.dirty;
  }
  can(permission: string) {
    return policyPermission(this.auth, permission);
  }
  ngOnInit() {
    if (this.can('READ_SAVINGS_REFERENCE_RATE')) this.load();
  }
  private confirmDiscard() {
    return !this.dirty || window.confirm(this.translate.instant('SavingsEditor.Discard'));
  }
  load() {
    if (this.busy || !this.can('READ_SAVINGS_REFERENCE_RATE') || !this.confirmDiscard()) return;
    this.loaded = false;
    this.businessDateError = '';
    this.run(
      'InterestManagement.ReferenceDefinitions',
      forkJoin({
        definitions: this.api.definitions(),
        template: this.api.template(),
        businessDate: this.policies.businessDate().pipe(
          catchError((error) => {
            this.businessDateError = policyError(error);
            return of(null);
          })
        )
      }),
      (data) => {
        if (
          !Array.isArray(data.definitions) ||
          !data.template ||
          !data.template.formulaModes?.includes('ADDITIVE_SPREAD')
        ) {
          this.error = 'InterestManagement.Incompatible';
          return;
        }
        this.definitions = data.definitions;
        this.template = data.template;
        this.businessDate = data.businessDate;
        this.definitionsChanged.emit(this.definitions);
        this.loaded = true;
        this.conflict = false;
        this.definition.reset();
        this.capture.reset();
        this.decision.reset();
        this.selection.controls.referenceId.setValue('');
        this.selected = null;
        this.selectedLoaded = false;
        this.history = [];
        this.audit = [];
        this.effective = null;
      }
    );
  }
  select() {
    if (this.busy || !this.loaded) return;
    const id = this.selection.controls.referenceId.value;
    if (!this.confirmDiscard()) {
      this.selection.controls.referenceId.setValue(this.selected?.referenceId || '');
      return;
    }
    this.selectedLoaded = false;
    this.effective = null;
    this.run(
      'InterestManagement.BenchmarkHistory',
      forkJoin({ definition: this.api.definition(id), history: this.api.history(id), audit: this.api.audit(id) }),
      (data) => {
        if (
          !data.definition ||
          !Number.isSafeInteger(data.definition.revision) ||
          !Array.isArray(data.history) ||
          !Array.isArray(data.audit)
        ) {
          this.error = 'InterestManagement.Incompatible';
          return;
        }
        this.selected = data.definition;
        this.history = data.history;
        this.audit = data.audit;
        this.selectedLoaded = true;
        this.conflict = false;
        this.capture.reset();
        this.decision.reset();
      }
    );
  }
  get definitionValid() {
    const d = this.definition.getRawValue();
    return identifier(d.referenceId) && identifier(d.tenor) && this.definition.controls.sourceDescription.valid;
  }
  define() {
    if (
      this.busy ||
      !this.loaded ||
      this.conflict ||
      !this.definitionValid ||
      !this.can('CREATE_SAVINGS_REFERENCE_RATE')
    )
      return;
    this.run(
      'InterestManagement.CreateDefinition',
      this.api.define({ ...this.definition.getRawValue(), referenceType: 'CETES' }),
      (d) => {
        this.definitions = [
          ...this.definitions,
          d
        ];
        this.definitionsChanged.emit(this.definitions);
        this.definition.reset();
        this.notice = 'InterestManagement.DefinitionSaved';
      }
    );
  }
  textError(control: AbstractControl): string {
    if (control.hasError('controlCharacters')) return 'InterestManagement.SingleLineText';
    return control.hasError('required') ? 'SavingsEditor.RequiredLabel' : 'InterestManagement.TextInvalid';
  }
  get captureValid() {
    const c = this.capture.getRawValue();
    return (
      this.businessDate &&
      decimal(c.annualRatePercent) &&
      isoDate(c.publicationDate) &&
      isoDate(c.effectiveDate) &&
      c.publicationDate <= this.businessDate &&
      c.effectiveDate >= this.businessDate &&
      c.effectiveDate >= c.publicationDate &&
      this.capture.controls.sourceReference.valid &&
      this.capture.controls.note.valid
    );
  }
  captureFixing() {
    if (
      this.busy ||
      !this.selectedLoaded ||
      !this.captureValid ||
      this.conflict ||
      !this.can('CAPTURE_SAVINGS_REFERENCE_RATE')
    )
      return;
    const c = this.capture.getRawValue();
    const referenceId = this.selected.referenceId;
    this.run(
      'InterestManagement.CaptureFixing',
      this.api
        .capture(referenceId, {
          ...c,
          note: c.note || null,
          expectedRevision: this.selected.revision,
          tenor: this.selected.tenor
        })
        .pipe(
          tap(() => {
            this.capture.reset();
            this.selectedLoaded = false;
            this.effective = null;
            this.notice = 'InterestManagement.CapturedDraft';
          }),
          switchMap(() => this.refreshAfterWrite(referenceId))
        ),
      (data) => {
        if (!data) return;
        this.selected = data.definition;
        this.history = data.history;
        this.audit = data.audit;
        this.selectedLoaded = true;
      }
    );
  }
  canAct(f: BenchmarkFixing, action: 'submit' | 'approve' | 'reject') {
    if (this.busy || this.conflict || !this.selectedLoaded) return false;
    if (action === 'submit') return f.status === 'DRAFT' && this.can('SUBMIT_SAVINGS_REFERENCE_RATE');
    const actor = this.auth.getCredentials()?.userId;
    return (
      f.status === 'PENDING_APPROVAL' &&
      this.can('CHECK_SAVINGS_REFERENCE_RATE') &&
      Number.isSafeInteger(actor) &&
      f.makerId !== actor &&
      f.submitterId !== actor
    );
  }
  act(f: BenchmarkFixing, action: 'submit' | 'approve' | 'reject') {
    if (!this.canAct(f, action)) return;
    const control = this.decision.controls.reason;
    control.updateValueAndValidity({ emitEvent: false });
    const reason = (control.value || '').trim();
    if (action === 'reject' && !reason) control.setErrors({ ...control.errors, required: true });
    if (control.invalid) {
      control.markAsTouched();
      return;
    }
    this.run(
      'InterestManagement.FixingAuthorization',
      this.api.action(f, action, reason).pipe(
        tap(() => {
          this.decision.reset();
          this.selectedLoaded = false;
          this.effective = null;
          this.notice = 'InterestManagement.AuthorizationUpdated';
        }),
        switchMap(() => this.refreshAfterWrite(f.referenceId))
      ),
      (data) => {
        if (!data) return;
        this.selected = data.definition;
        this.history = data.history;
        this.audit = data.audit;
        this.selectedLoaded = true;
      }
    );
  }
  private refreshAfterWrite(referenceId: string) {
    // Only this read stage is recoverable here: write failures must retain the user's input.
    return defer(() =>
      forkJoin({
        definition: this.api.definition(referenceId),
        history: this.api.history(referenceId),
        audit: this.api.audit(referenceId)
      })
    ).pipe(
      catchError((error) => {
        this.selectedLoaded = false;
        this.refreshFailed = true;
        this.operation = 'InterestManagement.BenchmarkHistory';
        this.error = policyError(error);
        this.details = serverErrors(error);
        return of(null);
      })
    );
  }
  resolve() {
    const date = this.selection.controls.businessDate.value;
    if (this.busy || !this.selectedLoaded || !isoDate(date)) return;
    this.effective = null;
    this.run(
      'InterestManagement.ApprovedFixing',
      this.api.effective(this.selected.referenceId, this.selected.tenor, date),
      (fixing) => {
        if (!fixing || fixing.status !== 'APPROVED' || fixing.effectiveDate !== date) {
          this.error = 'InterestManagement.Incompatible';
          return;
        }
        this.effective = fixing;
      }
    );
  }
  private run<T>(operation: string, request: Observable<T>, next: (value: T) => void) {
    this.busy = true;
    this.operation = operation;
    this.error = '';
    this.details = [];
    this.notice = '';
    this.refreshFailed = false;
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
      .subscribe({
        next,
        error: (error) => {
          this.error = policyError(error);
          this.details = serverErrors(error);
          if (this.error === 'SavingsEditor.Conflict') this.conflict = true;
          if (this.details.some((d) => d.startsWith('benchmarkFixing:')))
            this.error = 'InterestManagement.MissingFixing';
        }
      });
  }
}
