/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '@fineract/client';

/**
 * Clients data resolver.
 */
@Injectable()
export class LoanDetailsResolver {
  /**
   * @param {LoansService} LoansService Loans service.
   */
  constructor(private loansService: LoansService) {}

  /**
   * Returns the Loans with Association data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    if (!isNaN(+loanId)) {
      return this.loansService.retrieveLoan({
        loanId: Number(loanId),
        associations: 'all',
        exclude: 'guarantors,futureSchedule'
      });
    }
  }
}
