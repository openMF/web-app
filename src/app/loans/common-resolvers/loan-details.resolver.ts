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
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { LOAN_PRODUCT_TYPE } from 'app/products/loan-products/models/loan-product.model';

/**
 * Clients data resolver.
 */
@Injectable()
export class LoanDetailsResolver {
  private loansService = inject(LoansService);
  private loanProductService = inject(LoanProductService);

  /**
   * Returns the Loans with Association data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    const productType = route.queryParams['productType'];
    const resolvedProductType =
      productType === LOAN_PRODUCT_TYPE.WORKING_CAPITAL ? LOAN_PRODUCT_TYPE.WORKING_CAPITAL : LOAN_PRODUCT_TYPE.LOAN;
    this.loanProductService.initialize(resolvedProductType);
    if (!isNaN(+loanId)) {
      if (resolvedProductType === LOAN_PRODUCT_TYPE.LOAN) {
        return this.loansService.getLoanAccountAssociationDetails(loanId);
      } else {
        return this.loansService.getWorkingCapitalLoanDetails(loanId);
      }
    }
  }
}
