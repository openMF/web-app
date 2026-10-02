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
import { LoansService } from '../loans.service';
import { LoanBaseResolver } from './loan-base.resolver';

/**
 * Loans Account Transaction Template data resolver.
 */
@Injectable()
export class LoansAccountTransactionTemplateResolver extends LoanBaseResolver {
  private loansService = inject(LoansService);

  constructor() {
    super();
  }

  /**
   * Returns the Loans Account Transaction Template data.
   *
   * The Term Loan transaction endpoint answers the template flavour with the
   * payment type options included. Working Capital has no template flavour on
   * its transaction endpoint, so the transaction is combined with the repayment
   * template, which is where its payment type options live.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.initialize(route);
    const loanId = route.paramMap.get('loanId');
    const transactionId = route.paramMap.get('id');
    if (this.isLoanProduct) {
      return this.loansService.getLoansAccountTransactionTemplate(loanId, transactionId);
    }
    return forkJoin({
      transaction: this.loansService.getLoansAccountTransaction('working-capital-loans', loanId, transactionId),
      template: this.loansService.getWorkingCapitalLoanTransactionTemplate(loanId, 'repayment')
    }).pipe(
      map(({ transaction, template }) => ({
        ...transaction,
        paymentTypeOptions: template?.paymentTypeOptions ?? []
      }))
    );
  }
}
