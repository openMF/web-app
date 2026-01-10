/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

@Injectable()
export class RecurringDepositProductsTemplateResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the recurring deposit products template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getRecurringDepositProductsTemplate();
  }
}
