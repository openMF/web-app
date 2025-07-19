/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoanProductsService } from '@fineract/client';

/**
 * Loan products data resolver.
 */
@Injectable()
export class LoanProductsResolver {
  /**
   * @param {LoanProductsService} loanProductsService Loan Products service.
   */
  constructor(private loanProductsService: LoanProductsService) {}

  /**
   * Returns the loan products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.loanProductsService.retrieveAllLoanProducts();
  }
}
