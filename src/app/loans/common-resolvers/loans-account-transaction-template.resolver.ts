/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loans Account Transaction Template data resolver.
 */
@Injectable()
export class LoansAccountTransactionTemplateResolver implements Resolve<Object> {

  /**
   * @param {LoansService} LoansService Loans service.
   */
  constructor(private loansService: LoansService) { }

  /**
   * Returns the Loans Account Transaction Template data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanAccountId = route.parent.parent.parent.paramMap.get('loanId');
    const transactionId = route.paramMap.get('id');
    return this.loansService.getLoansAccountTransactionTemplate(loanAccountId, transactionId);
  }

}
