/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { FixedDepositProductService } from '@fineract/client';

/**
 * Fixed Deposit Product data resolver.
 */
@Injectable()
export class FixedDepositProductResolver {
  constructor(private fixedDepositProductService: FixedDepositProductService) {}

  /**
   * Returns the fixed deposit product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.paramMap.get('productId');
    return this.fixedDepositProductService.retrieveOne20({ productId: +productId });
  }
}
