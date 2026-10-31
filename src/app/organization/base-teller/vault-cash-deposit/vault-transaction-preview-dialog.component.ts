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
import { WithdrawalMoneyPipe } from '../withdrawals/withdrawal-money.pipe';
import { VaultDepositPreview } from './vault-cash-deposit.models';
import { VaultDepositBreakdownComponent } from './vault-deposit-breakdown.component';
import { vaultBlockerLabel } from './vault-deposit-history.models';

@Component({
  selector: 'mifosx-vault-transaction-preview-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    WithdrawalMoneyPipe,
    VaultDepositBreakdownComponent
  ],
  templateUrl: './vault-transaction-preview-dialog.component.html',
  styleUrls: ['./vault-transaction-preview-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VaultTransactionPreviewDialogComponent {
  readonly data = inject<{ preview: VaultDepositPreview; mismatch: boolean }>(MAT_DIALOG_DATA);
  readonly preview = this.data.preview;

  readonly blockerLabel = vaultBlockerLabel;
}
