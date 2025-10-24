/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Saving products data resolver.
 */
@Injectable()
export class SavingProductsResolver {
  private productsService = inject(ProductsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   *
   * @param {ProductsService} productsService Products service.
   */
  constructor() {}

  /**
   * Returns the saving products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getSavingProducts();
  }
}
