import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LoanCollateralService } from '@fineract/client';

@Injectable({
  providedIn: 'root'
})
export class LoanCollateralsResolver {
  /**
   * @param {LoanCollateralService} loanCollateralService Loan Collateral service.
   */
  constructor(private loanCollateralService: LoanCollateralService) {}

  /**
   * Returns the Loans data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    return this.loanCollateralService.retrieveCollateralDetails({
      loanId: Number(loanId)
    });
  }
}
