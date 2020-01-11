/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';

/**
 * Charge data resolver.
 */
@Injectable()
export class ChargeResolver implements Resolve<Object> {

  /**
   * @param {productsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the charge data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const chargeId = route.paramMap.get('id');
    return this.productsService.getCharge(chargeId);
  }

}
