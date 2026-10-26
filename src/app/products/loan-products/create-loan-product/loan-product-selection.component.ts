/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { PRODUCT_CARDS } from '../wizard/loan-product.config';

@Component({
  selector: 'mifosx-loan-product-selection',
  templateUrl: './loan-product-selection.component.html',
  styleUrls: ['./loan-product-selection.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanProductSelectionComponent {
  productCards = PRODUCT_CARDS;
}
