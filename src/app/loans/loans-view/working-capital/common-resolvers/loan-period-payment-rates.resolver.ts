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
import { LoanBaseResolver } from 'app/loans/common-resolvers/loan-base.resolver';
import { LoansService } from 'app/loans/loans.service';
import { PeriodPaymentRateChange } from 'app/loans/models/working-capital-loan-account.model';

/** rxjs Imports */
import { Observable, of } from 'rxjs';

/**
 * Working Capital Period Payment Rates resolver.
 */
@Injectable()
export class LoanPeriodPaymentRatesResolver extends LoanBaseResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the Loans data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<PeriodPaymentRateChange[]> {
    this.initialize(route);
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    if (!isNaN(+loanId)) {
      if (this.isWorkingCapital) {
        return this.loansService.getWorkingCapitalPeriodPaymentRates(loanId);
      }
    }
    return of([]);
  }
}
