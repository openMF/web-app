/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { ProductsService } from '@fineract/client';

/**
 * Share Product data resolver.
 */
@Injectable()
export class ShareProductResolver {
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the share product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.paramMap.get('productId');
    return this.productsService.retrieveProduct({ productId: +productId, type: 'share' });
  }
}
