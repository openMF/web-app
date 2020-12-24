/** Angular Imports */
import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';
import { LoansService } from '../../../loans/loans.service';

/**
 * CreditBureau LoanProduct Mapping data resolver.
 */
@Injectable()
export class CreditBureauLoanProductMappingResolver implements Resolve<Object> {

  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService, private  loansService: LoansService) {}

  LoanAccountData: any;
  loanProductId: any;

  /**
   * Gets the LoanProductId from the AccountDetails by LoanId and
   * Returns the CreditBureau-LoanProduct Data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId');
    this.LoanAccountData = this.loansService.getLoanAccountDetails(loanId);
    const loanProductId = this.LoanAccountData.loanProductId;
    return this.systemService.getCreditBureauMappingByLPId(loanId);
  }
}
