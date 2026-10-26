/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { WithdrawalMoneyPipe } from './withdrawal-money.pipe';
import { Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
import { WithdrawalRecord } from './withdrawal.models';
@Component({
  selector: 'mifosx-withdrawal-summary',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatTableModule,
    WithdrawalMoneyPipe
  ],
  templateUrl: './withdrawal-summary.component.html',
  styleUrls: ['./withdrawal-summary.component.scss']
})
export class WithdrawalSummaryComponent {
  @Input({ required: true }) record!: WithdrawalRecord;
  total(type: 'BANKNOTE' | 'COIN'): string {
    const precision = this.record.account.decimalPlaces;
    return fromUnits(
      this.record.denominations
        .filter((d) => d.denominationType === type)
        .reduce((sum, d) => sum + toUnits(d.lineAmount, precision), 0n),
      precision
    );
  }
}
