/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LOAN_PRODUCT_TYPE, LoanProductType } from 'app/products/loan-products/models/loan-product.model';
import { ActivatedRouteSnapshot } from '@angular/router';
import { LoanAccountPath } from 'app/loans/loans.service';

@Injectable({
  providedIn: 'root'
})
export class LoanBaseResolver {
  productType = new BehaviorSubject<LoanProductType>(LOAN_PRODUCT_TYPE.LOAN);

  constructor() {}

  protected initialize(route: ActivatedRouteSnapshot): void {
    const productType = route.queryParams['productType'];
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

  get loanProductPath(): string {
    return this.isLoanProduct ? 'loanproducts' : 'working-capital-loan-products';
  }

  get loanAccountPath(): LoanAccountPath {
    return this.isLoanProduct ? 'loans' : 'working-capital-loans';
  }
}
