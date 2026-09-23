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
import { forkJoin, map, Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { LoanBaseResolver } from '../loan-base.resolver';

/**
 * Template behind the Working Capital discount fee adjustment form.
 *
 * Three calls, because no single endpoint answers the whole form. The
 * `discountFeeAdjustment` template carries the classification options and the
 * currency but nothing else: it quotes no amount, and it does not serve the
 * payment type options even though the command accepts payment details. The
 * discount fee transaction supplies the amount and date the adjustment is
 * bounded by, and the payment types are taken from the `repayment` template,
 * which is where Working Capital exposes them - the same detour
 * `LoansAccountTransactionTemplateResolver` takes for the adjust form.
 */
@Injectable({
  providedIn: 'root'
})
export class WorkingCapitalDiscountFeeAdjustmentTemplateResolver extends LoanBaseResolver {
  private loansService = inject(LoansService);

  constructor() {
    super();
  }

  /**
   * Returns the discount fee transaction combined with the options the form needs.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.initialize(route);
    const loanId = route.paramMap.get('loanId') || route.parent?.paramMap.get('loanId');
    const transactionId = route.paramMap.get('id') || route.parent?.paramMap.get('id');
    return forkJoin({
      transaction: this.loansService.getLoansAccountTransaction('working-capital-loans', loanId, transactionId),
      template: this.loansService.getWorkingCapitalLoanTransactionTemplate(loanId, 'discountFeeAdjustment'),
      repaymentTemplate: this.loansService.getWorkingCapitalLoanTransactionTemplate(loanId, 'repayment')
    }).pipe(
      map(({ transaction, template, repaymentTemplate }) => ({
        transaction,
        currency: transaction?.currency ?? template?.currency,
        classificationOptions: template?.classificationOptions ?? [],
        paymentTypeOptions: repaymentTemplate?.paymentTypeOptions ?? []
      }))
    );
  }
}
