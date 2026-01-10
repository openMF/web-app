/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Saving Product data resolver.
 */
@Injectable()
export class SavingProductResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the saving product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.paramMap.get('productId');
    return this.productsService.getSavingProduct(productId);
  }
}
