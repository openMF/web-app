/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormatNumberPipe } from '@pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { Breach, NearBreach } from 'app/products/loan-products/models/loan-product.model';

@Component({
  selector: 'mifosx-breach-display',
  templateUrl: './breach-display.component.html',
  styleUrls: ['./breach-display.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreachDisplayComponent {
  @Input() breach: Breach | null = null;
  @Input() nearBreach: NearBreach | null = null;
  @Input() singleRow: boolean = false;

  camalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}
