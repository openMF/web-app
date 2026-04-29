/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { LoanProductsService } from '@fineract/client';

/**
 * Products mix template data resolver.
 */
@Injectable()
export class ProductsMixTemplateResolver {
  constructor(private loanProductsService: LoanProductsService) {}

  /**
   * Returns the products mix template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.loanProductsService.retrieveTemplate11({ isProductMixTemplate: true });
  }
}
