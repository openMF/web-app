/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';
import { LOAN_PRODUCT_TYPE } from 'app/products/loan-products/models/loan-product.model';

/**
 * loan datatables resolver.
 */
@Injectable()
export class LoanDatatablesResolver {
  private loansService = inject(LoansService);

  /**
   * Returns datatables registered for the current loan entity.
   * Term loans use `m_loan`; working capital loans use `m_wc_loan`.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const appTable = route.queryParams['productType'] === LOAN_PRODUCT_TYPE.WORKING_CAPITAL ? 'm_wc_loan' : 'm_loan';
    return this.loansService.getLoanDataTables(appTable);
  }
}
