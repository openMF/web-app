/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { SavingsProductService } from '@fineract/client';

/**
 * Saving product and template data resolver.
 */
@Injectable()
export class SavingProductAndTemplateResolver {
  constructor(private savingsProductService: SavingsProductService) {}

  /**
   * Returns the saving product and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.paramMap.get('productId');
    return this.savingsProductService.retrieveOne27({ productId: +productId });
  }
}
