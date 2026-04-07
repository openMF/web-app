/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { LoanTransactionsService } from '@fineract/client';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Loans Account Transaction Template data resolver.
 */
@Injectable()
export class LoansAccountTransactionTemplateResolver {
  /**
   * @param {LoanTransactionsService} loanTransactionsService Loan transactions service.
   */
  constructor(private loanTransactionsService: LoanTransactionsService) {}

  /**
   * Returns the Loans Account Transaction Template data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId');
    const transactionId = route.paramMap.get('id');
    return this.loanTransactionsService.retrieveTransactionTemplate({
      loanId: Number(loanId),
      transactionId: Number(transactionId)
    });
  }
}
