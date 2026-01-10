/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loans notes resolver.
 */
@Injectable()
export class LoanDocumentsResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the Loans data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    return this.loansService.getLoanDocuments(loanId);
  }
}
