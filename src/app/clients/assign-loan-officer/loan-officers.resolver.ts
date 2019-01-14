/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoanService } from './loan.service';

/**
 * Loan data resolver.
 */
@Injectable()
export class LoanOfficersResolver implements Resolve<Object> {

  /**
   * @param {LoanService} loanService Loan service.
   */
  constructor(private loanService: LoanService) { }

  /**
   * Returns the loan Officers data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable <any> {
    const loanId = route.paramMap.get('loanId');
    return this.loanService.getLoanOfficers(loanId);
  }
}
