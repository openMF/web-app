/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Clients data resolver.
 */
@Injectable()
export class LoanDetailsResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the Loans with Association data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    if (!isNaN(+loanId)) {
      return this.loansService.getLoanAccountAssociationDetails(loanId);
    }
  }
}
