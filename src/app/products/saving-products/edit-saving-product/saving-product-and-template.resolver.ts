/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Saving product and template data resolver.
 */
@Injectable()
export class SavingProductAndTemplateResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the saving product and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.paramMap.get('productId');
    return this.productsService.getSavingProduct(productId, true);
  }
}
