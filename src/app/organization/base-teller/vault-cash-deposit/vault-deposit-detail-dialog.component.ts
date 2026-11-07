/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EMPTY, Subject, catchError, defer, finalize, startWith, switchMap, tap } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { WithdrawalMoneyPipe } from '../withdrawals/withdrawal-money.pipe';
import { canReadVaultHistory } from './vault-cash-deposit.guard';
import { VaultDepositBreakdownComponent } from './vault-deposit-breakdown.component';
import {
  VaultDepositAudit,
  VaultDepositDetail,
  vaultAttemptStatusLabel,
  vaultBlockerLabel
} from './vault-deposit-history.models';
import { VaultDepositHistoryService, vaultHistoryErrorKey } from './vault-deposit-history.service';

@Component({
  selector: 'mifosx-vault-deposit-detail-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    MatProgressSpinnerModule,
    WithdrawalMoneyPipe,
    VaultDepositBreakdownComponent
  ],
  templateUrl: './vault-deposit-detail-dialog.component.html',
  styleUrls: ['./vault-deposit-detail-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VaultDepositDetailDialogComponent implements OnInit {
  readonly data = inject<{ reference: string }>(MAT_DIALOG_DATA);
  private readonly service = inject(VaultDepositHistoryService);
  private readonly authentication = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<void>();
  private readonly auditRequests = new Subject<void>();
  readonly detail = signal<VaultDepositDetail | null>(null);
  readonly audit = signal<VaultDepositAudit | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly auditLoading = signal(false);
  readonly auditError = signal('');
  readonly receiptLoading = signal(false);
  readonly receiptMessage = signal('');
  readonly statusLabel = vaultAttemptStatusLabel;
  readonly blockerLabel = vaultBlockerLabel;

  private authorized(): boolean {
    return (
      this.authentication.isAuthenticated() &&
      canReadVaultHistory(this.authentication.getCredentials()?.permissions ?? [])
    );
  }

  ngOnInit(): void {
    this.auditRequests
      .pipe(
        switchMap(() =>
          defer(() => {
            this.audit.set(null);
            this.auditError.set('');
            if (!this.authorized() || !this.detail()?.permittedActions.includes('VIEW_AUDIT')) return EMPTY;
            this.auditLoading.set(true);
            return this.service.getAudit(this.data.reference).pipe(
              tap((audit) => {
                if (audit.attemptReference !== this.data.reference) throw new Error('Unexpected audit identity');
                this.audit.set({
                  ...audit,
                  events: [...audit.events].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
                });
              }),
              catchError((error: unknown) => {
                this.auditError.set(vaultHistoryErrorKey(error));
                return EMPTY;
              }),
              finalize(() => this.auditLoading.set(false))
            );
          })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.requests
      .pipe(
        startWith(undefined),
        switchMap(() =>
          defer(() => {
            this.detail.set(null);
            this.audit.set(null);
            this.error.set('');
            this.receiptMessage.set('');
            if (!this.authorized()) {
              this.error.set('vaultDeposit.errors.forbidden');
              return EMPTY;
            }
            this.loading.set(true);
            return this.service.getDetail(this.data.reference).pipe(
              tap((detail) => {
                if (
                  detail.recordKind !== 'DEPOSIT_ATTEMPT' ||
                  detail.attempt.attemptReference !== this.data.reference ||
                  detail.attempt.status !== 'BLOCKED' ||
                  detail.attempt.accountingStatus !== 'NOT_POSTED' ||
                  detail.attempt.executionAllowed !== false ||
                  detail.attempt.transactionId ||
                  detail.receiptEligibility.eligible !== false
                ) {
                  throw new Error('Unsupported deposit lifecycle');
                }
                this.detail.set(detail);
                this.loadAudit();
              }),
              catchError((error: unknown) => {
                this.error.set(vaultHistoryErrorKey(error));
                return EMPTY;
              }),
              finalize(() => this.loading.set(false))
            );
          })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  refresh(): void {
    this.requests.next();
  }
  loadAudit(): void {
    this.auditRequests.next();
  }

  checkReceipt(): void {
    if (!this.authorized() || !this.detail() || this.receiptLoading()) return;
    this.receiptLoading.set(true);
    this.receiptMessage.set('');
    // This authorized read checks eligibility. It cannot manufacture a printable receipt.
    this.service
      .checkReceiptAvailability(this.data.reference)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.receiptLoading.set(false))
      )
      .subscribe({
        next: () => this.receiptMessage.set('vaultDeposit.history.receiptUnsupported'),
        error: (error: unknown) => this.receiptMessage.set(vaultHistoryErrorKey(error))
      });
  }
}
