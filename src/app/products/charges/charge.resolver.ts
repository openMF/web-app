/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';

/**
 * Charge data resolver.
 */
@Injectable()
export class ChargeResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the charge data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const chargeId = route.paramMap.get('id');
    return this.productsService.getCharge(chargeId);
  }
}
