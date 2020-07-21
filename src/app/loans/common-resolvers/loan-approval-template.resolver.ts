/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot  } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * Loan Approval Template data resolver.
 */
@Injectable()
export class LoanApprovalTemplateResolver implements Resolve<Object> {

  /**
   * @param {LoansService} LoansService loans service.
   */
  constructor(private loansService: LoansService) {}

  /**
   * Returns the Loan Approval Template.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.parent.paramMap.get('loanId');
    return this.loansService.getLoanApprovalTemplate(loanId);
  }

}
