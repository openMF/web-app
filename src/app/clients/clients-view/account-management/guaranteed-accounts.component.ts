/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AccountManagementAccess } from './account-management-access.service';
import { AccountRelationshipsService } from './account-relationships.service';
import { GuaranteeSweepsService } from './guarantee-sweeps.service';
import { ClientSection, errorKey, positiveAmount, positiveId, resource } from './account-management.state';
import { SweepCapabilities, GuaranteeSource, GuaranteeLoan, Decision, NativeSavings } from './account-management.model';
import { AccountStatusComponent } from './account-status.component';
import { AccountMoneyPipe } from './account-money.pipe';
import { ResourceStateComponent } from './resource-state.component';
import { GuaranteeHistoryComponent } from './guarantee-history.component';

@Component({
  selector: 'mifosx-guaranteed-accounts',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    AccountStatusComponent,
    AccountMoneyPipe,
    ResourceStateComponent,
    GuaranteeHistoryComponent
  ],
  templateUrl: './guaranteed-accounts.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuaranteedAccountsComponent extends ClientSection {
  @ViewChild(GuaranteeHistoryComponent) private history?: GuaranteeHistoryComponent;
  readonly access = inject(AccountManagementAccess);
  private readonly api = inject(GuaranteeSweepsService);
  private readonly accounts = inject(AccountRelationshipsService);
  private readonly selection$ = new Subject<void>();
  private readonly previewChanged$ = new Subject<void>();
  readonly capabilities = resource<SweepCapabilities>();
  readonly sources = resource<GuaranteeSource[]>();
  readonly loans = resource<GuaranteeLoan[]>();
  readonly preview = resource<Decision>();
  readonly native = resource<NativeSavings>();
  readonly loan = resource<{ id: number; clientId: number; currency: { code: string; decimalPlaces: number } }>();
  readonly selectedLoan = signal<number | null>(null);
  readonly form;
  constructor() {
    const fb = inject(FormBuilder);
    super();
    this.form = fb.nonNullable.group({ savingsAccountId: [
        0,
        Validators.min(1)
      ], loanId: [
        0,
        Validators.min(1)
      ], amount: [
        '',
        Validators.required
      ] });
  }
  protected reset(): void {
    this.capabilities.set({ data: null, loading: false, error: null });
    this.selection$.next();
    this.previewChanged$.next();
    this.selectedLoan.set(null);
    this.form.reset();
    for (const state of [
      this.sources,
      this.loans,
      this.preview,
      this.native,
      this.loan
    ]) state.set({ data: null, loading: false, error: null });
    if (!positiveId(this.clientId) || !this.access.has('READ_GUARANTEE_SWEEP')) return;
    this.scoped(this.form.controls.savingsAccountId.valueChanges).subscribe(() => this.selectionChanged());
    this.scoped(this.form.controls.loanId.valueChanges).subscribe(() => this.selectionChanged());
    this.scoped(this.form.controls.amount.valueChanges).subscribe(() => {
      this.previewChanged$.next();
      this.preview.set({ data: null, loading: false, error: null });
    });
    this.capabilities.set({ data: null, loading: true, error: null });
    this.scoped(this.api.template()).subscribe({
      next: (data) => {
        this.capabilities.set({ data, loading: false, error: null });
        this.loadSources();
        this.loadLoans();
      },
      error: (error) => this.capabilities.set({ data: null, loading: false, error: errorKey(error, true) })
    });
  }
  reload(): void {
    this.ngOnChanges();
  }
  loadSources(): void {
    this.page(this.sources, this.api.sources(this.clientId, this.sources().data?.at(-1)?.savingsAccountId || 0));
  }
  loadLoans(): void {
    this.page(this.loans, this.api.loans(this.clientId, this.loans().data?.at(-1)?.loanId || 0));
  }
  selectionChanged(): void {
    this.selection$.next();
    this.previewChanged$.next();
    this.preview.set({ data: null, loading: false, error: null });
    this.native.set({ data: null, loading: false, error: null });
    this.loan.set({ data: null, loading: false, error: null });
    const { savingsAccountId, loanId } = this.form.getRawValue();
    this.selectedLoan.set(this.loans().data?.some((row) => row.loanId === loanId) ? loanId : null);
    if (
      this.sources().data?.some((row) => row.savingsAccountId === savingsAccountId) &&
      this.access.has('READ_SAVINGSACCOUNT')
    )
      this.read(this.native, this.accounts.native(this.clientId, savingsAccountId).pipe(takeUntil(this.selection$)));
    if (this.selectedLoan() && this.access.has('READ_LOAN'))
      this.read(this.loan, this.api.nativeLoan(this.clientId, loanId).pipe(takeUntil(this.selection$)));
  }
  get validPreview(): boolean {
    const value = this.form.getRawValue(),
      precision = this.loan().data?.currency?.decimalPlaces;
    return (
      this.capabilities().data?.eligibilityDiagnostics === true &&
      this.access.has('READ_GUARANTEE_SWEEP') &&
      !!this.sources().data?.some((row) => row.savingsAccountId === value.savingsAccountId) &&
      this.selectedLoan() === value.loanId &&
      precision != null &&
      positiveAmount(value.amount, precision)
    );
  }
  evaluate(): void {
    if (!this.validPreview || this.preview().loading) return;
    const value = this.form.getRawValue();
    this.read(
      this.preview,
      this.api
        .preview(
          this.clientId,
          value.loanId,
          value.savingsAccountId,
          value.amount,
          this.loan().data.currency.decimalPlaces
        )
        .pipe(
          takeUntil(this.previewChanged$),
          tap(() => this.history?.refreshAudit())
        )
    );
  }
}
