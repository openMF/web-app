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
import { ClosingRecord, Money } from './end-of-day-closing.models';
@Component({
  selector: 'mifosx-closing-summary',
  imports: [...STANDALONE_SHARED_IMPORTS],
  templateUrl: './closing-summary.component.html',
  styleUrls: ['./closing-summary.component.scss']
})
export class ClosingSummaryComponent {
  format(value: Money, precision: number): string {
    const text = String(value);
    return (text.startsWith('-') ? '-' : '') + fromUnits(toUnits(text.replace(/^-/, ''), precision), precision);
  }
  @Input({ required: true }) record!: ClosingRecord;
  readonly fields = [
    'declaredCash',
    'selectedChecks',
    'vouchers',
    'expectedTotal',
    'declaredTotal',
    'shortage',
    'overage'
  ] as const;
}
