/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanApprovalMoneyPipe } from './loan-approval-money.pipe';
import { ApprovalLoan, MoneyTotal } from './loan-approval.models';

@Component({
  selector: 'mifosx-loan-approval-confirm-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    LoanApprovalMoneyPipe
  ],
  templateUrl: './loan-approval-confirm-dialog.component.html',
  styles: ['li { margin-block: 8px; overflow-wrap: anywhere; } ul { padding-inline-start: 24px; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanApprovalConfirmDialogComponent {
  readonly data = inject<{
    loans: ApprovalLoan[];
    totals: MoneyTotal[];
    approved: string;
    expected: string;
    excluded: ApprovalLoan[];
  }>(MAT_DIALOG_DATA);
}
