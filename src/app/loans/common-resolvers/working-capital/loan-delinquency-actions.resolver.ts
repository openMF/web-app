/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LoanBaseResolver } from '../loan-base.resolver';
import { LoansService } from 'app/loans/loans.service';

@Injectable({
  providedIn: 'root'
})
export class LoanDelinquencyRangeScheduleResolver extends LoanBaseResolver {
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
      if (this.isWorkingCapital) {
        return this.loansService.getWorkingCapitalLoanDelinquencyRangeSchedule(loanId);
      }
    }
  }
}
