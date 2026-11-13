/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { Receipt, Reconciliation } from './account-management.model';
import { AccountStatusComponent } from './account-status.component';
import { AccountMoneyPipe } from './account-money.pipe';

@Component({
  selector: 'mifosx-account-transaction-result',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    AccountStatusComponent,
    AccountMoneyPipe
  ],
  templateUrl: './transaction-result.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionResultComponent {
  @Input() receipt: Receipt | null = null;
  @Input() reconciliation: Reconciliation | null = null;
  readonly reconciliationChecks = [
    { field: 'nativeReferencesMatch', label: 'AccountManagement.NativeReferencesMatch' },
    { field: 'repaymentReversed', label: 'AccountManagement.RepaymentReversed' },
    { field: 'savingsReversed', label: 'AccountManagement.SavingsReversed' },
    { field: 'journalEntriesPresent', label: 'AccountManagement.JournalEntriesPresent' },
    { field: 'journalEntriesBalanced', label: 'AccountManagement.JournalEntriesBalanced' },
    { field: 'nativeAccountingVerified', label: 'AccountManagement.NativeAccountingVerified' },
    { field: 'financialRetryAllowed', label: 'AccountManagement.FinancialRetryAllowed' }
  ] as const;
  // The verified BE-09 State enum has no successful repayment state. Unknown future states fail closed.
  get state(): string {
    const state = this.receipt?.state;
    return [
      'PENDING',
      'PROCESSING',
      'BLOCKED_PENDING_POLICY',
      'SKIPPED',
      'FAILED',
      'RECONCILIATION_REQUIRED'
    ].includes(state) ? state : 'UNKNOWN';
  }
}
