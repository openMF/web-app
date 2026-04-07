/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoanInterestPauseService } from '@fineract/client';

/**
 * Clients data resolver.
 */
@Injectable()
export class LoanTermVariationsResolver {
  /**
   * @param {LoanInterestPauseService} loanInterestPauseService Loan Interest Pause service.
   */
  constructor(private loanInterestPauseService: LoanInterestPauseService) {}

  /**
   * Returns the Loans with Association data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    if (!isNaN(+loanId)) {
      return this.loanInterestPauseService.retrieveInterestPauses({
        loanId: Number(loanId)
      });
    }
  }
}
