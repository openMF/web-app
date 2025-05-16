/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Share products data resolver.
 */
@Injectable()
export class ShareProductsResolver {
  /**
   *
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the share products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.productsService.getShareProducts();
  }
}
