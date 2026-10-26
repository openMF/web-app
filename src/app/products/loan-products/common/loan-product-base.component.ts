/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject } from '@angular/core';
import { LoanProductService } from '../services/loan-product.service';
import { ActivatedRoute, Router } from '@angular/router';

export abstract class LoanProductBaseComponent {
  protected router = inject(Router);
  protected loanProductService = inject(LoanProductService);

  static PRODUCT_TYPE_PARAM: string = 'productType';

  constructor() {}

  getProductTypeLabel(upperCase: boolean): string {
    return upperCase
      ? this.loanProductService.loanProductTypeLabel.toUpperCase()
      : this.loanProductService.loanProductTypeLabel;
  }

  static resolveProductType(route: ActivatedRoute): string {
    return route.snapshot.queryParamMap.get(this.PRODUCT_TYPE_PARAM) || null;
  }

  static resolveProductTypeDefault(route: ActivatedRoute, defaultType: string): string {
    return route.snapshot.queryParamMap.get(this.PRODUCT_TYPE_PARAM) || defaultType;
  }

  protected reload() {
    const url: string = this.router.url.split('?')[0];
    this.router
      .navigateByUrl(`/clients`, { skipLocationChange: true })
      .then(() =>
        this.router.navigate([url], { queryParams: { productType: this.loanProductService.productType.value } })
      );
  }
}
