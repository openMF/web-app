/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Loan products data resolver.
 */
@Injectable()
export class LoanProductsResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the loan products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getLoanProducts();
  }
}
