/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { WithdrawalMoneyPipe } from '../withdrawals/withdrawal-money.pipe';
import { VaultPreviewCurrency } from './vault-cash-deposit.models';

/** Render server values verbatim, including the original precision of historical snapshots. */
@Component({
  selector: 'mifosx-vault-deposit-breakdown',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTableModule,
    WithdrawalMoneyPipe
  ],
  templateUrl: './vault-deposit-breakdown.component.html',
  styleUrls: ['./vault-deposit-breakdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VaultDepositBreakdownComponent {
  readonly currency = input.required<VaultPreviewCurrency>();
  readonly columns = [
    'value',
    'quantity',
    'subtotal'
  ];
}
