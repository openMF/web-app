/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Fixed Deposit Product component.
 */
@Component({
  selector: 'mifosx-view-fixed-deposit-product',
  templateUrl: './view-fixed-deposit-product.component.html',
  styleUrls: ['./view-fixed-deposit-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewFixedDepositProductComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  fixedDepositDatatables: any = [];

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { fixedDepositDatatables: any }) => {
      this.fixedDepositDatatables = [];
      data.fixedDepositDatatables.forEach((datatable: any) => {
        if (datatable.entitySubType === 'Fixed Deposit') {
          this.fixedDepositDatatables.push(datatable);
        }
      });
    });
  }
}
