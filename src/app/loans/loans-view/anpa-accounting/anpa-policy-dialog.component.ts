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
import { Category, Classification, Loan, PolicyRule } from '../../models/anpa-accounting.model';
import { anpaErrorKey, anpaSaveRejected } from './anpa-error';

@Component({
  selector: 'mifosx-anpa-policy-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  templateUrl: './anpa-policy-dialog.component.html',
  styles: [
    `
      mat-form-field {
        width: 100%;
        min-width: 0;
      }
      .fields {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 224px), 1fr));
        gap: 16px;
      }
      fieldset {
        margin-block: 16px;
        border: 1px solid var(--ds-border);
        border-radius: 8px;
        min-width: 0;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnpaPolicyDialogComponent {
  readonly data = inject<{ loanId: number; loan: Loan }>(MAT_DIALOG_DATA);
  private readonly api = inject(AnpaAccountingService);
  private readonly access = inject(AnpaAccessService);
  private readonly ref = inject(MatDialogRef<AnpaPolicyDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb: FormBuilder;
  readonly form;
  readonly busy = signal(false);
  readonly submitted = signal(false);
  readonly error = signal('');
  readonly categories: Category[] = [
    'PRINCIPAL',
    'INTEREST',
    'FEE_COMMISSION',
    'PENALTY',
    'ITBMS'
  ];
  readonly classifications: Classification[] = [
    'REGULAR',
    'NPA'
  ];
  key = crypto.randomUUID();
  // eslint-disable-next-line @angular-eslint/prefer-inject -- skills/SKILL.md requires FormBuilder constructor injection.
  constructor(formBuilder: FormBuilder) {
    this.fb = formBuilder;
    this.form = formBuilder.nonNullable.group({ version: [
        null as number | null,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(1000000)
        ]
      ], effectiveFrom: [
        '',
        Validators.required
      ], effectiveThrough: [''], approvalReference: [
        '',
        [
          Validators.required,
          Validators.maxLength(1000)
        ]
      ], rules: formBuilder.array<ReturnType<AnpaPolicyDialogComponent['newRule']>>([]), confirmed: [
        false,
        Validators.requiredTrue
      ] });
  }
  newRule() {
    return this.fb.nonNullable.group({ category: [
        '' as Category | '',
        Validators.required
      ], historicalOrigin: [
        '' as Classification | '',
        Validators.required
      ], currentClassification: [
        '' as Classification | '',
        Validators.required
      ], sourceAccountId: [
        null as number | null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ], nativeMappingId: [null as number | null], destinationAccountId: [
        null as number | null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ], expenseEligible: [
        null as boolean | null,
        Validators.required
      ], reclassifiedExpenseEligible: [null as boolean | null], taxComponentId: [null as number | null] });
  }
  addRule(): void {
    if (this.form.controls.rules.length < 100) this.form.controls.rules.push(this.newRule());
  }
  removeRule(index: number): void {
    this.form.controls.rules.removeAt(index);
  }
  close(): void {
    this.ref.close(false);
  }
  get valid(): boolean {
    const v = this.form.getRawValue();
    if (!this.form.valid || !v.rules.length || !Number.isInteger(v.version) || ![
        3,
        4
      ].includes(this.data.loan.accountingRule)) return false;
    const iso = (s: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
    if (
      !iso(v.effectiveFrom) ||
      v.effectiveFrom < '1900-01-01' ||
      (v.effectiveThrough && (!iso(v.effectiveThrough) || v.effectiveThrough < v.effectiveFrom)) ||
      !v.approvalReference.trim() ||
      /[\x00-\x1f\x7f]/.test(v.approvalReference)
    )
      return false;
    const identities = new Set<string>();
    return v.rules.every((r) => {
      const id = [
        r.category,
        r.historicalOrigin,
        r.currentClassification,
        r.sourceAccountId
      ].join(':');
      if (identities.has(id)) return false;
      identities.add(id);
      return r.sourceAccountId !== r.destinationAccountId && [
          r.sourceAccountId,
          r.destinationAccountId
        ].every((n) => Number.isSafeInteger(n) && n! > 0) && [
          r.nativeMappingId,
          r.taxComponentId
        ].every(
          (n) => n === null || (Number.isSafeInteger(n) && n > 0)
        ) && (r.category === 'ITBMS') === (r.taxComponentId !== null);
    });
  }
  submit(): void {
    if (!this.valid || this.busy() || this.submitted() || !this.access.allows('MANAGE_ANPA_ACCOUNTING_POLICY')) return;
    const v = this.form.getRawValue();
    this.busy.set(true);
    this.submitted.set(true);
    this.error.set('');
    this.api
      .createAccountingPolicyDraft(this.data.loanId, {
        idempotencyKey: this.key,
        policy: {
          version: v.version!,
          accountingRule: this.data.loan.accountingRule,
          currency: this.data.loan.currency,
          effectiveFrom: v.effectiveFrom,
          effectiveThrough: v.effectiveThrough || null,
          approvalReference: v.approvalReference.trim(),
          rules: v.rules as PolicyRule[]
        }
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (record) => {
          this.busy.set(false);
          this.ref.close({ id: record.id });
        },
        error: (error) => {
          this.busy.set(false);
          this.error.set(anpaErrorKey(error, true));
          if (anpaSaveRejected(error)) {
            this.submitted.set(false);
            this.key = crypto.randomUUID();
          }
        }
      });
  }
}
