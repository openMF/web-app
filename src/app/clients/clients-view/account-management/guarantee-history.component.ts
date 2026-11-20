/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil, tap } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { GuaranteeSweepsService } from './guarantee-sweeps.service';
import { AccountManagementAccess } from './account-management-access.service';
import { ClientSection, positiveId, resource } from './account-management.state';
import { SweepAudit, Allocation, ReleaseStatus, Receipt, Reconciliation } from './account-management.model';
import { ResourceStateComponent } from './resource-state.component';
import { AccountStatusComponent } from './account-status.component';
import { AccountMoneyPipe } from './account-money.pipe';
import { TransactionResultComponent } from './transaction-result.component';

@Component({
  selector: 'mifosx-guarantee-history',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule,
    ResourceStateComponent,
    AccountStatusComponent,
    AccountMoneyPipe,
    TransactionResultComponent
  ],
  templateUrl: './guarantee-history.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuaranteeHistoryComponent extends ClientSection {
  @Input({ required: true }) loanId: number;
  readonly access = inject(AccountManagementAccess);
  private readonly api = inject(GuaranteeSweepsService);
  private readonly executionChanged$ = new Subject<void>();
  private readonly auditChanged$ = new Subject<void>();
  readonly audit = resource<SweepAudit[]>();
  readonly allocations = resource<Allocation[]>();
  readonly release = resource<ReleaseStatus>();
  readonly receipt = resource<Receipt>();
  readonly reconciliation = resource<Reconciliation>();
  protected reset(): void {
    for (const state of [
      this.audit,
      this.allocations,
      this.release,
      this.receipt,
      this.reconciliation
    ]) state.set({ data: null, loading: false, error: null });
    if (!positiveId(this.clientId) || !positiveId(this.loanId) || !this.access.has('READ_GUARANTEE_SWEEP')) return;
    this.loadAudit();
    this.loadAllocations();
    this.loadRelease();
  }
  loadAudit(): void {
    this.page(
      this.audit,
      this.api.audit(this.clientId, this.loanId, this.audit().data?.at(-1)?.id || 0).pipe(takeUntil(this.auditChanged$))
    );
  }
  refreshAudit(): void {
    if (!positiveId(this.clientId) || !positiveId(this.loanId) || !this.access.has('READ_GUARANTEE_SWEEP')) return;
    this.auditChanged$.next();
    this.audit.update((state) => ({ ...state, loading: false }));
    this.loadAudit();
  }
  loadAllocations(): void {
    this.page(
      this.allocations,
      this.api.allocations(this.clientId, this.loanId, this.allocations().data?.at(-1)?.id || 0)
    );
  }
  loadRelease(): void {
    this.read(this.release, this.api.releaseStatus(this.clientId, this.loanId));
  }
  inspect(id: string): void {
    if (!id || this.receipt().loading) return;
    this.executionChanged$.next();
    this.reconciliation.set({ data: null, loading: false, error: null });
    this.read(this.receipt, this.api.execution(this.clientId, this.loanId, id).pipe(takeUntil(this.executionChanged$)));
  }
  reconcile(): void {
    if (!this.access.has('RECONCILE_GUARANTEE_SWEEP') || !this.receipt().data || this.reconciliation().loading) return;
    this.read(
      this.reconciliation,
      this.api.reconciliation(this.clientId, this.loanId, this.receipt().data.id).pipe(
        takeUntil(this.executionChanged$),
        tap(() => this.refreshAudit())
      )
    );
  }
}
