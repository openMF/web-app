import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { LoansService } from '../loans.service';

@Injectable({
  providedIn: 'root'
})
export class LoanCollateralsResolver implements Resolve<boolean> {

  /**
   * @param {LoansService} LoansService Loans service.
   */
  constructor(private loansService: LoansService) { }

  /**
   * Returns the Loans data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    return this.loansService.getLoanCollaterals(loanId);
  }
}
