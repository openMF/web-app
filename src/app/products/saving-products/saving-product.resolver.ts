/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { SavingsProductService } from '@fineract/client';

/**
 * Saving Product data resolver.
 */
@Injectable()
export class SavingProductResolver {
  constructor(private savingsProductService: SavingsProductService) {}

  /**
   * Returns the saving product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.paramMap.get('productId');
    return this.savingsProductService.retrieveOne27({ productId: +productId });
  }
}
