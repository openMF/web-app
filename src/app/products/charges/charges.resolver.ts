/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Charges data resolver.
 */
@Injectable()
export class ChargesResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getCharges();
  }
}
