/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

@Injectable()
export class LoanProductsTemplateResolver {
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the loan products template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getLoanProductsTemplate();
  }
}
