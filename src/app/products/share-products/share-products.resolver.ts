/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { ProductsService } from '@fineract/client';

/**
 * Share products data resolver.
 */
@Injectable()
export class ShareProductsResolver {
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the share products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.retrieveAllProducts({ type: 'share' });
  }
}
