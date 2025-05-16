/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Saving products data resolver.
 */
@Injectable()
export class SavingProductsResolver {
  /**
   *
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the saving products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getSavingProducts();
  }
}
