/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { LoanChargesService } from '@fineract/client';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Loans Account Charge data resolver.
 */
@Injectable()
export class LoansAccountChargeResolver {
  /**
   * @param {LoanChargesService} loanChargesService Loan charges service.
   */
  constructor(private loanChargesService: LoanChargesService) {}

  /**
   * Returns the Loans Account Charge data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId');
    const chargeId = route.paramMap.get('id');
    return this.loanChargesService.retrieveLoanCharge({
      loanId: Number(loanId),
      loanChargeId: Number(chargeId)
    });
  }
}
