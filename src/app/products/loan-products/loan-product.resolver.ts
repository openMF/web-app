/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { LoanProductsService } from '@fineract/client';

/**
 * Loan Product data resolver.
 */
@Injectable()
export class LoanProductResolver {
  constructor(private loanProductsService: LoanProductsService) {}

  /**
   * Returns the loan product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.paramMap.get('productId');
    return this.loanProductsService.retrieveLoanProductDetails({ productId: +productId });
  }
}
