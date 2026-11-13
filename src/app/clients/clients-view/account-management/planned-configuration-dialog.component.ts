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
import { Subject, takeUntil, finalize } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ProductPolicyService } from 'app/products/saving-products/product-editor/product-policy.service';
import { PolicyVersion } from 'app/products/saving-products/product-editor/product-policy.model';
import { PlannedAccountsService } from './planned-accounts.service';
import { AccountManagementAccess } from './account-management-access.service';
import { Arrangement, PlannedConfiguration } from './account-management.model';
import { errorKey, positiveAmount, positiveId, resource, validName } from './account-management.state';
import { AccountStatusComponent } from './account-status.component';
import { ResourceStateComponent } from './resource-state.component';

@Component({
  selector: 'mifosx-planned-configuration-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    ResourceStateComponent,
    AccountStatusComponent
  ],
  templateUrl: './planned-configuration-dialog.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannedConfigurationDialogComponent {
  readonly data = inject<{ clientId: number; arrangement?: Arrangement }>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<PlannedConfigurationDialogComponent>);
  private readonly api = inject(PlannedAccountsService);
  private readonly policies = inject(ProductPolicyService);
  private readonly access = inject(AccountManagementAccess);
  private readonly destroyRef = inject(DestroyRef);
  private readonly policyChanged$ = new Subject<void>();
  readonly policy = resource<PolicyVersion>();
  readonly busy = signal(false);
  readonly message = signal<string | null>(null);
  private readonly id = this.data.arrangement?.id || crypto.randomUUID();
  readonly form;
  constructor() {
    const fb = inject(FormBuilder);
    const c = this.data.arrangement?.configuration;
    const positive = [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^[1-9][0-9]*$/)
    ];
    this.form = fb.nonNullable.group({
      savingsProductId: [
        c?.savingsProductId || (null as number),
        positive
      ],
      policyVersion: [
        c?.policyVersion || (null as number),
        positive
      ],
      employerClientId: [
        c?.employerClientId || (null as number),
        positive
      ],
      arrangementReference: [
        c?.arrangementReference || '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      contributionAmount: [
        c?.contributionAmount || '',
        Validators.required
      ],
      frequencyUnit: [
        c?.frequencyUnit || ('MONTHS' as PlannedConfiguration['frequencyUnit']),
        Validators.required
      ],
      frequencyInterval: [
        c?.frequencyInterval || 1,
        [
          ...positive,
          Validators.max(36500)
        ]
      ],
      shortMonthRule: [
        c?.shortMonthRule || ('' as PlannedConfiguration['shortMonthRule']),
        c?.frequencyUnit && c.frequencyUnit !== 'MONTHS' ? [] : Validators.required
      ],
      startDate: [
        c?.startDate || '',
        Validators.required
      ],
      termDays: [
        c?.termDays || (null as number),
        [
          ...positive,
          Validators.max(36500)
        ]
      ],
      maturityDate: [
        c?.maturityDate || '',
        Validators.required
      ],
      status: [
        c?.status || ('CONFIGURATION_ONLY' as PlannedConfiguration['status']),
        Validators.required
      ]
    });
    if (c) {
      this.form.controls.savingsProductId.disable();
      this.form.controls.employerClientId.disable();
    }
    this.form.controls.frequencyUnit.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((unit) => {
      const rule = this.form.controls.shortMonthRule;
      rule.setValidators(unit === 'MONTHS' ? Validators.required : []);
      rule.updateValueAndValidity();
    });
    for (const control of [
      this.form.controls.savingsProductId,
      this.form.controls.policyVersion
    ])
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.policyChanged$.next();
        this.policy.set({ data: null, loading: false, error: null });
      });
  }
  loadPolicy(): void {
    const value = this.form.getRawValue();
    if (
      this.policy().loading ||
      !positiveId(value.savingsProductId) ||
      !positiveId(value.policyVersion) ||
      !this.access.has('READ_SAVINGS_PRODUCT_POLICY')
    )
      return;
    this.policy.set({ data: null, loading: true, error: null });
    this.policies
      .review(value.savingsProductId, value.policyVersion)
      .pipe(takeUntil(this.policyChanged$), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (review) => {
          const current = this.form.getRawValue();
          if (current.savingsProductId !== value.savingsProductId || current.policyVersion !== value.policyVersion)
            return;
          const policy = review.proposed;
          this.policy.set(
            policy?.savingsProductId === value.savingsProductId &&
              policy.version === value.policyVersion &&
              policy.status === 'ACTIVE' &&
              policy.checkerId != null &&
              policy.policy.purpose === 'PLANNED_MAIN'
              ? { data: policy, loading: false, error: null }
              : { data: null, loading: false, error: 'AccountManagement.ApprovedPlannedPolicyRequired' }
          );
        },
        error: (error) => this.policy.set({ data: null, loading: false, error: errorKey(error) })
      });
  }
  get cancelling(): boolean {
    return !!this.data.arrangement && this.form.controls.status.value === 'CANCELLED';
  }
  get valid(): boolean {
    if (this.cancelling) {
      const existing = this.data.arrangement;
      return (
        existing.clientId === this.data.clientId &&
        positiveId(existing.revision) &&
        existing.configuration.status === 'CONFIGURATION_ONLY' &&
        existing.savingsAccountId == null
      );
    }
    const c = this.form.getRawValue(),
      p = this.policy().data;
    const start = /^\d{4}-\d{2}-\d{2}$/.test(c.startDate) ? new Date(c.startDate + 'T00:00:00Z') : null;
    const maturity = /^\d{4}-\d{2}-\d{2}$/.test(c.maturityDate) ? new Date(c.maturityDate + 'T00:00:00Z') : null;
    return (
      this.form.valid &&
      c.status === 'CONFIGURATION_ONLY' &&
      !!p &&
      p.savingsProductId === c.savingsProductId &&
      p.version === c.policyVersion &&
      positiveId(c.employerClientId) &&
      c.employerClientId !== this.data.clientId &&
      validName(c.arrangementReference) &&
      positiveAmount(c.contributionAmount, Number(p.coreSettings['currency_digits'])) &&
      !!start &&
      !!maturity &&
      Number.isFinite(start.getTime()) &&
      Number.isFinite(maturity.getTime()) &&
      start.toISOString().slice(0, 10) === c.startDate &&
      maturity.toISOString().slice(0, 10) === c.maturityDate &&
      start.getUTCFullYear() >= 1900 &&
      maturity.getUTCFullYear() <= 2200 &&
      maturity.getTime() - start.getTime() === c.termDays * 86400000 &&
      (p.policy.freezing !== 'TERM' || p.policy.freezingTermDays === c.termDays)
    );
  }
  save(): void {
    if (!this.valid || this.busy() || !this.access.has('CONFIGURE_PLANNED_SAVINGS')) return;
    this.busy.set(true);
    this.ref.disableClose = true;
    this.message.set(null);
    const configuration: PlannedConfiguration = this.cancelling
      ? { ...this.data.arrangement.configuration, status: 'CANCELLED' }
      : this.form.getRawValue();
    if (configuration.frequencyUnit !== 'MONTHS') delete configuration.shortMonthRule;
    this.api
      .saveArrangement(this.data.clientId, this.id, this.data.arrangement?.revision || 0, configuration)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy.set(false);
          this.ref.disableClose = false;
        })
      )
      .subscribe({ next: () => this.ref.close(true), error: (error) => this.message.set(errorKey(error)) });
  }
}
