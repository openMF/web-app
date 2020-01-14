/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Fixed Deposit Product data resolver.
 */
@Injectable()
export class FixedDepositProductResolver implements Resolve<Object> {

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) { }

  /**
   * Returns the fixed deposit product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const fixedDepositProductId = route.paramMap.get('id');
    return this.productsService.getFixedDepositProduct(fixedDepositProductId);
  }

}
