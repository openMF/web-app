/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loans notes data resolver.
 */
@Injectable()
export class LoanDatatableResolver {
  /**
   * @param {LoansService} LoansService Loans service.
   */
  constructor(private loansService: LoansService) {}

  /**
   * Returns the Loans Notes Data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.parent.paramMap.get('loanId');
    const datatableName = route.paramMap.get('datatableName');
    return this.loansService.getLoanDatatable(loanId, datatableName);
  }
}
