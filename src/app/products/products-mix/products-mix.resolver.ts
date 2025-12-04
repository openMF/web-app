/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Products Mix data resolver.
 */
@Injectable()
export class ProductsMixResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the products mix data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getProductMixes();
  }
}
