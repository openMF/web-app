/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loans Account Transaction Template data resolver.
 */
@Injectable()
export class LoansAccountTransactionTemplateResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the Loans Account Transaction Template data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId');
    const transactionId = route.paramMap.get('id');
    return this.loansService.getLoansAccountTransactionTemplate(loanId, transactionId);
  }
}
