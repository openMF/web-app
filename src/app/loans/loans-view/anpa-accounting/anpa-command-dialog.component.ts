/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AnpaAccountingService } from '../../services/anpa-accounting.service';
import { AnpaAccessService } from '../../services/anpa-access.service';
import { AdjustmentKind } from '../../models/anpa-accounting.model';
import { Observable } from 'rxjs';
import { anpaErrorKey, anpaSaveRejected } from './anpa-error';

export type CommandMode = 'assessment' | 'reconciliation' | 'proposal' | 'approval';
export interface CommandData {
  mode: CommandMode;
  loanId: number;
  asOf: string;
  assessmentId?: string;
  recordId?: string;
}
@Component({
  selector: 'mifosx-anpa-command-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  template: ` <h2 mat-dialog-title>{{ 'labels.anpa.actions.' + data.mode | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'labels.anpa.diagnosticOnly' | translate }}</p>
      <form [formGroup]="form" id="anpa-command" (ngSubmit)="submit()">
        @if (data.mode === 'assessment') {
          <p>{{ 'labels.anpa.asOf' | translate }}: {{ data.asOf }}</p>
        }
        @if (data.mode === 'proposal') {
          <mat-form-field
            ><mat-label>{{ 'labels.anpa.reconciliationId' | translate }}</mat-label>
            <input matInput formControlName="reconciliationId" required
          /></mat-form-field>
          <mat-form-field
            ><mat-label>{{ 'labels.anpa.operation' | translate }}</mat-label>
            <mat-select formControlName="operation" required>
              @for (operation of operations; track operation) {
                <mat-option [value]="operation">{{ 'labels.anpa.codes.' + operation | translate }}</mat-option>
              }
            </mat-select></mat-form-field
          >
        }
        @if (data.mode === 'reconciliation') {
          <mat-form-field
            ><mat-label>{{ 'labels.anpa.assessmentId' | translate }}</mat-label
            ><input matInput formControlName="assessmentId"
          /></mat-form-field>
        }
        @if (data.mode !== 'approval') {
          <mat-form-field
            ><mat-label>{{ 'labels.anpa.supersedesId' | translate }}</mat-label
            ><input matInput formControlName="supersedesId"
          /></mat-form-field>
          <mat-form-field
            ><mat-label>{{ 'labels.inputs.Reason' | translate }}</mat-label
            ><textarea
              matInput
              formControlName="reason"
              maxlength="1000"
              [required]="data.mode === 'proposal' || !!form.controls.supersedesId.value"
            ></textarea>
          </mat-form-field>
        } @else {
          <p>{{ 'labels.anpa.policyId' | translate }}: {{ data.recordId }}</p>
          <mat-form-field
            ><mat-label>{{ 'labels.anpa.approvalReference' | translate }}</mat-label
            ><input matInput formControlName="approvalReference" maxlength="1000" required
          /></mat-form-field>
        }
        <mat-checkbox formControlName="confirmed">{{ 'labels.anpa.confirmRecord' | translate }}</mat-checkbox>
      </form>
      @if (error()) {
        <p role="alert">{{ error() | translate }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [disabled]="busy()" (click)="close()">{{ 'labels.buttons.Cancel' | translate }}</button>
      <button
        mat-raised-button
        color="primary"
        type="submit"
        form="anpa-command"
        [disabled]="!valid || busy() || submitted()"
      >
        {{ 'labels.buttons.Confirm' | translate }}
      </button>
    </mat-dialog-actions>`,
  styles: [
    `
      mat-form-field {
        display: block;
        width: 100%;
      }
      mat-checkbox {
        margin-block: 16px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnpaCommandDialogComponent {
  readonly data = inject<CommandData>(MAT_DIALOG_DATA);
  private readonly api = inject(AnpaAccountingService);
  private readonly access = inject(AnpaAccessService);
  private readonly ref = inject(MatDialogRef<AnpaCommandDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);
  readonly operations: AdjustmentKind[] = [
    'JOURNAL_ADJUSTMENT',
    'NPA_RECLASSIFICATION',
    'NPA_RECLASSIFICATION_REVERSAL',
    'NATIVE_WRITE_OFF_REVERSAL'
  ];
  readonly form;
  readonly busy = signal(false);
  readonly submitted = signal(false);
  readonly error = signal('');
  idempotencyKey = crypto.randomUUID();
  private readonly uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  // eslint-disable-next-line @angular-eslint/prefer-inject -- skills/SKILL.md requires FormBuilder constructor injection.
  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.nonNullable.group({
      reconciliationId: [this.data.recordId ?? ''],
      assessmentId: [this.data.assessmentId ?? ''],
      supersedesId: [''],
      reason: [''],
      operation: ['' as AdjustmentKind | ''],
      approvalReference: [''],
      confirmed: [
        false,
        Validators.requiredTrue
      ]
    });
  }
  get valid(): boolean {
    const v = this.form.getRawValue();
    const reason = v.reason.trim();
    if (
      !this.form.valid ||
      (v.supersedesId && !this.uuid.test(v.supersedesId)) ||
      (this.data.mode === 'reconciliation' && v.assessmentId && !this.uuid.test(v.assessmentId))
    )
      return false;
    if (v.reason.length > 1000 || /[\x00-\x1f\x7f]/.test(v.reason)) return false;
    if (v.supersedesId && !reason) return false;
    if (this.data.mode === 'reconciliation' && reason && !v.supersedesId) return false;
    if (this.data.mode === 'assessment' && reason && !v.supersedesId) return false;
    if (this.data.mode === 'proposal')
      return this.uuid.test(v.reconciliationId) && !!reason && this.operations.includes(v.operation as AdjustmentKind);
    if (this.data.mode === 'approval')
      return (
        !!v.approvalReference.trim() &&
        v.approvalReference.length <= 1000 &&
        !/[\x00-\x1f\x7f]/.test(v.approvalReference)
      );
    return true;
  }
  close(): void {
    this.ref.close(false);
  }
  submit(): void {
    if (!this.valid || this.busy() || this.submitted()) return;
    const v = this.form.getRawValue();
    const key = this.idempotencyKey;
    let request: Observable<{ id: string }>;
    const audit = v.supersedesId ? { supersedesId: v.supersedesId, reason: v.reason.trim() } : {};
    switch (this.data.mode) {
      case 'assessment':
        if (!this.access.allows('CREATE_ANPA_ASSESSMENT', 'PREVIEW_ANPA_WRITEOFF')) return;
        request = this.api.saveAssessment(this.data.loanId, {
          idempotencyKey: key,
          asOf: this.data.asOf,
          ...(v.supersedesId ? { supersedesAssessmentId: v.supersedesId, correctionReason: v.reason.trim() } : {})
        });
        break;
      case 'reconciliation':
        if (!this.access.allows('CREATE_ANPA_ASSESSMENT', 'READ_ANPA_RECONCILIATION')) return;
        request = this.api.saveReconciliationAssessment(this.data.loanId, {
          idempotencyKey: key,
          ...(v.assessmentId ? { assessmentId: v.assessmentId } : {}),
          ...audit
        });
        break;
      case 'proposal':
        if (!this.access.allows('CREATE_ANPA_ADJUSTMENT_PROPOSAL', 'READ_ANPA_RECONCILIATION', 'READ_ANPA_AUDIT'))
          return;
        request = this.api.createAdjustmentProposal(this.data.loanId, {
          idempotencyKey: key,
          reconciliationId: v.reconciliationId,
          operation: v.operation as AdjustmentKind,
          reason: v.reason.trim(),
          ...audit
        });
        break;
      case 'approval':
        if (!this.access.allows('APPROVE_ANPA_ACCOUNTING_POLICY') || !this.data.recordId) return;
        request = this.api.approveAccountingPolicy(this.data.loanId, this.data.recordId, {
          idempotencyKey: key,
          approvalReference: v.approvalReference.trim()
        });
        break;
    }
    this.busy.set(true);
    this.submitted.set(true);
    this.error.set('');
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (record) => {
        this.busy.set(false);
        this.ref.close({ id: record.id });
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(anpaErrorKey(error, true));
        if (anpaSaveRejected(error)) {
          this.submitted.set(false);
          this.idempotencyKey = crypto.randomUUID();
        }
      }
    });
  }
}
