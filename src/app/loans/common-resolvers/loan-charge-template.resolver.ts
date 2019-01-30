/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot  } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loan Charge Template data resolver.
 */
@Injectable()
export class LoanChargeTemplateResolver implements Resolve<Object> {

  /**
   * @param {LoansService} LoansService loans service.
   */
  constructor(private loansService: LoansService) {}

  /**
   * Returns the Loan Charge Template.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId');
    return this.loansService.getLoanChargeTemplateResource(loanId);
  }

}
