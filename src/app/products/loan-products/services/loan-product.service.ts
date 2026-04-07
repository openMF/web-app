/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject, Injectable } from '@angular/core';
import { LOAN_PRODUCT_TYPE, LoanProductType } from '../models/loan-product.model';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LoanProductService {
  private translateService = inject(TranslateService);

  productType = new BehaviorSubject<LoanProductType>(LOAN_PRODUCT_TYPE.LOAN);

  constructor() {}

  initialize(productType: string): void {
    if (productType !== null) {
      if (productType === 'loan') {
        this.productType.next(LOAN_PRODUCT_TYPE.LOAN);
      } else if (productType === 'working-capital') {
        this.productType.next(LOAN_PRODUCT_TYPE.WORKING_CAPITAL);
      }
    }
  }

  get isWorkingCapital(): boolean {
    return LOAN_PRODUCT_TYPE.WORKING_CAPITAL === this.productType.value;
  }

  get isLoanProduct(): boolean {
    return LOAN_PRODUCT_TYPE.LOAN === this.productType.value;
  }

  get loanProductTypeLabel(): string {
    return this.isLoanProduct
      ? this.translateService.instant('labels.heading.Loan Product')
      : this.translateService.instant('labels.heading.Working Capital Product');
  }

  get loanProductPath(): string {
    return this.isLoanProduct ? 'loanproducts' : 'working-capital-loan-products';
  }

  get loanAccountPath(): string {
    return this.isLoanProduct ? 'loans' : 'working-capital-loans';
  }

  static productTypeLabel(productType: string): string {
    return productType === 'loan' ? 'labels.heading.Loan Product' : 'labels.heading.Working Capital Product';
  }
}
