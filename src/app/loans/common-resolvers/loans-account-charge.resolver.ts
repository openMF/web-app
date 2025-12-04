/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loans Account Charge data resolver.
 */
@Injectable()
export class LoansAccountChargeResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the Loans Account Charge data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId');
    const chargeId = route.paramMap.get('id');
    return this.loansService.getLoansAccountCharge(loanId, chargeId);
  }
}
