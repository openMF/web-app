/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Recurring Deposits Account Template resolver.
 */
@Injectable()
export class RecurringDepositProductAndTemplateResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the Recurring Deposits Product and Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.paramMap.get('productId');
    return this.productsService.getRecurringDepositProductAndTemplate(productId);
  }
}
