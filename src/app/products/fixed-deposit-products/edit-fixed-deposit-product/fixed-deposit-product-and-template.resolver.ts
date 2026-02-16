/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { FixedDepositProductService } from '@fineract/client';

/**
 * Fixed Deposits Account Template resolver.
 */
@Injectable()
export class FixedDepositProductAndTemplateResolver {
  constructor(private fixedDepositProductService: FixedDepositProductService) {}

  /**
   * Returns the Fixed Deposits Product and Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.paramMap.get('productId');
    return this.fixedDepositProductService.retrieveOne20({ productId: +productId });
  }
}
