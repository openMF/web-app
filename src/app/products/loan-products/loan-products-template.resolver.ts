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
    this.loanProductService.initialize(route.queryParams['productType']);
    return this.productsService.getLoanProductsTemplate(this.loanProductService.loanProductPath);
  }
}
