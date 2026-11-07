/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
import { CashTransferRecord, denominationTotal, Money } from './cash-transfer.models';
@Component({
  selector: 'mifosx-cash-transfer-summary',
  imports: [...STANDALONE_SHARED_IMPORTS],
  templateUrl: './transfer-summary.component.html'
})
export class CashTransferSummaryComponent {
  @Input({ required: true }) record!: CashTransferRecord;
  format(value: Money, precision: number): string {
    return fromUnits(toUnits(value, precision), precision);
  }
  difference(code: string, precision: number): string {
    const incoming = this.record.inflowsByCurrency.find((t) => t.currencyCode === code);
    const outgoing = this.record.outflowsByCurrency.find((t) => t.currencyCode === code);
    const delta = toUnits(incoming!.amount, precision) - toUnits(outgoing!.amount, precision);
    return (delta < 0n ? '-' : '') + fromUnits(delta < 0n ? -delta : delta, precision);
  }
  readonly denominationTotal = denominationTotal;
}
