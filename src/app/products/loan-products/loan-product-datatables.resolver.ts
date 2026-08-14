/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';
import { Observable } from 'rxjs';
import { LoanProductService } from './services/loan-product.service';

@Injectable({
  providedIn: 'root'
})
export class LoanProductDatatablesResolver {
  private systemService = inject(SystemService);

  /**
   * Returns datatables registered for the current loan product entity.
   * Term loan products use `m_product_loan`; working capital products use `m_wc_loan_product`.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getEntityDatatables(LoanProductService.appTableFor(route.queryParams['productType']));
  }
}
