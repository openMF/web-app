/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { LoanProductsService } from '@fineract/client';

/**
 * Loan product and template data resolver.
 */
@Injectable()
export class LoanProductAndTemplateResolver {
  constructor(private loanProductsService: LoanProductsService) {}

  /**
   * Returns the loan product and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanProductId = route.parent.paramMap.get('productId');
    return this.loanProductsService.retrieveLoanProductDetails({ productId: +loanProductId });
  }
}
