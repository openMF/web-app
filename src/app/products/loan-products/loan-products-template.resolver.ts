/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { LOAN_PRODUCT_TYPE } from './models/loan-product.model';
import { LoanProductService } from './services/loan-product.service';

@Injectable()
export class LoanProductsTemplateResolver {
  private productsService = inject(ProductsService);
  private loanProductService = inject(LoanProductService);

  /**
   * Returns the loan products template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productType = route.queryParams['productType'];
    if (productType === 'loan') {
      this.loanProductService.initialize(LOAN_PRODUCT_TYPE.LOAN);
    } else {
      this.loanProductService.initialize(LOAN_PRODUCT_TYPE.WORKING_CAPITAL);
    }
    return this.productsService.getLoanProductsTemplate(this.loanProductService.loanProductPath);
  }
}
