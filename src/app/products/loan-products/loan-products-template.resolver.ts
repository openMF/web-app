/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { LoanProductsService } from '@fineract/client';

@Injectable()
export class LoanProductsTemplateResolver {
  constructor(private loanProductsService: LoanProductsService) {}

  /**
   * Returns the loan products template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.loanProductsService.retrieveTemplate11({});
  }
}
