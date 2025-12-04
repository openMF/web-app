/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Recurring Deposit Products data resolver.
 */
@Injectable()
export class RecurringDepositProductsResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the recurring deposit products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getRecurringDepositProducts();
  }
}
