/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from '../common/loan-product-base.component';

@Component({
  selector: 'mifosx-view-loan-product',
  templateUrl: './view-loan-product.component.html',
  styleUrls: ['./view-loan-product.component.scss'],
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
export class ViewLoanProductComponent extends LoanProductBaseComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  loanProductDatatables: any = [];

  constructor() {
    super();
    const productType = this.route.snapshot.queryParamMap.get('productType') || null;
    if (productType) {
      this.loanProductService.initialize(productType);
    }

    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanProductDatatables: any }) => {
      this.loanProductDatatables = data.loanProductDatatables;
    });
  }
}
