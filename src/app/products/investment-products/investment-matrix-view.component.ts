/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { RateMatrix } from './investment-product.models';
@Component({
  selector: 'mifosx-investment-matrix-view',
  standalone: true,
  imports: [SharedModule],
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="investment-scroll" tabindex="0" [attr.aria-label]="'Investment.matrix' | translate">
      <table class="investment-matrix">
        <caption>
          {{
            'Investment.annualRate' | translate
          }}
          ·
          {{
            matrix.currencyCode
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">{{ 'Investment.amountRange' | translate }}</th>
            @for (term of matrix.termBands; track $index) {
              <th scope="col">{{ term.minimumDays }}–{{ term.maximumDays }} {{ 'labels.inputs.Days' | translate }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (amount of matrix.amountBands; track $index; let a = $index) {
            <tr>
              <th scope="row">
                ≥ {{ amount.lower }} / {{ amount.upperInclusive ? '≤' : '&lt;' }}
                {{ amount.upper ?? ('Investment.unbounded' | translate) }}
              </th>
              @for (term of matrix.termBands; track $index; let t = $index) {
                <td>{{ rate(a, t) ?? ('Investment.unknown' | translate) }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class InvestmentMatrixViewComponent {
  @Input({ required: true }) matrix: RateMatrix;
  rate(amount: number, term: number) {
    return this.matrix.cells.find((cell) => cell.amountBand === amount && cell.termBand === term)?.annualRatePercent;
  }
}
