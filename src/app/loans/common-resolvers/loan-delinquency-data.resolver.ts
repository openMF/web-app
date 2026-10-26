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
import { LoanBaseResolver } from './loan-base.resolver';

/**
 * Loan Delinquency data resolver.
 */
@Injectable()
export class LoanDelinquencyDataResolver extends LoanBaseResolver {
  private loansService = inject(LoansService);

  constructor() {
    super();
  }
  /**
   * Returns the Loans with Association data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.initialize(route);
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    if (!isNaN(+loanId)) {
      return this.isLoanProduct
        ? this.loansService.getDelinquencyData(loanId)
        : this.loansService.getWorkingCapitalLoanDetails(loanId);
    }
  }
}
