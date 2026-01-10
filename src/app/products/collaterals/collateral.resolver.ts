/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Charges data resolver.
 */
@Injectable()
export class CollateralResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the products data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const collateralId = route.paramMap.get('id');
    return this.productsService.getCollateral(collateralId);
  }
}
