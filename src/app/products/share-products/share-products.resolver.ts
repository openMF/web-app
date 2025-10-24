/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Share products data resolver.
 */
@Injectable()
export class ShareProductsResolver {
  private productsService = inject(ProductsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   *
   * @param {ProductsService} productsService Products service.
   */
  constructor() {}

  /**
   * Returns the share products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getShareProducts();
  }
}
